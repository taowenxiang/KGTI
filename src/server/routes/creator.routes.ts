import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('CREATOR', 'ADMIN'));

router.post('/submit-question', async (req, res) => {
  const { content, options, category } = req.body;
  const submission = await prisma.submission.create({
    data: {
      type: 'QUESTION',
      content: JSON.stringify({ content, options, category }),
      creatorId: req.user!.id,
    },
  });
  res.status(201).json({ success: true, data: submission });
});

router.post('/submit-personality', async (req, res) => {
  const { id, name, title, description, traits, icon, color, pixelArt } = req.body;
  const submission = await prisma.submission.create({
    data: {
      type: 'PERSONALITY',
      content: JSON.stringify({ id, name, title, description, traits, icon, color, pixelArt }),
      creatorId: req.user!.id,
    },
  });
  res.status(201).json({ success: true, data: submission });
});

router.post('/submit-template', async (req, res) => {
  const { name, description, baseQuestionIds, customQuestions, personalities, scoringRules } = req.body;
  const submission = await prisma.submission.create({
    data: {
      type: 'TEMPLATE',
      content: JSON.stringify({ name, description, baseQuestionIds, customQuestions, personalities, scoringRules }),
      creatorId: req.user!.id,
    },
  });
  res.status(201).json({ success: true, data: submission });
});

router.get('/my-submissions', async (req, res) => {
  const submissions = await prisma.submission.findMany({
    where: { creatorId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: submissions });
});

router.get('/questions', async (_req, res) => {
  const questions = await prisma.question.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    success: true,
    data: questions.map((q) => ({ ...q, options: JSON.parse(q.options) })),
  });
});

router.get('/personalities', async (_req, res) => {
  const personalities = await prisma.personality.findMany({
    where: { status: 'APPROVED' },
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

export default router;
