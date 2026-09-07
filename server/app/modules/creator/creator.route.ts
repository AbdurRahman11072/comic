import express from 'express';
import { CreatorController } from './creator.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

// Admin / Moderator list of all creators
router.get('/admin/all', authMiddleware(['moderator', 'admin']), CreatorController.getAllCreators);

// Public channel and announcements
router.get('/channel/:id', CreatorController.getPublicChannel);
router.get('/:creatorId/posts', CreatorController.getCreatorPosts);
router.post('/posts', authMiddleware(['creator', 'moderator', 'admin']), CreatorController.createCreatorPost);
router.delete('/posts/:id', authMiddleware(['creator', 'moderator', 'admin']), CreatorController.deleteCreatorPost);

// Creator private dashboard
router.get('/profile', authMiddleware(['creator', 'moderator', 'admin']), CreatorController.getProfile);
router.put('/profile', authMiddleware(['user', 'creator', 'moderator', 'admin']), CreatorController.updateProfile);
router.get('/analytics', authMiddleware(['creator', 'moderator', 'admin']), CreatorController.getAnalytics);
router.get('/series/:id/analytics', authMiddleware(['creator', 'moderator', 'admin']), CreatorController.getSingleSeriesAnalytics);
router.post('/series-application', authMiddleware(['user', 'creator', 'moderator', 'admin']), CreatorController.applyForSeries);
router.post('/feature-request', authMiddleware(['creator', 'moderator', 'admin']), CreatorController.requestFeatureSeries);
router.get('/feature-requests', authMiddleware(['creator', 'moderator', 'admin']), CreatorController.getCreatorFeatureRequests);

export const CreatorRoutes = router;
