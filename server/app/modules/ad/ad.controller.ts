import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { AdService } from './ad.service';
import geoip from 'geoip-lite';

const earnAdPoints = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { adId } = req.body;
  
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : (forwarded || req.socket.remoteAddress || '127.0.0.1')) as string;
  
  const result = await AdService.earnAdPoints(userId as string, ip, adId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ad points earned successfully',
    data: result,
  });
});

const getAdByPlacement = asyncHandler(async (req: Request, res: Response) => {
  const { placement } = req.params;
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : (forwarded || req.socket.remoteAddress || '127.0.0.1')) as string;
  const geo = geoip.lookup(ip);
  const countryCode = geo ? geo.country : undefined;

  const result = await AdService.getAdByPlacement(placement as string, countryCode);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ad placement fetched',
    data: result,
  });
});

const recordImpression = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdService.recordImpression(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Impression recorded',
    data: null,
  });
});

const recordClick = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdService.recordClick(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Click recorded',
    data: null,
  });
});

const getCustomAds = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdService.getCustomAds(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Custom ads fetched',
    pagination: result.meta,
    data: result.data,
  });
});

const getAdStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdService.getAdStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ad performance stats fetched',
    data: result,
  });
});

const createCustomAd = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdService.createCustomAd(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Ad configuration created',
    data: result,
  });
});

const updateCustomAd = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdService.updateCustomAd(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ad configuration updated',
    data: result,
  });
});

const deleteCustomAd = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdService.deleteCustomAd(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ad deleted',
    data: null,
  });
});

export const AdController = {
  earnAdPoints,
  getAdByPlacement,
  recordImpression,
  recordClick,
  getCustomAds,
  getAdStats,
  createCustomAd,
  updateCustomAd,
  deleteCustomAd,
};
