import { Router } from 'express';
import authMiddleware, { optionalAuthMiddleware } from '../../middleware/authMiddleware';
import { readTrackLimiter } from '../../middleware/rateLimiter';
import { validateRequest } from '../../middleware/validateRequest';
import { AdRevenueController } from './adRevenue.controller';
import {
  executeDistributionSchema,
  previewDistributionSchema,
  revertDistributionSchema,
  trackReadEventSchema,
} from './adRevenue.validation';

const router = Router();

// Public / Authenticated: Ingest read progress / heartbeats
router.post(
  '/track',
  optionalAuthMiddleware,
  readTrackLimiter,
  validateRequest(trackReadEventSchema),
  AdRevenueController.trackReadEvent
);

// Admin Only: Preview revenue distribution calculation
router.get(
  '/distribution/preview',
  authMiddleware(['admin']),
  validateRequest(previewDistributionSchema),
  AdRevenueController.getDistributionPreview
);

// Admin Only: Execute atomic revenue distribution run
router.post(
  '/distribution/execute',
  authMiddleware(['admin']),
  validateRequest(executeDistributionSchema),
  AdRevenueController.executeDistribution
);

// Admin Only: Revert a completed distribution run
router.post(
  '/distribution/:id/revert',
  authMiddleware(['admin']),
  validateRequest(revertDistributionSchema),
  AdRevenueController.revertDistribution
);

// Admin Only: Distribution history
router.get(
  '/distribution/history',
  authMiddleware(['admin']),
  AdRevenueController.getDistributionHistory
);

// Admin Only: Single distribution run details
router.get(
  '/distribution/:id',
  authMiddleware(['admin']),
  AdRevenueController.getDistributionDetails
);

export const AdRevenueRoutes = router;
