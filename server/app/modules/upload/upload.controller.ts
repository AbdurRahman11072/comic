import httpStatus from 'http-status';
import axios from 'axios';
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

const proxyImage = asyncHandler(async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid image URL parameter');
  }

  try {
    const parsed = new URL(imageUrl);
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': parsed.origin,
      },
      timeout: 15000,
    });

    const contentType = String(response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(response.data));
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to proxy remote image');
  }
});

export const UploadController = {
  uploadImage,
  proxyImage,
};
