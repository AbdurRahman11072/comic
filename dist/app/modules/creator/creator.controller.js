"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const creator_service_1 = require("./creator.service");
const getProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await creator_service_1.CreatorService.getProfile(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Creator profile fetched successfully',
        data: result,
    });
});
const updateProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await creator_service_1.CreatorService.updateProfile(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Creator profile updated successfully',
        data: result,
    });
});
const applyForSeries = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await creator_service_1.CreatorService.applyForSeries(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Series application submitted successfully',
        data: result,
    });
});
const getAnalytics = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await creator_service_1.CreatorService.getAnalytics(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Creator analytics fetched successfully',
        data: result,
    });
});
const requestFeatureSeries = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const { seriesId, notes } = req.body;
    const result = await creator_service_1.CreatorService.requestFeatureSeries(userId, seriesId, notes);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Featured request submitted successfully',
        data: result,
    });
});
const getCreatorFeatureRequests = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await creator_service_1.CreatorService.getCreatorFeatureRequests(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Creator featured requests fetched successfully',
        data: result,
    });
});
exports.CreatorController = {
    getProfile,
    updateProfile,
    applyForSeries,
    getAnalytics,
    requestFeatureSeries,
    getCreatorFeatureRequests,
};
