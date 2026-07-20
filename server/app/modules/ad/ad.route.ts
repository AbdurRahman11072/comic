import express from 'express';
import { AdController } from './ad.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

const modOrAdmin = authMiddleware(['moderator', 'admin']);

// User-facing
router.post('/earn', authMiddleware(['user', 'creator', 'moderator', 'admin']), AdController.earnAdPoints);
router.get('/active', AdController.getActiveCustomAd);

// Admin/Moderator management
router.get('/', modOrAdmin, AdController.getCustomAds);
router.post('/', modOrAdmin, AdController.createCustomAd);
router.put('/:id', modOrAdmin, AdController.updateCustomAd);
router.delete('/:id', modOrAdmin, AdController.deleteCustomAd);

export const AdRoutes = router;

