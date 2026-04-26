import type { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById } from '../services/auth.service.js';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未认证' });
      return;
    }
    const user = await getUserById(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
