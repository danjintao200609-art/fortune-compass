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

        // 1. Generate Fortune
        const result = await generateFortune(config, mode);

        // 2. Save to Supabase (History)
        const userId = getUserId(req);
        // If we have a user, save it. Or we can allow anon saves if we want.
        if (userId) {
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
                console.error('Error saving to supabase:', error);
                // Don't fail the request if save fails, just log it
            }
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate fortune' });
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
