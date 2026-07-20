import express from 'express';
import { AchievementController } from './achievement.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

const userAuth = authMiddleware(['user', 'creator', 'moderator', 'admin']);

router.get('/', userAuth, AchievementController.getAchievements);
router.post('/check', userAuth, AchievementController.checkAndUnlockAchievements);

export const AchievementRoutes = router;
