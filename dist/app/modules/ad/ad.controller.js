"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const ad_service_1 = require("./ad.service");
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const earnAdPoints = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    // Basic IP detection (trust proxy must be enabled in express if behind proxy)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : (forwarded || req.socket.remoteAddress || '127.0.0.1'));
    const result = await ad_service_1.AdService.earnAdPoints(userId, ip);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Ad points earned successfully',
        data: result,
    });
});
const getActiveCustomAd = (0, asyncHandler_1.default)(async (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : (forwarded || req.socket.remoteAddress || '127.0.0.1'));
    const geo = geoip_lite_1.default.lookup(ip);
    const countryCode = geo ? geo.country : undefined;
    const result = await ad_service_1.AdService.getActiveCustomAd(countryCode);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Active custom ad fetched',
        data: result,
    });
});
const getCustomAds = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await ad_service_1.AdService.getCustomAds(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Custom ads fetched',
        pagination: result.meta,
        data: result.data,
    });
});
const createCustomAd = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await ad_service_1.AdService.createCustomAd(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Custom ad created',
        data: result,
    });
});
const updateCustomAd = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await ad_service_1.AdService.updateCustomAd(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Custom ad updated',
        data: result,
    });
});
const deleteCustomAd = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    await ad_service_1.AdService.deleteCustomAd(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Custom ad deleted',
        data: null,
    });
});
exports.AdController = {
    earnAdPoints,
    getActiveCustomAd,
    getCustomAds,
    createCustomAd,
    updateCustomAd,
    deleteCustomAd,
};
