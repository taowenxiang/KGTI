import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/auth.js';
import { prisma } from '../utils/prisma.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = await resolveRequestUser(req.headers.authorization);

  if (!user) {
    res.status(401).json({ success: false, error: '未提供认证令牌' });
    return;
  }

  req.user = user;
  next();
}

export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  req.user = (await resolveRequestUser(req.headers.authorization)) || undefined;
  next();
}

async function resolveRequestUser(authorization?: string) {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
