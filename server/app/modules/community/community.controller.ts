import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { CommunityService } from './community.service';

// --- Comments ---
const getComments = asyncHandler(async (req: Request, res: Response) => {
  const { chapterId } = req.params;
  const result = await CommunityService.getComments(chapterId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments fetched successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const createComment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CommunityService.createComment(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment posted successfully',
    data: result,
  });
});

const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;
  await CommunityService.deleteComment(id as string, userId as string, role as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: null,
  });
});

// --- Reviews ---
const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const { seriesId } = req.params;
  const result = await CommunityService.getReviews(seriesId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews fetched successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const createReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CommunityService.createReview(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;
  await CommunityService.deleteReview(id as string, userId as string, role as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

// --- Reports ---
const createReport = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CommunityService.createReport(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Report submitted successfully',
    data: result,
  });
});

const getReports = asyncHandler(async (req: Request, res: Response) => {
  const result = await CommunityService.getReports(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reports fetched successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const resolveReport = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CommunityService.resolveReport(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Report ${result.status.toLowerCase()}`,
    data: result,
  });
});

const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const result = await CommunityService.getChatMessages();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat messages retrieved successfully',
    data: result,
  });
});

const createChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { content } = req.body;
  const result = await CommunityService.createChatMessage(userId as string, content as string);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Chat message posted successfully',
    data: result,
  });
});

const deleteChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CommunityService.deleteChatMessage(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat message deleted successfully',
    data: null,
  });
});

export const CommunityController = {
  getComments,
  createComment,
  deleteComment,
  getReviews,
  createReview,
  deleteReview,
  createReport,
  getReports,
  resolveReport,
  getChatMessages,
  createChatMessage,
  deleteChatMessage
};
