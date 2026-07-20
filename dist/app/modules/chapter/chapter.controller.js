"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const chapter_service_1 = require("./chapter.service");
const getChapterById = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const result = await chapter_service_1.ChapterService.getChapterById(id, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chapter fetched successfully',
        data: result,
    });
});
const getChapterByNumber = (0, asyncHandler_1.default)(async (req, res) => {
    const { slug, number } = req.params;
    const userId = req.user?.id;
    const result = await chapter_service_1.ChapterService.getChapterByNumber(slug, Number(number), userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chapter fetched successfully',
        data: result,
    });
});
const getAllChapters = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await chapter_service_1.ChapterService.getAllChapters(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chapters fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
});
const createChapter = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await chapter_service_1.ChapterService.createChapter(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Chapter created successfully',
        data: result,
    });
});
const updateChapter = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await chapter_service_1.ChapterService.updateChapter(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chapter updated successfully',
        data: result,
    });
});
const deleteChapter = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    await chapter_service_1.ChapterService.deleteChapter(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Chapter deleted successfully',
        data: null,
    });
});
exports.ChapterController = {
    getChapterById,
    getChapterByNumber,
    getAllChapters,
    createChapter,
    updateChapter,
    deleteChapter,
};
