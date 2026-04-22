import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

(async () => {
  try {
    await connectDB();
    const app = createApp();
    app.listen(env.port, () => {
      console.log(`[opsflow] API listening on http://localhost:${env.port}`);
      console.log(`[opsflow] env=${env.nodeEnv} cors=${env.corsOrigin.join(',')}`);
    });
  } catch (err) {
    console.error('[opsflow] failed to start:', err);
    process.exit(1);
  }
})();
