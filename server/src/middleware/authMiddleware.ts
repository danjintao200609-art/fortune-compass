import { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../services/authService';
import { supabase } from '../lib/supabase';

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

// 验证 Supabase Auth token
export const verifySupabaseToken = async (token: string) => {
    try {
        // 使用 Supabase Admin API 验证 token
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            return null;
        }
        return {
            id: data.user.id,
            username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'User',
            email: data.user.email,
            phone: data.user.phone
        };
    } catch (error) {
        console.error('验证 Supabase Token 错误:', error);
        return null;
    }
};

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

        // 尝试验证自定义 JWT
        let user = await getUserFromToken(token);
        
        // 如果自定义 JWT 验证失败，尝试验证 Supabase Auth token
        if (!user) {
            user = await verifySupabaseToken(token);
        }

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
            // 尝试验证自定义 JWT
            let user = await getUserFromToken(token);
            
            // 如果自定义 JWT 验证失败，尝试验证 Supabase Auth token
            if (!user) {
                user = await verifySupabaseToken(token);
            }
            
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
