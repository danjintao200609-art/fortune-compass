import { Request, Response } from 'express';
import { generateFortune, interpretDream, getOutfitSuggestion } from '../services/geminiService';
import { supabase } from '../lib/supabase';

// Helper to check user auth (simplified for now, ideally verified via middleware)
const getUserId = (req: Request) => {
    // logic to extract user_id from headers/token
    // For now, if passed in header 'x-user-id', use it, else null
    return req.headers['x-user-id'] as string || null;
};

export const createFortune = async (req: Request, res: Response): Promise<void> => {
    try {
        const { config, mode } = req.body;
        console.log('[createFortune] 开始生成运势:', { config, mode });

        // 1. Generate Fortune
        const result = await generateFortune(config, mode);
        console.log('[createFortune] 运势生成成功');

        // 2. Save to Supabase (History)
        // 从 authMiddleware 中获取用户 ID
        const userId = (req as any).user?.id;

        if (userId) {
            console.log('[createFortune] 尝试保存到 Supabase, user_id:', userId);
            const { error } = await supabase.from('fortune_history').insert({
                user_id: userId,
                fortunetype: mode || 'fengshui',
                game_type: config.gameType,
                prediction_date: config.predictionDate,
                direction: result.direction,
                summary: result.summary,
                lucky_color: result.luckyColor,
                best_time: result.bestTime,
                energy_value: result.energyValue,
                lucky_numbers: result.luckyNumbers,
            });

            if (error) {
                console.error('[createFortune] Supabase 保存失败:', error);
                // 不失败请求，只记录日志
            } else {
                console.log('[createFortune] Supabase 保存成功');
            }
        } else {
            console.warn('[createFortune] 未找到用户 ID，跳过保存');
        }

        res.json(result);
    } catch (error) {
        console.error('[createFortune] 错误:', error);
        res.status(500).json({ error: 'Failed to generate fortune', details: error instanceof Error ? error.message : String(error) });
    }
};

export const getDreamInterpretation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { dream } = req.body;
        const result = await interpretDream(dream);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to interpret dream' });
    }
};

export const getOutfit = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await getOutfitSuggestion();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get outfit' });
    }
};
