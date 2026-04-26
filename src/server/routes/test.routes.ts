import { Router } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../utils/prisma.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware.js';
import { createRateLimit } from '../middleware/rateLimit.middleware.js';
import type { Request, Response } from 'express';

const router = Router();
const submitRateLimit = createRateLimit({
  windowMs: 60_000,
  max: 20,
  message: '提交次数过于频繁，请稍后再试',
});

router.get('/templates', async (_req, res) => {
  const templates = await prisma.template.findMany({
    where: { status: 'APPROVED' },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    include: {
      _count: { select: { questions: true } },
    },
  });
  res.json({
    success: true,
    data: templates.map((t) => ({
      ...t,
      questionCount: t._count.questions,
    })),
  });
});

router.get('/templates/:id/questions', async (req, res) => {
  const template = await prisma.template.findUnique({
    where: { id: req.params.id },
    select: { id: true, status: true },
  });

  if (!template || template.status !== 'APPROVED') {
    res.status(404).json({ success: false, error: '测试模板不存在' });
    return;
  }

  const templateQuestions = await prisma.templateQuestion.findMany({
    where: { templateId: req.params.id },
    orderBy: { order: 'asc' },
    include: { question: true },
  });

  const shuffled = [...templateQuestions].sort(() => Math.random() - 0.5);

  const questions = shuffled.map((tq) => ({
    ...tq.question,
    options: JSON.parse(tq.question.options),
  }));

  res.json({ success: true, data: questions });
});

router.post('/submit', submitRateLimit, optionalAuthMiddleware, async (req: Request, res: Response) => {
  const { templateId, answers, guestToken } = req.body;
  if (!templateId || !Array.isArray(answers)) {
    res.status(400).json({ success: false, error: '参数错误' });
    return;
  }

  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template || template.status !== 'APPROVED') {
    res.status(404).json({ success: false, error: '测试模板不存在' });
    return;
  }

  const templateQuestions = await prisma.templateQuestion.findMany({
    where: { templateId },
    include: { question: true },
  });

  const questionMap = new Map(
    templateQuestions.map((tq) => [tq.question.id, JSON.parse(tq.question.options) as Array<{ scores: Record<string, number> }>])
  );

  // 累加维度分数
  const dimScores: Record<string, number> = {};
  answers.forEach((a: { questionId: string; optionIndex: number }) => {
    const opts = questionMap.get(a.questionId);
    if (opts && opts[a.optionIndex]) {
      Object.entries(opts[a.optionIndex].scores).forEach(([dim, val]) => {
        dimScores[dim] = (dimScores[dim] || 0) + (val as number);
      });
    }
  });

  // 判定每个维度的倾向
  const getDim = (left: string, right: string) =>
    (dimScores[left] || 0) >= (dimScores[right] || 0) ? left : right;

  const ei = getDim('E', 'I');
  const sn = getDim('S', 'N');
  const jp = getDim('J', 'P');
  const ah = getDim('A', 'H');
  const baseCode = ei + sn + jp + ah;
  const scoringRules = template.scoringRules ? JSON.parse(template.scoringRules) as { resultMap?: Record<string, string> } : null;
  const personalityId = scoringRules?.resultMap?.[baseCode] || baseCode;

  // 查询人格是否存在
  const personality = await prisma.personality.findUnique({
    where: { id: personalityId },
  });

  if (!personality) {
    res.status(400).json({ success: false, error: '无法计算结果' });
    return;
  }

  const resolvedGuestToken = req.user ? null : (typeof guestToken === 'string' && guestToken.trim()) || randomUUID();
  const result = await prisma.testResult.create({
    data: {
      userId: req.user?.id ?? null,
      guestToken: resolvedGuestToken,
      templateId,
      personalityId,
      scores: JSON.stringify(dimScores),
      answers: JSON.stringify(answers),
    },
    include: { personality: true, template: true },
  });

  res.json({
    success: true,
    data: {
      ...result,
      guestToken: resolvedGuestToken,
      scores: dimScores,
      answers,
      personality: result.personality
        ? {
            ...result.personality,
            traits: JSON.parse(result.personality.traits),
            pixelArt: result.personality.pixelArt ? JSON.parse(result.personality.pixelArt) : null,
          }
        : null,
    },
  });
});

router.post('/claim-results', authMiddleware, async (req, res) => {
  const { guestToken } = req.body;

  if (!guestToken || typeof guestToken !== 'string') {
    res.status(400).json({ success: false, error: '缺少游客标识' });
    return;
  }

  const updated = await prisma.testResult.updateMany({
    where: {
      guestToken,
      userId: null,
    },
    data: {
      userId: req.user!.id,
      guestToken: null,
    },
  });

  res.json({
    success: true,
    data: {
      claimedCount: updated.count,
    },
  });
});

router.get('/results/:id', async (req, res) => {
  const result = await prisma.testResult.findUnique({
    where: { id: req.params.id },
    include: { personality: true, template: true },
  });

  if (!result) {
    res.status(404).json({ success: false, error: '结果不存在' });
    return;
  }

  res.json({
    success: true,
    data: {
      ...result,
      guestToken: result.guestToken,
      scores: JSON.parse(result.scores),
      answers: JSON.parse(result.answers),
      personality: result.personality
        ? {
            ...result.personality,
            traits: JSON.parse(result.personality.traits),
            pixelArt: result.personality.pixelArt ? JSON.parse(result.personality.pixelArt) : null,
          }
        : null,
    },
  });
});

// 查询当前用户的测试历史
router.get('/history', authMiddleware, async (req, res) => {
  const results = await prisma.testResult.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: { personality: true, template: true },
  });

  res.json({
    success: true,
    data: results.map((r) => ({
      ...r,
      scores: JSON.parse(r.scores),
      answers: JSON.parse(r.answers),
      personality: r.personality
        ? {
            ...r.personality,
            traits: JSON.parse(r.personality.traits),
            pixelArt: r.personality.pixelArt ? JSON.parse(r.personality.pixelArt) : null,
          }
        : null,
    })),
  });
});

export default router;
