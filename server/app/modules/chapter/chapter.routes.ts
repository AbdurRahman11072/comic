import { Router } from 'express';
import { ChapterController } from './chapter.controller';
import authMiddleware, { optionalAuthMiddleware } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { createChapterSchema, updateChapterSchema } from './chapter.validation';

const router = Router();

router.get('/', ChapterController.getAllChapters);
router.post(
  '/extract-webpage-images',
  authMiddleware(['creator', 'moderator', 'admin']),
  ChapterController.extractWebpageImages
);
router.get('/:id', optionalAuthMiddleware, ChapterController.getChapterById);
router.get('/:slug/:number', optionalAuthMiddleware, ChapterController.getChapterByNumber);
router.post(
  '/',
  authMiddleware(['creator', 'moderator', 'admin']),
  validateRequest(createChapterSchema),
  ChapterController.createChapter
);
router.put(
  '/:id',
  authMiddleware(['creator', 'moderator', 'admin']),
  validateRequest(updateChapterSchema),
  ChapterController.updateChapter
);
router.delete('/:id', authMiddleware(['creator', 'moderator', 'admin']), ChapterController.deleteChapter);

export const ChapterRoutes = router;
