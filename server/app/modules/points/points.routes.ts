import { Router } from 'express';
import { PointsController } from './points.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

// All points routes require authentication
router.get('/balance', authMiddleware(['user', 'admin']), PointsController.getBalance);
router.get('/transactions', authMiddleware(['user', 'admin']), PointsController.getTransactions);
router.post('/earn-ad', authMiddleware(['user', 'admin']), PointsController.earnFromAd);
router.post('/buy-chapter', authMiddleware(['user', 'admin']), PointsController.buyChapter);

export const PointsRoutes = router;
