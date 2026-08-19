import { Router } from 'express';
import { StatsController } from './stats.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.get(
  '/',
  authMiddleware(['admin', 'moderator', 'creator']),
  StatsController.getDashboardStats
);

export const StatsRoutes = router;
