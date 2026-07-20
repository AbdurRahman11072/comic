import { Router } from 'express';
import { SeriesController } from './series.controller';
import authMiddleware, { optionalAuthMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', SeriesController.getAllSeries);
router.get('/pinned', SeriesController.getPinnedSeries);
router.get('/featured', SeriesController.getFeaturedSeries);
router.get('/discounted', SeriesController.getDiscountedSeries);
router.get('/:slug', optionalAuthMiddleware, SeriesController.getSeriesBySlug);
router.get('/id/:id', SeriesController.getSeriesById);
router.post('/', authMiddleware(['creator', 'moderator', 'admin']), SeriesController.createSeries);
router.put('/:id', authMiddleware(['creator', 'moderator', 'admin']), SeriesController.updateSeries);
router.delete('/:id', authMiddleware(['creator', 'moderator', 'admin']), SeriesController.deleteSeries);
router.post('/:id/toggle-featured', authMiddleware(['moderator', 'admin']), SeriesController.toggleFeatured);

export const SeriesRoutes = router;
