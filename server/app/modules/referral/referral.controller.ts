import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { ReferralService } from './referral.service';

const getReferralStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await ReferralService.getReferralStats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referral statistics retrieved successfully',
    data: result,
  });
});

const validateReferralCode = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;
  const result = await ReferralService.validateReferralCode(code as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referral code is valid',
    data: result,
  });
});

export const ReferralController = {
  getReferralStats,
  validateReferralCode,
};
