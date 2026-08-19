import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { StatsService } from './stats.service';

const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user || { id: '', role: 'user' };
  const result = await StatsService.getDashboardStats(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stats fetched successfully',
    data: result,
  });
});

export const StatsController = {
  getDashboardStats,
};
