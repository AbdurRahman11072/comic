import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { CreatorService } from './creator.service';

const getAllCreators = asyncHandler(async (req: Request, res: Response) => {
  const result = await CreatorService.getAllCreators(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All creators fetched successfully',
    data: result,
  });
});

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

const getSingleSeriesAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const result = await CreatorService.getSingleSeriesAnalytics(userId as string, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Series analytics fetched successfully',
    data: result,
  });
});

const requestFeatureSeries = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { seriesId, durationDays, notes } = req.body;
  const result = await CreatorService.requestFeatureSeries(userId as string, seriesId, durationDays, notes);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Featured placement request submitted to admin for review',
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

const getPublicChannel = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CreatorService.getPublicChannel(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Creator channel fetched successfully',
    data: result,
  });
});

const createCreatorPost = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CreatorService.createCreatorPost(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Channel announcement posted successfully',
    data: result,
  });
});

const getCreatorPosts = asyncHandler(async (req: Request, res: Response) => {
  const { creatorId } = req.params;
  const result = await CreatorService.getCreatorPosts(creatorId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Creator announcements fetched successfully',
    data: result,
  });
});

const deleteCreatorPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  await CreatorService.deleteCreatorPost(id as string, userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Announcement deleted successfully',
    data: null,
  });
});

export const CreatorController = {
  getAllCreators,
  getProfile,
  updateProfile,
  applyForSeries,
  getAnalytics,
  getSingleSeriesAnalytics,
  requestFeatureSeries,
  getCreatorFeatureRequests,
  getPublicChannel,
  createCreatorPost,
  getCreatorPosts,
  deleteCreatorPost,
};
