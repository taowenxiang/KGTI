import type { Request, Response, NextFunction } from 'express';
import type { Role } from '../../../../packages/shared/src/types.js';

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '请先登录' });
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({ success: false, error: '权限不足' });
      return;
    }
    next();
  };
}
