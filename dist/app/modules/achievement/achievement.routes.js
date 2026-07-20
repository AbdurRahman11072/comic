"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementRoutes = void 0;
const express_1 = __importDefault(require("express"));
const achievement_controller_1 = require("./achievement.controller");
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const router = express_1.default.Router();
const userAuth = (0, authMiddleware_1.default)(['user', 'creator', 'moderator', 'admin']);
router.get('/', userAuth, achievement_controller_1.AchievementController.getAchievements);
router.post('/check', userAuth, achievement_controller_1.AchievementController.checkAndUnlockAchievements);
exports.AchievementRoutes = router;
