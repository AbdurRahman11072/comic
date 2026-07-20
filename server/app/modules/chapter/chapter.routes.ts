import { Router } from 'express';
import { ChapterController } from './chapter.controller';
import { optionalAuthMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', ChapterController.getAllChapters);
router.get('/:id', optionalAuthMiddleware, ChapterController.getChapterById);
router.get('/:slug/:number', optionalAuthMiddleware, ChapterController.getChapterByNumber);
router.post('/', ChapterController.createChapter); // Add auth middleware later
router.put('/:id', ChapterController.updateChapter);
router.delete('/:id', ChapterController.deleteChapter);

export const ChapterRoutes = router;
