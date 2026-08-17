import { Router } from 'express';
import { SeriesController } from './series.controller';
import authMiddleware, { optionalAuthMiddleware } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { createSeriesSchema, updateSeriesSchema, toggleHideSeriesSchema } from './series.validation';

import { cacheResponse } from '../../middleware/cacheMiddleware';

const router = Router();

router.get('/', cacheResponse(300, 'series'), SeriesController.getAllSeries);
router.get('/admin/all', authMiddleware(['moderator', 'admin']), SeriesController.getAdminSeriesList);
router.put(
  '/admin/:id/hide',
  authMiddleware(['moderator', 'admin']),
  validateRequest(toggleHideSeriesSchema),
  SeriesController.toggleHideSeries
);
router.get('/pinned', cacheResponse(600, 'series'), SeriesController.getPinnedSeries);
router.get('/featured', cacheResponse(600, 'series'), SeriesController.getFeaturedSeries);
router.get('/discounted', cacheResponse(600, 'series'), SeriesController.getDiscountedSeries);
router.get('/:slug', optionalAuthMiddleware, SeriesController.getSeriesBySlug);
router.get('/id/:id', SeriesController.getSeriesById);
router.post(
  '/',
  authMiddleware(['creator', 'moderator', 'admin']),
  validateRequest(createSeriesSchema),
  SeriesController.createSeries
);
router.put(
  '/:id',
  authMiddleware(['creator', 'moderator', 'admin']),
  validateRequest(updateSeriesSchema),
  SeriesController.updateSeries
);
router.delete('/:id', authMiddleware(['creator', 'moderator', 'admin']), SeriesController.deleteSeries);
router.post('/:id/toggle-featured', authMiddleware(['moderator', 'admin']), SeriesController.toggleFeatured);

export const SeriesRoutes = router;
