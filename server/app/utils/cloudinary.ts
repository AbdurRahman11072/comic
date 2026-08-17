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

export const uploadOnCloudinary = async (localFilePath: string): Promise<string> => {
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

    return res.secure_url || res.url;
  } catch (error: any) {
    // Remove local file if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new AppError(httpStatus.BAD_REQUEST, error?.message || 'Failed to upload file to Cloudinary');
  }
};

export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let path = parts[1]; // e.g. "v1786998325/ifojoqew8vowu9jmdvte.webp" or "folder/image.png"
    // Remove version prefix if exists (v123456/)
    path = path.replace(/^v\d+\//, '');
    // Remove file extension
    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      path = path.substring(0, lastDotIndex);
    }
    return path;
  } catch (e) {
    return null;
  }
};

export const deleteFromCloudinary = async (urlOrPublicId: string) => {
  try {
    if (!urlOrPublicId) return;
    const publicId = urlOrPublicId.includes('cloudinary.com')
      ? extractPublicIdFromUrl(urlOrPublicId)
      : urlOrPublicId;

    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};
