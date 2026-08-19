import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { ChapterService } from './chapter.service';

const getChapterById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const result = await ChapterService.getChapterById(id as string, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chapter fetched successfully',
    data: result,
  });
});

const getChapterByNumber = asyncHandler(async (req: Request, res: Response) => {
  const { slug, number } = req.params;
  const userId = req.user?.id;
  const result = await ChapterService.getChapterByNumber(slug as string, Number(number), userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chapter fetched successfully',
    data: result,
  });
});

const getAllChapters = asyncHandler(async (req: Request, res: Response) => {
  const result = await ChapterService.getAllChapters(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chapters fetched successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const createChapter = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const result = await ChapterService.createChapter(req.body, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Chapter created successfully',
    data: result,
  });
});

const updateChapter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;
  const result = await ChapterService.updateChapter(id as string, req.body, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chapter updated successfully',
    data: result,
  });
});

const deleteChapter = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;
  await ChapterService.deleteChapter(id as string, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chapter deleted successfully',
    data: null,
  });
});

const extractWebpageImages = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;
  const result = await ChapterService.extractWebpageImages(url);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Images extracted successfully from webpage',
    data: result,
  });
});

export const ChapterController = {
  getChapterById,
  getChapterByNumber,
  getAllChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  extractWebpageImages,
};
