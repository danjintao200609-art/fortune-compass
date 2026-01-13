import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fortuneRoutes from './routes/fortuneRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

// 启用 CORS，允许前端访问
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || '*'
    : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// 基础健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// 挂载认证接口（不需要认证）
app.use('/api/auth', authRoutes);

// 挂载运势接口
app.use('/api', fortuneRoutes);

// 只在非 Vercel 环境下启动服务器
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`🚀 后端服务启动成功！`);
    console.log(`🔗 地址: http://localhost:${PORT}`);
    console.log(`⏰ 时间: ${new Date().toLocaleString()}`);
    console.log(`=========================================`);
  });
}

// 导出 app 供 Vercel 使用
export default app;