import { Request, Response } from 'express';
import { pool } from '../lib/db';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    // 使用认证中间件提供的用户信息
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    console.log(`[获取个人资料] 用户ID: ${userId}`);

    try {
        const result = await pool.query(
            'SELECT * FROM profiles WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            console.log(`[获取个人资料] 未找到，返回空`);
            // 如果没有找到，返回空对象而不是错误
            res.json({});
        } else {
            console.log(`[获取个人资料] 成功:`, result.rows[0]);
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('[获取个人资料] 错误:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    // 使用认证中间件提供的用户信息
    const userId = req.user?.id;
    const updates = req.body;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    console.log(`[更新个人资料] 用户ID: ${userId}, 数据:`, updates);

    try {
        const { birthday, gender, nickname, avatar_url, signature } = updates;
        
        // 使用 upsert (INSERT ... ON CONFLICT DO UPDATE) 语法
        const result = await pool.query(
            `INSERT INTO profiles (id, birthday, gender, nickname, avatar_url, signature, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id)
             DO UPDATE SET birthday = $2, gender = $3, nickname = $4, avatar_url = $5, signature = $6, updated_at = $7
             RETURNING *`,
            [userId, birthday, gender, nickname, avatar_url, signature, new Date().toISOString()]
        );

        console.log('[更新个人资料] 成功:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('[更新个人资料] 错误:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
