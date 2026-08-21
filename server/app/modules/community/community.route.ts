import express from 'express';
import { CommunityController } from './community.controller';
import authMiddleware from '../../middleware/authMiddleware';
import { optionalAuthMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();

// Comments
router.get('/comments/:chapterId', optionalAuthMiddleware, CommunityController.getComments);
router.post('/comments', authMiddleware(['user', 'creator', 'moderator', 'admin']), CommunityController.createComment);
router.delete('/comments/:id', authMiddleware(['user', 'creator', 'moderator', 'admin']), CommunityController.deleteComment);

// Reviews
router.get('/reviews/:seriesId', optionalAuthMiddleware, CommunityController.getReviews);
router.post('/reviews', authMiddleware(['user', 'creator', 'moderator', 'admin']), CommunityController.createReview);
router.delete('/reviews/:id', authMiddleware(['user', 'creator', 'moderator', 'admin']), CommunityController.deleteReview);

// Reports
router.post('/reports', authMiddleware(['user', 'creator', 'moderator', 'admin']), CommunityController.createReport);
router.get('/reports', authMiddleware(['moderator', 'admin']), CommunityController.getReports);
router.post('/reports/:id/resolve', authMiddleware(['moderator', 'admin']), CommunityController.resolveReport);

// Chat Room
router.get('/chat', optionalAuthMiddleware, CommunityController.getChatMessages);
router.post('/chat', authMiddleware(['user', 'creator', 'moderator', 'admin']), CommunityController.createChatMessage);
router.delete('/chat/:id', authMiddleware(['user', 'creator', 'moderator', 'admin']), CommunityController.deleteChatMessage);

export const CommunityRoutes = router;
