import { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../services/authService';

// 扩展 Express Request 类型以包含 user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                email?: string;
                phone?: string;
            };
        }
    }
}

// 认证中间件 - 保护需要登录的路由
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // 从 header 中获取 token
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: '未登录，请先登录' });
            return;
        }

        const token = authHeader.substring(7); // 移除 "Bearer " 前缀

        // 验证 token
        const user = await getUserFromToken(token);

        if (!user) {
            res.status(401).json({ error: 'Token无效或已过期' });
            return;
        }

        // 将用户信息附加到请求对象
        req.user = user;
        next();
    } catch (error) {
        console.error('认证中间件错误:', error);
        res.status(500).json({ error: '认证失败' });
    }
};

// 可选认证中间件 - 如果有 token 则验证，没有也继续
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const user = await getUserFromToken(token);
            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        console.error('可选认证中间件错误:', error);
        next();
    }
};
