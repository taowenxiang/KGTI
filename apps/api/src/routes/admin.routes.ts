import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/pending', async (_req, res) => {
  const submissions = await prisma.submission.findMany({
    where: { status: 'PENDING' },
    include: { creator: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: submissions });
});

router.post('/approve/:submissionId', async (req, res) => {
  const submission = await prisma.submission.findUnique({
    where: { id: req.params.submissionId },
  });
  if (!submission) {
    res.status(404).json({ success: false, error: '提交不存在' });
    return;
  }

  const content = JSON.parse(submission.content);

  if (submission.type === 'QUESTION') {
    await prisma.question.create({
      data: {
        content: content.content,
        options: JSON.stringify(content.options),
        category: content.category,
        status: 'APPROVED',
        createdBy: submission.creatorId,
      },
    });
  } else if (submission.type === 'PERSONALITY') {
    await prisma.personality.create({
      data: {
        id: content.id,
        name: content.name,
        title: content.title,
        description: content.description,
        traits: JSON.stringify(content.traits),
        icon: content.icon,
        color: content.color,
        pixelArt: content.pixelArt ? JSON.stringify(content.pixelArt) : null,
        status: 'APPROVED',
      },
    });
  } else if (submission.type === 'TEMPLATE') {
    // Create custom questions first
    const customQuestionRecords = await Promise.all(
      (content.customQuestions as Array<{ content: string; category?: string; options: unknown[] }>)?.map((q) =>
        prisma.question.create({
          data: {
            content: q.content,
            category: q.category,
            options: JSON.stringify(q.options),
            status: 'APPROVED',
            createdBy: submission.creatorId,
          },
        })
      ) || []
    );

    // Create template
    const template = await prisma.template.create({
      data: {
        name: content.name,
        description: content.description,
        status: 'APPROVED',
        createdBy: submission.creatorId,
        scoringRules: content.scoringRules ? JSON.stringify(content.scoringRules) : null,
      },
    });

    // Link base questions + custom questions
    const allQuestionIds = [
      ...((content.baseQuestionIds as string[]) || []),
      ...customQuestionRecords.map((q) => q.id),
    ];

    await prisma.templateQuestion.createMany({
      data: allQuestionIds.map((qid, idx) => ({
        templateId: template.id,
        questionId: qid,
        order: idx,
      })),
    });

    // Create personalities if provided
    const personalities = content.personalities as Array<{
      id: string; name: string; title: string; description: string;
      traits: unknown[]; icon: string; color: string; pixelArt?: string[];
    }>;
    if (personalities?.length) {
      for (const p of personalities) {
        await prisma.personality.upsert({
          where: { id: p.id },
          update: {},
          create: {
            id: p.id,
            name: p.name,
            title: p.title,
            description: p.description,
            traits: JSON.stringify(p.traits),
            icon: p.icon,
            color: p.color,
            pixelArt: p.pixelArt ? JSON.stringify(p.pixelArt) : null,
            status: 'APPROVED',
          },
        });
      }
    }
  }

  await prisma.submission.update({
    where: { id: req.params.submissionId },
    data: { status: 'APPROVED', reviewerId: req.user!.id, reviewedAt: new Date() },
  });

  res.json({ success: true, message: '审核通过' });
});

router.post('/reject/:submissionId', async (req, res) => {
  const { remark } = req.body;
  const submission = await prisma.submission.findUnique({
    where: { id: req.params.submissionId },
  });
  if (!submission) {
    res.status(404).json({ success: false, error: '提交不存在' });
    return;
  }

  await prisma.submission.update({
    where: { id: req.params.submissionId },
    data: { status: 'REJECTED', remark, reviewerId: req.user!.id, reviewedAt: new Date() },
  });

  res.json({ success: true, message: '已拒绝' });
});

router.get('/questions', async (_req, res) => {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    success: true,
    data: questions.map((q) => ({ ...q, options: JSON.parse(q.options) })),
  });
});

router.put('/questions/:id', async (req, res) => {
  const { content, options, category, status } = req.body;
  const question = await prisma.question.update({
    where: { id: req.params.id },
    data: {
      content,
      options: options ? JSON.stringify(options) : undefined,
      category,
      status,
    },
  });
  res.json({ success: true, data: { ...question, options: JSON.parse(question.options) } });
});

router.delete('/questions/:id', async (req, res) => {
  await prisma.question.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: '已删除' });
});

router.get('/personalities', async (_req, res) => {
  const personalities = await prisma.personality.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    success: true,
    data: personalities.map((p) => ({
      ...p,
      traits: JSON.parse(p.traits),
      pixelArt: p.pixelArt ? JSON.parse(p.pixelArt) : null,
    })),
  });
});

router.put('/personalities/:id', async (req, res) => {
  const { name, title, description, traits, icon, color, pixelArt, status } = req.body;
  const personality = await prisma.personality.update({
    where: { id: req.params.id },
    data: {
      name,
      title,
      description,
      traits: traits ? JSON.stringify(traits) : undefined,
      icon,
      color,
      pixelArt: pixelArt ? JSON.stringify(pixelArt) : undefined,
      status,
    },
  });
  res.json({
    success: true,
    data: {
      ...personality,
      traits: JSON.parse(personality.traits),
      pixelArt: personality.pixelArt ? JSON.parse(personality.pixelArt) : null,
    },
  });
});

router.delete('/personalities/:id', async (req, res) => {
  await prisma.personality.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: '已删除' });
});

// 数据统计：概览
router.get('/stats/overview', async (_req, res) => {
  const [totalUsers, totalResults, totalPersonalities, totalQuestions] = await Promise.all([
    prisma.user.count(),
    prisma.testResult.count(),
    prisma.personality.count({ where: { status: 'APPROVED' } }),
    prisma.question.count({ where: { status: 'APPROVED' } }),
  ]);

  res.json({
    success: true,
    data: { totalUsers, totalResults, totalPersonalities, totalQuestions },
  });
});

// 数据统计：各人格占比
router.get('/stats/personalities', async (_req, res) => {
  const results = await prisma.testResult.groupBy({
    by: ['personalityId'],
    _count: { personalityId: true },
  });

  const total = results.reduce((sum, r) => sum + r._count.personalityId, 0);

  const personalities = await prisma.personality.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, name: true, color: true },
  });

  const data = personalities.map((p) => {
    const stat = results.find((r) => r.personalityId === p.id);
    const count = stat ? stat._count.personalityId : 0;
    return {
      ...p,
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    };
  });

  // 按占比降序
  data.sort((a, b) => b.count - a.count);

  res.json({ success: true, data });
});

// 数据统计：各题选项分布
router.get('/stats/questions', async (_req, res) => {
  const results = await prisma.testResult.findMany({
    select: { answers: true },
  });

  const questions = await prisma.question.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, content: true, options: true },
  });

  const stats = questions.map((q) => {
    const options = JSON.parse(q.options) as Array<{ label: string; text: string }>;
    const counts = new Array(options.length).fill(0);

    results.forEach((r) => {
      const answers = JSON.parse(r.answers) as Array<{ questionId: string; optionIndex: number }>;
      const ans = answers.find((a) => a.questionId === q.id);
      if (ans && ans.optionIndex >= 0 && ans.optionIndex < counts.length) {
        counts[ans.optionIndex]++;
      }
    });

    return {
      id: q.id,
      content: q.content,
      options: options.map((opt, idx) => ({
        ...opt,
        count: counts[idx],
      })),
      total: counts.reduce((a, b) => a + b, 0),
    };
  });

  res.json({ success: true, data: stats });
});

export default router;
