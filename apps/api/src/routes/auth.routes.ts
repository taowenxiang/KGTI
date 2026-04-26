import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();
const authRateLimit = createRateLimit({
  windowMs: 60_000,
  max: 12,
  message: '登录或注册尝试过于频繁，请稍后再试',
});

router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.get('/me', authMiddleware, me);

export default router;
