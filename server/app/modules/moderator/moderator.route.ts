import express from 'express';
import { ModeratorController } from './moderator.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

// General middleware for moderator and admin
const modAuth = authMiddleware(['moderator', 'admin']);

// User Management
router.post('/users/:id/ban', modAuth, ModeratorController.banUser);
router.post('/users/:id/freeze', modAuth, ModeratorController.freezeUser);

// Series Applications
router.get('/series-applications', modAuth, ModeratorController.getSeriesApplications);
router.post('/series-applications/:id/review', modAuth, ModeratorController.reviewSeriesApplication);

// Withdrawal Requests
router.get('/withdrawals', modAuth, ModeratorController.getWithdrawalRequests);
router.post('/withdrawals/:id/review', modAuth, ModeratorController.reviewWithdrawalRequest);

// Featured Requests
router.get('/featured-requests', modAuth, ModeratorController.getFeaturedRequests);
router.post('/featured-requests/:id/review', modAuth, ModeratorController.reviewFeaturedRequest);

export const ModeratorRoutes = router;
