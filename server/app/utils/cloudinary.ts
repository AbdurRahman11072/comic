import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import httpStatus from 'http-status';
import AppError from '../error/AppError';
import { envConfig } from '../config/envConfig';

cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME as string,
  api_key: envConfig.CLOUDINARY_API_KEY as string,
  api_secret: envConfig.CLOUDINARY_API_SECRET as string,
});

export const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) {
      throw new AppError(httpStatus.NOT_FOUND, 'File path not found');
    }

    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    
    // Remove local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return res.url;
  } catch (error) {
    // Remove local file if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to upload file to Cloudinary');
  }
};
