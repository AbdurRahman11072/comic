"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityRoutes = void 0;
const express_1 = __importDefault(require("express"));
const community_controller_1 = require("./community.controller");
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const authMiddleware_2 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
// Comments
router.get('/comments/:chapterId', authMiddleware_2.optionalAuthMiddleware, community_controller_1.CommunityController.getComments);
router.post('/comments', (0, authMiddleware_1.default)(['user', 'creator', 'moderator', 'admin']), community_controller_1.CommunityController.createComment);
router.delete('/comments/:id', (0, authMiddleware_1.default)(['user', 'creator', 'moderator', 'admin']), community_controller_1.CommunityController.deleteComment);
// Reviews
router.get('/reviews/:seriesId', authMiddleware_2.optionalAuthMiddleware, community_controller_1.CommunityController.getReviews);
router.post('/reviews', (0, authMiddleware_1.default)(['user', 'creator', 'moderator', 'admin']), community_controller_1.CommunityController.createReview);
router.delete('/reviews/:id', (0, authMiddleware_1.default)(['user', 'creator', 'moderator', 'admin']), community_controller_1.CommunityController.deleteReview);
// Reports
router.post('/reports', (0, authMiddleware_1.default)(['user', 'creator', 'moderator', 'admin']), community_controller_1.CommunityController.createReport);
router.get('/reports', (0, authMiddleware_1.default)(['moderator', 'admin']), community_controller_1.CommunityController.getReports);
router.post('/reports/:id/resolve', (0, authMiddleware_1.default)(['moderator', 'admin']), community_controller_1.CommunityController.resolveReport);
// Chat Room
router.get('/chat', authMiddleware_2.optionalAuthMiddleware, community_controller_1.CommunityController.getChatMessages);
router.post('/chat', (0, authMiddleware_1.default)(['user', 'creator', 'moderator', 'admin']), community_controller_1.CommunityController.createChatMessage);
router.delete('/chat/:id', (0, authMiddleware_1.default)(['moderator', 'admin']), community_controller_1.CommunityController.deleteChatMessage);
exports.CommunityRoutes = router;
