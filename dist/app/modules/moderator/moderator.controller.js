"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeratorController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const moderator_service_1 = require("./moderator.service");
const banUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await moderator_service_1.ModeratorService.banUser(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.banned ? 'User banned successfully' : 'User unbanned successfully',
        data: result,
    });
});
const freezeUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await moderator_service_1.ModeratorService.freezeUser(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.transactionsFrozen ? 'Transactions frozen' : 'Transactions unfrozen',
        data: result,
    });
});
const getSeriesApplications = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await moderator_service_1.ModeratorService.getSeriesApplications(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Series applications fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
});
const reviewSeriesApplication = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await moderator_service_1.ModeratorService.reviewSeriesApplication(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Series application ${result.status.toLowerCase()}`,
        data: result,
    });
});
const getWithdrawalRequests = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await moderator_service_1.ModeratorService.getWithdrawalRequests(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Withdrawal requests fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
});
const reviewWithdrawalRequest = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await moderator_service_1.ModeratorService.reviewWithdrawalRequest(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Withdrawal request ${result.status.toLowerCase()}`,
        data: result,
    });
});
const getFeaturedRequests = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await moderator_service_1.ModeratorService.getFeaturedRequests(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Featured requests fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
});
const reviewFeaturedRequest = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await moderator_service_1.ModeratorService.reviewFeaturedRequest(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Featured request ${result.status.toLowerCase()}`,
        data: result,
    });
});
exports.ModeratorController = {
    banUser,
    freezeUser,
    getSeriesApplications,
    reviewSeriesApplication,
    getWithdrawalRequests,
    reviewWithdrawalRequest,
    getFeaturedRequests,
    reviewFeaturedRequest,
};
