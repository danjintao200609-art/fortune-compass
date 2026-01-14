import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fortuneRoutes from './routes/fortuneRoutes';
import authRoutes from './routes/authRoutes';
import { testDatabaseConnection } from './lib/db';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fortune-compass.zeabur.app';

// ============ CORS 配置 - 必须在所有路由之前 ============
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // 允许没有 origin 的请求（如 curl、移动端）
    if (!origin) {
      callback(null, true);
      return;
    }
    // 允许前端域名
    if (origin === FRONTEND_URL || origin.endsWith('.zeabur.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      // 生产环境暂时放行所有，便于调试
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// 显式处理所有 OPTIONS 预检请求
app.options('*', cors(corsOptions));

app.use(express.json());

// ============ 基础路由 ============
app.get('/', (req, res) => {
  res.json({
    message: 'Fortune Compass API Server',
    status: 'running',
    version: '1.0.0',
    frontend: FRONTEND_URL,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    port: PORT,
    frontend: FRONTEND_URL,
    database: req.app.get('db_connected') ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ============ API 路由 ============
app.use('/api/auth', authRoutes);
app.use('/api', fortuneRoutes);

// ============ 404 处理 ============
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: ['/api/auth/login', '/api/auth/register', '/api/health'],
    timestamp: new Date().toISOString()
  });
});

// ============ 错误处理 ============
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// ============ 服务器启动 ============
if (!process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log('='.repeat(50));
    console.log('Fortune Compass Backend Server Started');
    console.log(`Port: ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50));

    const connected = await testDatabaseConnection();
    app.set('db_connected', connected);
    console.log(`Database: ${connected ? 'Connected' : 'Disconnected'}`);
    console.log('='.repeat(50));
  });

  process.on('SIGTERM', () => {
    server.close(() => console.log('Server closed'));
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });
}

export default app;

export const handler = (req: any, res: any) => app(req, res);