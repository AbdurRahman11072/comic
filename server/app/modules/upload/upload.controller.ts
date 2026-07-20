import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import { uploadOnCloudinary } from '../../utils/cloudinary';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../error/AppError';

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  const result = await uploadOnCloudinary(req.file.path);

  if (!result) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload image');
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Image uploaded successfully',
    data: { url: result },
  });
});

export const UploadController = {
  uploadImage,
};
