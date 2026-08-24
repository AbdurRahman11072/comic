import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { AdRevenueService } from './adRevenue.service';
import AppError from '../../error/AppError';

const trackReadEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id || null;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
  const userAgent = req.headers['user-agent'] as string | undefined;

  const result = await AdRevenueService.trackReadEvent(
    req.body,
    userId,
    clientIp,
    userAgent
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reading session event tracked successfully',
    data: {
      id: result.id,
      sessionId: result.sessionId,
      chapterId: result.chapterId,
      qualityTier: result.qualityTier,
      qualityScore: result.qualityScore,
      isBotLikely: result.isBotLikely,
      durationSeconds: result.durationSeconds,
      completionPercent: result.completionPercent,
      interactionCount: result.interactionCount,
    },
  });
});

const getDistributionPreview = asyncHandler(async (req: Request, res: Response) => {
  const { periodStart, periodEnd, amount, currency } = req.query;

  const startDate = new Date(periodStart as string);
  const endDate = new Date(periodEnd as string);
  const poolAmount = Number(amount);
  const poolCurrency = (currency as 'USD' | 'POINTS') || 'USD';

  const preview = await AdRevenueService.getDistributionPreview(
    startDate,
    endDate,
    poolAmount,
    poolCurrency
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Revenue distribution preview calculated successfully',
    data: preview,
  });
});

const executeDistribution = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user?.id;
  if (!adminId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Admin authentication required');
  }

  const { periodStart, periodEnd, amount, currency, notes } = req.body;

  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);
  const poolAmount = Number(amount);
  const poolCurrency = (currency as 'USD' | 'POINTS') || 'USD';

  const result = await AdRevenueService.executeDistribution(
    adminId,
    startDate,
    endDate,
    poolAmount,
    poolCurrency,
    notes
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Revenue distribution executed successfully and points credited',
    data: result,
  });
});

const getDistributionHistory = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await AdRevenueService.getDistributionHistory(page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Revenue distribution history fetched successfully',
    data: result.runs,
    pagination: result.pagination,
  });
});

const getDistributionDetails = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await AdRevenueService.getDistributionDetails(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Revenue distribution details fetched successfully',
    data: result,
  });
});

const revertDistribution = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user?.id;
  if (!adminId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Admin authentication required');
  }
  const id = req.params.id as string;
  const { revertReason } = req.body;

  const result = await AdRevenueService.revertDistribution(id, adminId, revertReason);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Revenue distribution run successfully reverted and points adjusted',
    data: result,
  });
});

export const AdRevenueController = {
  trackReadEvent,
  getDistributionPreview,
  executeDistribution,
  revertDistribution,
  getDistributionHistory,
  getDistributionDetails,
};
