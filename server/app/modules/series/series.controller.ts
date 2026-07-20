import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { SeriesService } from './series.service';

const getAllSeries = asyncHandler(async (req: Request, res: Response) => {
  const result = await SeriesService.getAllSeries(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Series fetched successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const getPinnedSeries = asyncHandler(async (req: Request, res: Response) => {
  const result = await SeriesService.getPinnedSeries();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pinned series fetched successfully',
    data: result,
  });
});

const getDiscountedSeries = asyncHandler(async (req: Request, res: Response) => {
  const result = await SeriesService.getDiscountedSeries();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Discounted series fetched successfully',
    data: result,
  });
});

const getSeriesBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await SeriesService.getSeriesBySlug(slug as string, req.user?.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Series details fetched successfully',
    data: result,
  });
});

const getSeriesById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SeriesService.getSeriesById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Series details fetched successfully',
    data: result,
  });
});

const createSeries = asyncHandler(async (req: Request, res: Response) => {
  const creatorId = req.user?.id;
  const result = await SeriesService.createSeries({ ...req.body, creatorId });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Series created successfully',
    data: result,
  });
});

const updateSeries = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SeriesService.updateSeries(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Series updated successfully',
    data: result,
  });
});

const deleteSeries = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await SeriesService.deleteSeries(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Series deleted successfully',
    data: null,
  });
});

const toggleFeatured = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SeriesService.toggleFeatured(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.featured ? 'Series added to featured' : 'Series removed from featured',
    data: result,
  });
});

const getFeaturedSeries = asyncHandler(async (req: Request, res: Response) => {
  const result = await SeriesService.getFeaturedSeries();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Featured series fetched successfully',
    data: result,
  });
});

export const SeriesController = {
  getAllSeries,
  getSeriesBySlug,
  getPinnedSeries,
  getDiscountedSeries,
  getFeaturedSeries,
  createSeries,
  updateSeries,
  deleteSeries,
  toggleFeatured,
  getSeriesById,
};
