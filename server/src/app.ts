import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fortuneRoutes from './routes/fortuneRoutes';
import authRoutes from './routes/authRoutes';
import { testDatabaseConnection } from './lib/db';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

// 启用 CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    console.log(`CORS: Request from origin: ${origin}`);
    if (origin.endsWith('.zeabur.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log(`CORS: Origin ${origin} is allowed.`);
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      console.log(`CORS: Origin ${origin} is NOT allowed.`);
      // Optionally, you could set a specific origin or block it
      // For now, we'll proceed, but the browser might still block it if no ACAO header is set.
    }
  } else {
    console.log('CORS: Request without origin header (e.g., same-origin, curl, mobile app).');
    // For requests without an origin header, we might still want to allow them
    // or apply a default policy. For simplicity, we'll allow them to proceed
    // without setting ACAO, which means same-origin requests will work.
  }

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    console.log('CORS: Handling OPTIONS preflight request.');
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// 基础健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    env: process.env.NODE_ENV,
    db: req.app.get('db_connected') ? 'connected' : 'disconnected'
  });
});

// 挂载认证接口（不需要认证）
app.use('/api/auth', authRoutes);

// 挂载运势接口
app.use('/api', fortuneRoutes);

// 在 Zeabur/独立服务器环境下启动服务器（Vercel 使用 serverless 函数）
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Backend server is running on port ${PORT}`);
    const connected = await testDatabaseConnection();
    app.set('db_connected', connected);
  });
}

// 导出 app 供 Vercel 使用
export default app;

// 导出 handler 供云函数使用 (腾讯云函数、阿里云函数计算等)
export const handler = (req: any, res: any) => {
  // 云函数环境下的请求处理
  if (req.apiGateway || req.headers['x-apigateway-event']) {
    // 兼容 API Gateway 事件格式
    return app(req, res);
  }
  // 常规 HTTP 请求处理
  return app(req, res);
};