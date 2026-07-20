"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const achievement_service_1 = require("./achievement.service");
const getAchievements = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await achievement_service_1.AchievementService.getAchievements(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Achievements retrieved successfully',
        data: result,
    });
});
const checkAndUnlockAchievements = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const newlyUnlocked = await achievement_service_1.AchievementService.checkAndUnlockAchievements(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Achievements checked successfully',
        data: {
            newlyUnlocked,
            count: newlyUnlocked.length
        },
    });
});
exports.AchievementController = {
    getAchievements,
    checkAndUnlockAchievements
};
