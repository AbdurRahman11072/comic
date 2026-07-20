"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOnCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../error/AppError"));
const envConfig_1 = require("../config/envConfig");
cloudinary_1.v2.config({
    cloud_name: envConfig_1.envConfig.CLOUDINARY_CLOUD_NAME,
    api_key: envConfig_1.envConfig.CLOUDINARY_API_KEY,
    api_secret: envConfig_1.envConfig.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'File path not found');
        }
        const res = await cloudinary_1.v2.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });
        // Remove local file after successful upload
        if (fs_1.default.existsSync(localFilePath)) {
            fs_1.default.unlinkSync(localFilePath);
        }
        return res.url;
    }
    catch (error) {
        // Remove local file if upload fails
        if (fs_1.default.existsSync(localFilePath)) {
            fs_1.default.unlinkSync(localFilePath);
        }
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to upload file to Cloudinary');
    }
};
exports.uploadOnCloudinary = uploadOnCloudinary;
