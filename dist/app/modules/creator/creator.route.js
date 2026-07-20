"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorRoutes = void 0;
const express_1 = __importDefault(require("express"));
const creator_controller_1 = require("./creator.controller");
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const router = express_1.default.Router();
router.get('/profile', (0, authMiddleware_1.default)(['creator', 'admin']), creator_controller_1.CreatorController.getProfile);
router.put('/profile', (0, authMiddleware_1.default)(['creator', 'admin']), creator_controller_1.CreatorController.updateProfile);
router.get('/analytics', (0, authMiddleware_1.default)(['creator', 'admin']), creator_controller_1.CreatorController.getAnalytics);
router.post('/series-application', (0, authMiddleware_1.default)(['user', 'creator', 'admin']), creator_controller_1.CreatorController.applyForSeries);
router.post('/feature-request', (0, authMiddleware_1.default)(['creator', 'admin']), creator_controller_1.CreatorController.requestFeatureSeries);
router.get('/feature-requests', (0, authMiddleware_1.default)(['creator', 'admin']), creator_controller_1.CreatorController.getCreatorFeatureRequests);
exports.CreatorRoutes = router;
