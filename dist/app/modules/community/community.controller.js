"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const community_service_1 = require("./community.service");
// --- Comments ---
const getComments = (0, asyncHandler_1.default)(async (req, res) => {
    const { chapterId } = req.params;
    const result = await community_service_1.CommunityService.getComments(chapterId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Comments fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
});
const createComment = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await community_service_1.CommunityService.createComment(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Comment posted successfully',
        data: result,
    });
});
const deleteComment = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;
    await community_service_1.CommunityService.deleteComment(id, userId, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Comment deleted successfully',
        data: null,
    });
});
// --- Reviews ---
const getReviews = (0, asyncHandler_1.default)(async (req, res) => {
    const { seriesId } = req.params;
    const result = await community_service_1.CommunityService.getReviews(seriesId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reviews fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
});
const createReview = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await community_service_1.CommunityService.createReview(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Review submitted successfully',
        data: result,
    });
});
const deleteReview = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;
    await community_service_1.CommunityService.deleteReview(id, userId, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Review deleted successfully',
        data: null,
    });
});
// --- Reports ---
const createReport = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await community_service_1.CommunityService.createReport(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Report submitted successfully',
        data: result,
    });
});
const getReports = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await community_service_1.CommunityService.getReports(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reports fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
});
const resolveReport = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await community_service_1.CommunityService.resolveReport(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Report ${result.status.toLowerCase()}`,
        data: result,
    });
});
const getChatMessages = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await community_service_1.CommunityService.getChatMessages();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chat messages retrieved successfully',
        data: result,
    });
});
const createChatMessage = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const { content } = req.body;
    const result = await community_service_1.CommunityService.createChatMessage(userId, content);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Chat message posted successfully',
        data: result,
    });
});
const deleteChatMessage = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    await community_service_1.CommunityService.deleteChatMessage(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chat message deleted successfully',
        data: null,
    });
});
exports.CommunityController = {
    getComments,
    createComment,
    deleteComment,
    getReviews,
    createReview,
    deleteReview,
    createReport,
    getReports,
    resolveReport,
    getChatMessages,
    createChatMessage,
    deleteChatMessage
};
