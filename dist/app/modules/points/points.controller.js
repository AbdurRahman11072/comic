"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const points_service_1 = require("./points.service");
const AppError_1 = __importDefault(require("../../error/AppError"));
const getBalance = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    const result = await points_service_1.PointsService.getBalance(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Point balance fetched successfully',
        data: result,
    });
});
const getTransactions = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    const result = await points_service_1.PointsService.getTransactions(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Transactions fetched successfully',
        data: result,
    });
});
const earnFromAd = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const amount = Number(req.body.amount) || 10;
    if (!userId)
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    const result = await points_service_1.PointsService.earnFromAd(userId, amount);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `You earned ${amount} points!`,
        data: result,
    });
});
const buyChapter = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const { chapterId } = req.body;
    if (!userId)
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    if (!chapterId)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'chapterId is required');
    const result = await points_service_1.PointsService.buyChapter(userId, chapterId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chapter unlocked successfully',
        data: result,
    });
});
exports.PointsController = {
    getBalance,
    getTransactions,
    earnFromAd,
    buyChapter,
};
