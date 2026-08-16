import express from 'express';
import { AdController } from './ad.controller';
import authMiddleware from '../../middleware/authMiddleware';
import { pointsLimiter } from '../../middleware/rateLimiter';

const router = express.Router();

const modOrAdmin = authMiddleware(['moderator', 'admin']);

// Public / User placement & interaction
router.get('/placement/:placement', AdController.getAdByPlacement);
router.post('/:id/impression', AdController.recordImpression);
router.post('/:id/click', AdController.recordClick);

// Rewarded Ad points claim (authenticated + rate limited)
router.post(
  '/earn',
  authMiddleware(['user', 'creator', 'moderator', 'admin']),
  pointsLimiter,
  AdController.earnAdPoints
);

// Admin / Moderator Management & Analytics
router.get('/stats', modOrAdmin, AdController.getAdStats);
router.get('/', modOrAdmin, AdController.getCustomAds);
router.post('/', modOrAdmin, AdController.createCustomAd);
router.put('/:id', modOrAdmin, AdController.updateCustomAd);
router.delete('/:id', modOrAdmin, AdController.deleteCustomAd);

export const AdRoutes = router;
