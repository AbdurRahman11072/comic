"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const cloudinary_1 = require("../../utils/cloudinary");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const uploadImage = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.file) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'No file uploaded');
    }
    const result = await (0, cloudinary_1.uploadOnCloudinary)(req.file.path);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to upload image');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Image uploaded successfully',
        data: { url: result },
    });
});
exports.UploadController = {
    uploadImage,
};
