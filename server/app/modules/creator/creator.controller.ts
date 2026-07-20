import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { CreatorService } from './creator.service';

const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CreatorService.getProfile(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Creator profile fetched successfully',
    data: result,
  });
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CreatorService.updateProfile(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Creator profile updated successfully',
    data: result,
  });
});

const applyForSeries = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CreatorService.applyForSeries(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Series application submitted successfully',
    data: result,
  });
});

const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CreatorService.getAnalytics(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Creator analytics fetched successfully',
    data: result,
  });
});

const requestFeatureSeries = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { seriesId, notes } = req.body;
  const result = await CreatorService.requestFeatureSeries(userId as string, seriesId, notes);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Featured request submitted successfully',
    data: result,
  });
});

const getCreatorFeatureRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CreatorService.getCreatorFeatureRequests(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Creator featured requests fetched successfully',
    data: result,
  });
});

export const CreatorController = {
  getProfile,
  updateProfile,
  applyForSeries,
  getAnalytics,
  requestFeatureSeries,
  getCreatorFeatureRequests,
};
