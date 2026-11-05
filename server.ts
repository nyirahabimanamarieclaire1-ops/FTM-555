import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './src/server/db.ts';
import { apiRouter } from './src/server/routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Initialize SQLite Database with 14 Relational Tables
  try {
    initDatabase();
    console.log('[FTM-1] Database initialized successfully with all 14 tables and Rwanda catalog.');
  } catch (dbErr) {
    console.error('[FTM-1] Database initialization error:', dbErr);
  }

  app.use(express.json());

  // Mount API Router
  app.use('/api', apiRouter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      app: 'FTM-1 Smart Fridge Teller Machine',
      version: '1.0.0',
      telemetry: 'ESP32-S3 READY',
      database: 'ONLINE'
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FTM-1] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FTM-1] Fatal error during server startup:', err);
  process.exit(1);
});
