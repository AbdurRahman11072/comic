import { Router } from 'express';
import { StatsController } from './stats.controller';

const router = Router();

router.get('/', StatsController.getAdminStats); // Add admin auth middleware later

export const StatsRoutes = router;
