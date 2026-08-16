import { Router } from 'express';
import { PointsController } from './points.controller';
import authMiddleware from '../../middleware/authMiddleware';
import { pointsLimiter } from '../../middleware/rateLimiter';
import { validateRequest } from '../../middleware/validateRequest';
import { buyChapterSchema, buyBulkChaptersSchema } from './points.validation';

const router = Router();

// All points routes require authentication
router.get('/balance', authMiddleware(['user', 'creator', 'moderator', 'admin']), PointsController.getBalance);
router.get('/transactions', authMiddleware(['user', 'creator', 'moderator', 'admin']), PointsController.getTransactions);
router.post('/earn-ad', authMiddleware(['user', 'creator', 'moderator', 'admin']), pointsLimiter, PointsController.earnFromAd);
router.post(
  '/buy-chapter',
  authMiddleware(['user', 'creator', 'moderator', 'admin']),
  pointsLimiter,
  validateRequest(buyChapterSchema),
  PointsController.buyChapter
);
router.post(
  '/buy-bulk-chapters',
  authMiddleware(['user', 'creator', 'moderator', 'admin']),
  pointsLimiter,
  validateRequest(buyBulkChaptersSchema),
  PointsController.buyBulkChapters
);

export const PointsRoutes = router;
