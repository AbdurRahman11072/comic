import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { PointsService } from './points.service';
import AppError from '../../error/AppError';

const getBalance = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');

  const result = await PointsService.getBalance(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Point balance fetched successfully',
    data: result,
  });
});

const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');

  const result = await PointsService.getTransactions(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactions fetched successfully',
    data: result,
  });
});

const earnFromAd = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const amount = Number(req.body.amount) || 10;
  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');

  const result = await PointsService.earnFromAd(userId, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `You earned ${amount} points!`,
    data: result,
  });
});

const buyChapter = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { chapterId } = req.body;

  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  if (!chapterId) throw new AppError(httpStatus.BAD_REQUEST, 'chapterId is required');

  const result = await PointsService.buyChapter(userId, chapterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chapter unlocked successfully',
    data: result,
  });
});

export const PointsController = {
  getBalance,
  getTransactions,
  earnFromAd,
  buyChapter,
};
