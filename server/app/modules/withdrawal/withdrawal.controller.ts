import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { WithdrawalService } from './withdrawal.service';

const requestWithdrawal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await WithdrawalService.requestWithdrawal(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Withdrawal request submitted successfully',
    data: result,
  });
});

const getMyRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await WithdrawalService.getMyRequests(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Withdrawal requests fetched successfully',
    data: result,
  });
});

export const WithdrawalController = {
  requestWithdrawal,
  getMyRequests,
};
