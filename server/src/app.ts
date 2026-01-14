import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fortuneRoutes from './routes/fortuneRoutes';
import authRoutes from './routes/authRoutes';
import { testDatabaseConnection } from './lib/db';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

// ============ CORS 配置 - 必须在所有路由之前 ============
// 使用通配符进行调试验证
app.use(cors({
  origin: '*', // 临时使用通配符，验证成功后可以改为具体域名
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400 // 24小时预检缓存
}));

// 显式处理所有 OPTIONS 预检请求
app.options('*', cors());

app.use(express.json());

// 基础健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// 挂载认证接口（不需要认证）
app.use('/api/auth', authRoutes);

// 挂载运势接口
app.use('/api', fortuneRoutes);

// 在 Zeabur/独立服务器环境下启动服务器（Vercel 使用 serverless 函数）
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`✅ Backend server is running on port ${PORT}`);
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