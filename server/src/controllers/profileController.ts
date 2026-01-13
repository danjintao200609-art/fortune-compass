import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    // 使用认证中间件提供的用户信息
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    console.log(`[获取个人资料] 用户ID: ${userId}`);

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.log(`[获取个人资料] 未找到，返回空: ${error.message}`);
        // 如果没有找到，返回空对象而不是错误
        res.json({});
    } else {
        console.log(`[获取个人资料] 成功:`, data);
        res.json(data);
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

    const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
        .select()
        .single();

    if (error) {
        console.error('[更新个人资料] 错误:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    } else {
        console.log('[更新个人资料] 成功:', data);
        res.json(data);
    }
};
