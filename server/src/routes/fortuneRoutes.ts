import { Router } from 'express';
import { createFortune, getDreamInterpretation, getOutfit } from '../controllers/fortuneController';
import { getProfile, updateProfile } from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// 所有运势相关的端点都需要认证
router.use(authMiddleware);

// Fortune endpoints
router.post('/fortune', createFortune);
router.post('/dream', getDreamInterpretation);
router.get('/outfit', getOutfit);

// Profile endpoints
router.get('/profile', getProfile);
router.post('/profile', updateProfile);

export default router;
