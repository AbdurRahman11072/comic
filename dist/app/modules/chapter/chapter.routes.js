"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterRoutes = void 0;
const express_1 = require("express");
const chapter_controller_1 = require("./chapter.controller");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', chapter_controller_1.ChapterController.getAllChapters);
router.get('/:id', authMiddleware_1.optionalAuthMiddleware, chapter_controller_1.ChapterController.getChapterById);
router.get('/:slug/:number', authMiddleware_1.optionalAuthMiddleware, chapter_controller_1.ChapterController.getChapterByNumber);
router.post('/', chapter_controller_1.ChapterController.createChapter); // Add auth middleware later
router.put('/:id', chapter_controller_1.ChapterController.updateChapter);
router.delete('/:id', chapter_controller_1.ChapterController.deleteChapter);
exports.ChapterRoutes = router;
