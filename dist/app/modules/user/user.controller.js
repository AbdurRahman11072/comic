"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const user_service_1 = require("./user.service");
const AppError_1 = __importDefault(require("../../error/AppError"));
const getProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    const result = await user_service_1.UserService.getProfile(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User profile fetched successfully',
        data: result,
    });
});
const toggleBookmark = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const { seriesId } = req.body;
    if (!userId)
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    const result = await user_service_1.UserService.toggleBookmark(userId, seriesId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.isBookmarked ? 'Series bookmarked' : 'Bookmark removed',
        data: result,
    });
});
const updateHistory = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const { seriesId, chapterId } = req.body;
    if (!userId)
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    const result = await user_service_1.UserService.updateHistory(userId, seriesId, chapterId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reading history updated',
        data: result,
    });
});
const getAllUsers = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await user_service_1.UserService.getAllUsers(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Users fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
});
const updateUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await user_service_1.UserService.updateUser(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User updated successfully',
        data: result,
    });
});
const updateProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    const result = await user_service_1.UserService.updateUser(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Profile updated successfully',
        data: result,
    });
});
const deleteUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    await user_service_1.UserService.deleteUser(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User deleted successfully',
        data: null,
    });
});
const getAllTransactions = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await user_service_1.UserService.getAllTransactions(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Transactions fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
});
exports.UserController = {
    getProfile,
    updateProfile,
    toggleBookmark,
    updateHistory,
    getAllUsers,
    updateUser,
    deleteUser,
    getAllTransactions,
};
