"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeratorRoutes = void 0;
const express_1 = __importDefault(require("express"));
const moderator_controller_1 = require("./moderator.controller");
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const router = express_1.default.Router();
// General middleware for moderator and admin
const modAuth = (0, authMiddleware_1.default)(['moderator', 'admin']);
// User Management
router.post('/users/:id/ban', modAuth, moderator_controller_1.ModeratorController.banUser);
router.post('/users/:id/freeze', modAuth, moderator_controller_1.ModeratorController.freezeUser);
// Series Applications
router.get('/series-applications', modAuth, moderator_controller_1.ModeratorController.getSeriesApplications);
router.post('/series-applications/:id/review', modAuth, moderator_controller_1.ModeratorController.reviewSeriesApplication);
// Withdrawal Requests
router.get('/withdrawals', modAuth, moderator_controller_1.ModeratorController.getWithdrawalRequests);
router.post('/withdrawals/:id/review', modAuth, moderator_controller_1.ModeratorController.reviewWithdrawalRequest);
// Featured Requests
router.get('/featured-requests', modAuth, moderator_controller_1.ModeratorController.getFeaturedRequests);
router.post('/featured-requests/:id/review', modAuth, moderator_controller_1.ModeratorController.reviewFeaturedRequest);
exports.ModeratorRoutes = router;
