import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { SiteConfigService } from './siteConfig.service';

const getConfig = asyncHandler(async (req: Request, res: Response) => {
  const result = await SiteConfigService.getConfig();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Site configuration fetched successfully',
    data: result,
  });
});

const updateConfig = asyncHandler(async (req: Request, res: Response) => {
  const result = await SiteConfigService.updateConfig(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Site configuration updated successfully',
    data: result,
  });
});

export const SiteConfigController = {
  getConfig,
  updateConfig,
};
