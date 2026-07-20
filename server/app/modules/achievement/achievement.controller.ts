import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { AchievementService } from './achievement.service';

const getAchievements = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await AchievementService.getAchievements(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Achievements retrieved successfully',
    data: result,
  });
});

const checkAndUnlockAchievements = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const newlyUnlocked = await AchievementService.checkAndUnlockAchievements(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Achievements checked successfully',
    data: {
      newlyUnlocked,
      count: newlyUnlocked.length
    },
  });
});

export const AchievementController = {
  getAchievements,
  checkAndUnlockAchievements
};
