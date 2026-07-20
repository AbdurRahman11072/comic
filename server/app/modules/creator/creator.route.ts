import express from 'express';
import { CreatorController } from './creator.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', authMiddleware(['creator', 'admin']), CreatorController.getProfile);
router.put('/profile', authMiddleware(['creator', 'admin']), CreatorController.updateProfile);
router.get('/analytics', authMiddleware(['creator', 'admin']), CreatorController.getAnalytics);
router.post('/series-application', authMiddleware(['user', 'creator', 'admin']), CreatorController.applyForSeries);
router.post('/feature-request', authMiddleware(['creator', 'admin']), CreatorController.requestFeatureSeries);
router.get('/feature-requests', authMiddleware(['creator', 'admin']), CreatorController.getCreatorFeatureRequests);

export const CreatorRoutes = router;
