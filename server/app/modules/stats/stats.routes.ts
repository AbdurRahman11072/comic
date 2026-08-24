import { Router } from 'express';
import { StatsController } from './stats.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.get(
  '/',
  authMiddleware(['admin', 'moderator', 'creator']),
  StatsController.getDashboardStats
);

router.get(
  '/admin-analytics',
  authMiddleware(['admin', 'moderator']),
  StatsController.getAdminAnalytics
);

export const StatsRoutes = router;
