import { Request, Response } from 'express';
import { DoubaoService, DeepSeekService, aiService } from '../services/aiService';
import { pool } from '../lib/db';

export const createFortune = async (req: Request, res: Response): Promise<void> => {
    try {
        const { config, mode, aiServiceType } = req.body;

        let aiServiceInstance;
        if (aiServiceType === 'deepseek') {
            aiServiceInstance = new DeepSeekService();
        } else {
            aiServiceInstance = new DoubaoService();
        }

        const result = await aiServiceInstance.generateFortune(config, mode);

        const userId = (req as any).user?.id;

        if (userId) {
            try {
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
            } catch (error) {
                // Ignore save errors to not interrupt the response
            }
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: '生成运势失败',
            details: error instanceof Error ? error.message : String(error),
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
        res.status(500).json({
            error: '获取穿搭建议失败',
            colors: ["正红色", "亮金色"],
            accessory: "玉石挂件",
            quote: "鸿运当头，顺风顺水。"
        });
    }
};
