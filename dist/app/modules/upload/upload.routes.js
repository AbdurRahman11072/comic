"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadRoutes = void 0;
const express_1 = require("express");
const upload_controller_1 = require("./upload.controller");
const multer_1 = require("../../middleware/multer");
const router = (0, express_1.Router)();
router.post('/', multer_1.multerUpload.single('image'), upload_controller_1.UploadController.uploadImage);
exports.UploadRoutes = router;
