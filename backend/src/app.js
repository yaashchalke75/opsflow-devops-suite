import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: false }));

  // CORS: if CORS_ORIGIN contains '*', allow any origin. Otherwise, only listed origins.
  const allowAny = env.corsOrigin.includes('*');
  app.use(cors({
    origin: allowAny ? true : env.corsOrigin,
    credentials: false,
  }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  const limiter = rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  app.get('/', (_req, res) => res.json({ name: 'OpsFlow API', version: '1.0.0' }));
  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
