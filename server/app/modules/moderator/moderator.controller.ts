import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { ModeratorService } from './moderator.service';

const banUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ModeratorService.banUser(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.banned ? 'User banned successfully' : 'User unbanned successfully',
    data: result,
  });
});

const freezeUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ModeratorService.freezeUser(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.transactionsFrozen ? 'Transactions frozen' : 'Transactions unfrozen',
    data: result,
  });
});

const muteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ModeratorService.muteUser(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.mutedUntil ? `User muted until ${result.mutedUntil}` : 'User unmuted successfully',
    data: result,
  });
});

const getSeriesApplications = asyncHandler(async (req: Request, res: Response) => {
  const result = await ModeratorService.getSeriesApplications(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Series applications fetched successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const reviewSeriesApplication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ModeratorService.reviewSeriesApplication(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Series application ${result.status.toLowerCase()}`,
    data: result,
  });
});

const getWithdrawalRequests = asyncHandler(async (req: Request, res: Response) => {
  const result = await ModeratorService.getWithdrawalRequests(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Withdrawal requests fetched successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const reviewWithdrawalRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ModeratorService.reviewWithdrawalRequest(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Withdrawal request ${result.status.toLowerCase()}`,
    data: result,
  });
});

const getFeaturedRequests = asyncHandler(async (req: Request, res: Response) => {
  const result = await ModeratorService.getFeaturedRequests(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Featured requests fetched successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const reviewFeaturedRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ModeratorService.reviewFeaturedRequest(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Featured request ${result.status.toLowerCase()}`,
    data: result,
  });
});

const getUserFinancialHistory = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await ModeratorService.getUserFinancialHistory(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User financial history fetched successfully',
    data: result,
  });
});

export const ModeratorController = {
  banUser,
  freezeUser,
  muteUser,
  getSeriesApplications,
  reviewSeriesApplication,
  getWithdrawalRequests,
  getUserFinancialHistory,
  reviewWithdrawalRequest,
  getFeaturedRequests,
  reviewFeaturedRequest,
};
