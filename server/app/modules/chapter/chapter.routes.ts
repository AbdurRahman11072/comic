import { Router } from 'express';
import { ChapterController } from './chapter.controller';
import authMiddleware, { optionalAuthMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', ChapterController.getAllChapters);
router.get('/:id', optionalAuthMiddleware, ChapterController.getChapterById);
router.get('/:slug/:number', optionalAuthMiddleware, ChapterController.getChapterByNumber);
router.post('/', authMiddleware(['creator', 'moderator', 'admin']), ChapterController.createChapter);
router.put('/:id', authMiddleware(['creator', 'moderator', 'admin']), ChapterController.updateChapter);
router.delete('/:id', authMiddleware(['creator', 'moderator', 'admin']), ChapterController.deleteChapter);

export const ChapterRoutes = router;
