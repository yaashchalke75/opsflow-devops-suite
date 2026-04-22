import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opsflow',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
};
