import type { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimit({ windowMs, max, message }: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    const key = `${req.ip || 'unknown'}:${req.path}`;
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (existing.count >= max) {
      res.status(429).json({ success: false, error: message });
      return;
    }

    existing.count += 1;
    buckets.set(key, existing);
    next();
  };
}
