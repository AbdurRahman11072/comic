import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { StatsService } from './stats.service';

const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await StatsService.getAdminStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stats fetched successfully',
    data: result,
  });
});

export const StatsController = {
  getAdminStats,
};
