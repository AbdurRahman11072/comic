"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const stats_service_1 = require("./stats.service");
const getAdminStats = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await stats_service_1.StatsService.getAdminStats();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Stats fetched successfully',
        data: result,
    });
});
exports.StatsController = {
    getAdminStats,
};
