import { Router, Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// 注册
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, phone, password } = req.body;

        // 验证必填字段
        if (!username || !password) {
            res.status(400).json({ error: '用户名和密码为必填项' });
            return;
        }

        if (!email && !phone) {
            res.status(400).json({ error: '请提供邮箱或手机号' });
            return;
        }

        const result = await registerUser({ username, email, phone, password });

        if ('error' in result) {
            res.status(400).json({ error: result.error });
            return;
        }

        res.status(201).json({
            message: '注册成功',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        console.error('注册路由错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 登录
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier, password } = req.body;

        // 验证必填字段
        if (!identifier || !password) {
            res.status(400).json({ error: '邮箱/手机号和密码为必填项' });
            return;
        }

        const result = await loginUser({ identifier, password });

        if ('error' in result) {
            res.status(401).json({ error: result.error });
            return;
        }

        res.json({
            message: '登录成功',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        console.error('登录路由错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 验证当前登录状态（需要认证）
router.get('/me', authMiddleware, (req: Request, res: Response): void => {
    res.json({
        user: req.user,
    });
});

export default router;
