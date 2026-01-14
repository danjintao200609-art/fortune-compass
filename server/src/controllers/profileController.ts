import { Request, Response } from 'express';
import { pool } from '../lib/db';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const result = await pool.query(
            'SELECT * FROM profiles WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            res.json({});
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const updates = req.body;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const { birthday, gender, nickname, avatar_url, signature } = updates;

        const result = await pool.query(
            `INSERT INTO profiles (id, birthday, gender, nickname, avatar_url, signature, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id)
             DO UPDATE SET birthday = $2, gender = $3, nickname = $4, avatar_url = $5, signature = $6, updated_at = $7
             RETURNING *`,
            [userId, birthday, gender, nickname, avatar_url, signature, new Date().toISOString()]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
