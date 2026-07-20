"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const withdrawal_service_1 = require("./withdrawal.service");
const requestWithdrawal = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await withdrawal_service_1.WithdrawalService.requestWithdrawal(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Withdrawal request submitted successfully',
        data: result,
    });
});
const getMyRequests = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const result = await withdrawal_service_1.WithdrawalService.getMyRequests(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Withdrawal requests fetched successfully',
        data: result,
    });
});
exports.WithdrawalController = {
    requestWithdrawal,
    getMyRequests,
};
