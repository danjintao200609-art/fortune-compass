import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { pool } from '../lib/db';

// Helper to check user auth (authMiddleware已经验证过用户身份，直接从req.user获取)
const getUserId = (req: Request) => {
    // 从authMiddleware附加的user对象中获取用户ID
    return req.user?.id || null;
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
            console.log('[createFortune] 尝试保存到 PostgreSQL, user_id:', userId);
            try {
                // 使用 pg 保存到 PostgreSQL 表
                const query = `
                    INSERT INTO fortune_history (
                        user_id, fortunetype, game_type, prediction_date, 
                        direction, summary, lucky_color, best_time, 
                        energy_value, lucky_numbers, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `;
                
                const values = [
                    userId,
                    mode || 'fengshui',
                    config.gameType,
                    config.predictionDate,
                    result.direction,
                    result.summary,
                    result.luckyColor,
                    result.bestTime,
                    result.energyValue,
                    result.luckyNumbers,
                    new Date().toISOString()
                ];
                
                await pool.query(query, values);
                console.log('[createFortune] PostgreSQL 保存成功');
            } catch (error) {
                console.error('[createFortune] PostgreSQL 保存失败:', error);
                // 不失败请求，只记录日志
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
