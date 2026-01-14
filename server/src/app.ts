import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fortuneRoutes from './routes/fortuneRoutes';
import authRoutes from './routes/authRoutes';
import { testDatabaseConnection } from './lib/db';

dotenv.config();

const app = express();
// 使用环境变量的 PORT，如果未设置则使用 3001（与 Zeabur 配置一致）
const PORT: number = Number(process.env.PORT) || 3001;

// ============ CORS 配置 - 必须在所有路由之前 ============
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400
}));

// 显式处理所有 OPTIONS 预检请求
app.options('*', cors());

app.use(express.json());

// ============ 基础路由 ============
// 根路由 - 验证服务存活
app.get('/', (req, res) => {
  res.json({
    message: 'Fortune Compass API Server',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    port: PORT,
    database: req.app.get('db_connected') ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ============ API 路由 ============
// 挂载认证接口（不需要认证）
app.use('/api/auth', authRoutes);

// 挂载运势接口
app.use('/api', fortuneRoutes);

// ============ 404 处理 - 确保返回 CORS 头 ============
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// ============ 错误处理中间件 ============
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
    console.log(`✅ Fortune Compass Backend Server Started`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    console.log('='.repeat(50));

    const connected = await testDatabaseConnection();
    app.set('db_connected', connected);

    if (connected) {
      console.log('✅ Database connection established');
    } else {
      console.warn('⚠️  Database connection failed - running in limited mode');
    }
    console.log('='.repeat(50));
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });

  // 处理未捕获的异常
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // 不退出进程，继续运行
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // 不退出进程，继续运行
  });
}

// 导出 app 供 Vercel 使用
export default app;

// 导出 handler 供云函数使用
export const handler = (req: any, res: any) => {
  if (req.apiGateway || req.headers['x-apigateway-event']) {
    return app(req, res);
  }
  return app(req, res);
};