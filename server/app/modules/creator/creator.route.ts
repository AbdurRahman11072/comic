import express from 'express';
import { CreatorController } from './creator.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

// Admin / Moderator list of all creators
router.get('/admin/all', authMiddleware(['moderator', 'admin']), CreatorController.getAllCreators);

// Public channel and announcements
router.get('/channel/:id', CreatorController.getPublicChannel);
router.get('/:creatorId/posts', CreatorController.getCreatorPosts);
router.post('/posts', authMiddleware(['creator', 'admin']), CreatorController.createCreatorPost);
router.delete('/posts/:id', authMiddleware(['creator', 'admin']), CreatorController.deleteCreatorPost);

// Creator private dashboard
router.get('/profile', authMiddleware(['creator', 'admin']), CreatorController.getProfile);
router.put('/profile', authMiddleware(['user', 'creator', 'admin']), CreatorController.updateProfile);
router.get('/analytics', authMiddleware(['creator', 'admin']), CreatorController.getAnalytics);
router.get('/series/:id/analytics', authMiddleware(['creator', 'moderator', 'admin']), CreatorController.getSingleSeriesAnalytics);
router.post('/series-application', authMiddleware(['user', 'creator', 'admin']), CreatorController.applyForSeries);
router.post('/feature-request', authMiddleware(['creator', 'admin']), CreatorController.requestFeatureSeries);
router.get('/feature-requests', authMiddleware(['creator', 'admin']), CreatorController.getCreatorFeatureRequests);

export const CreatorRoutes = router;
