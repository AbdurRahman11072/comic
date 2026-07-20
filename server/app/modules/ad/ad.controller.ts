import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { AdService } from './ad.service';
import geoip from 'geoip-lite';

const earnAdPoints = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  // Basic IP detection (trust proxy must be enabled in express if behind proxy)
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : (forwarded || req.socket.remoteAddress || '127.0.0.1')) as string;
  
  const result = await AdService.earnAdPoints(userId as string, ip);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ad points earned successfully',
    data: result,
  });
});

const getActiveCustomAd = asyncHandler(async (req: Request, res: Response) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : (forwarded || req.socket.remoteAddress || '127.0.0.1')) as string;
  const geo = geoip.lookup(ip);
  const countryCode = geo ? geo.country : undefined;

  const result = await AdService.getActiveCustomAd(countryCode);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Active custom ad fetched',
    data: result,
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

const createCustomAd = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdService.createCustomAd(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Custom ad created',
    data: result,
  });
});

const updateCustomAd = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdService.updateCustomAd(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Custom ad updated',
    data: result,
  });
});

const deleteCustomAd = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdService.deleteCustomAd(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Custom ad deleted',
    data: null,
  });
});

export const AdController = {
  earnAdPoints,
  getActiveCustomAd,
  getCustomAds,
  createCustomAd,
  updateCustomAd,
  deleteCustomAd,
};

