import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import type { Status } from '@prisma/client';

const router = Router();

router.get('/personalities', async (req, res) => {
  const { status = 'APPROVED' } = req.query;
  const personalities = await prisma.personality.findMany({
    where: { status: status as Status },
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

router.get('/personalities/:id', async (req, res) => {
  const personality = await prisma.personality.findUnique({
    where: { id: req.params.id },
  });

  if (!personality) {
    res.status(404).json({ success: false, error: '人格类型不存在' });
    return;
  }

  res.json({
    success: true,
    data: {
      ...personality,
      traits: JSON.parse(personality.traits),
      pixelArt: personality.pixelArt ? JSON.parse(personality.pixelArt) : null,
    },
  });
});

export default router;
