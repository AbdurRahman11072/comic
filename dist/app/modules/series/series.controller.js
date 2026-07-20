"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeriesController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const series_service_1 = require("./series.service");
const getAllSeries = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await series_service_1.SeriesService.getAllSeries(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Series fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
});
const getPinnedSeries = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await series_service_1.SeriesService.getPinnedSeries();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Pinned series fetched successfully',
        data: result,
    });
});
const getDiscountedSeries = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await series_service_1.SeriesService.getDiscountedSeries();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Discounted series fetched successfully',
        data: result,
    });
});
const getSeriesBySlug = (0, asyncHandler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const result = await series_service_1.SeriesService.getSeriesBySlug(slug, req.user?.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Series details fetched successfully',
        data: result,
    });
});
const getSeriesById = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await series_service_1.SeriesService.getSeriesById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Series details fetched successfully',
        data: result,
    });
});
const createSeries = (0, asyncHandler_1.default)(async (req, res) => {
    const creatorId = req.user?.id;
    const result = await series_service_1.SeriesService.createSeries({ ...req.body, creatorId });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Series created successfully',
        data: result,
    });
});
const updateSeries = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await series_service_1.SeriesService.updateSeries(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Series updated successfully',
        data: result,
    });
});
const deleteSeries = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    await series_service_1.SeriesService.deleteSeries(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Series deleted successfully',
        data: null,
    });
});
const toggleFeatured = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await series_service_1.SeriesService.toggleFeatured(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.featured ? 'Series added to featured' : 'Series removed from featured',
        data: result,
    });
});
const getFeaturedSeries = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await series_service_1.SeriesService.getFeaturedSeries();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Featured series fetched successfully',
        data: result,
    });
});
exports.SeriesController = {
    getAllSeries,
    getSeriesBySlug,
    getPinnedSeries,
    getDiscountedSeries,
    getFeaturedSeries,
    createSeries,
    updateSeries,
    deleteSeries,
    toggleFeatured,
    getSeriesById,
};
