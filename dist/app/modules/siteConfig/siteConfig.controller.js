"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteConfigController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const siteConfig_service_1 = require("./siteConfig.service");
const getConfig = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await siteConfig_service_1.SiteConfigService.getConfig();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Site configuration fetched successfully',
        data: result,
    });
});
const updateConfig = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await siteConfig_service_1.SiteConfigService.updateConfig(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Site configuration updated successfully',
        data: result,
    });
});
exports.SiteConfigController = {
    getConfig,
    updateConfig,
};
