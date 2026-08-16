import { Router } from 'express';
import { StatsController } from './stats.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(['admin']), StatsController.getAdminStats);

export const StatsRoutes = router;
