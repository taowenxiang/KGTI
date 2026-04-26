import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import testRoutes from './routes/test.routes.js';
import personalityRoutes from './routes/personality.routes.js';
import adminRoutes from './routes/admin.routes.js';
import creatorRoutes from './routes/creator.routes.js';

dotenv.config();

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS origin not allowed'));
  },
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api', personalityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/creator', creatorRoutes);

app.use(errorHandler);

export default app;
