import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, getAllowedOrigins } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocketServer } from './services/socketService.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { IntelligenceService } from './services/intelligenceService.js';

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  // 1. Connect MongoDB Atlas
  await connectDB();

  // 2. Initialize Real-Time WebSocket Server
  const io = initSocketServer(server);

  // 3. Security & Middleware
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: getAllowedOrigins() as any,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Rate limiter for API
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, error: { message: 'Too many requests, please try again later.' } },
  });
  app.use('/api', limiter);

  // 5. Health Check
  app.get('/health', (req, res) => {
    res.json({
      status: 'online',
      service: 'NEXUS Intelligence Platform API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 6. Mount API Routes
  app.use('/api', apiRouter);

  // 7. Global Error Handler
  app.use(errorHandler);

  // 8. In-process Proactive Background Worker (Runs periodic workload & conflict evaluation every 60s)
  setInterval(async () => {
    try {
      await IntelligenceService.evaluateAllUsers();
    } catch (err: any) {
      console.error('[Background Worker] Periodic evaluation error:', err.message);
    }
  }, 60 * 1000);

  // 9. Start HTTP Server
  server.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 NEXUS API Server is running on port ${config.port}`);
    console.log(`📡 WebSocket ready on port ${config.port}`);
    console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
    console.log(`⚡ Proactive Intelligence Engine: ACTIVE (60s tick)`);
    console.log(`=======================================================`);
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal startup error:', err);
  process.exit(1);
});
