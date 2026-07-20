import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';
import AppError from '../../error/AppError';

const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');

  const result = await UserService.getProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile fetched successfully',
    data: result,
  });
});

const toggleBookmark = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { seriesId } = req.body;
  
  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');

  const result = await UserService.toggleBookmark(userId, seriesId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.isBookmarked ? 'Series bookmarked' : 'Bookmark removed',
    data: result,
  });
});

const updateHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { seriesId, chapterId } = req.body;

  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');

  const result = await UserService.updateHistory(userId, seriesId, chapterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reading history updated',
    data: result,
  });
});

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.updateUser(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');

  const result = await UserService.updateUser(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await UserService.deleteUser(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: null,
  });
});

const getAllTransactions = asyncHandler(async (req: Request, res: Response) => {
  const result = await UserService.getAllTransactions(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactions fetched successfully',
    pagination: result.meta,
    data: result.data,
  });
});

export const UserController = {
  getProfile,
  updateProfile,
  toggleBookmark,
  updateHistory,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllTransactions,
};
