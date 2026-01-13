import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
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

        // 1. Generate Fortune using AI service
        const result = await aiService.generateFortune(config, mode);
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
        res.status(500).json({ 
            error: '生成运势失败', 
            details: error instanceof Error ? error.message : String(error),
            // 返回模拟数据，确保前端能正常显示
            fallback: true,
            data: {
                direction: "SE",
                summary: "今日运势平稳，建议以稳为主。适合处理日常事务，不宜做出重大决策。西北方向有贵人相助，可适当寻求他人意见。",
                luckyColor: "蓝色",
                bestTime: "申时（15:00-17:00）",
                energyLabel: "运势能量值",
                energyValue: "75%",
                luckyNumbers: [2, 7, 12, 19],
                mode: req.body.mode || 'fengshui'
            }
        });
    }
};

export const getDreamInterpretation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { dream } = req.body;
        const result = await aiService.interpretDream(dream);
        res.json({ result });
    } catch (error) {
        console.error('[getDreamInterpretation] 错误:', error);
        res.status(500).json({ 
            error: '解析梦境失败', 
            result: '梦境解析服务暂时不可用，请稍后再试。'
        });
    }
};

export const getOutfit = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await aiService.getOutfitSuggestion();
        res.json(result);
    } catch (error) {
        console.error('[getOutfit] 错误:', error);
        res.status(500).json({ 
            error: '获取穿搭建议失败',
            // 返回模拟数据
            colors: ["正红色", "亮金色"],
            accessory: "玉石挂件",
            quote: "鸿运当头，顺风顺水。"
        });
    }
};
