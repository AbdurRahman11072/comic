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

const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const result = await SiteConfigService.submitContactMessage(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Your message has been sent successfully! We will get back to you soon.',
    data: result,
  });
});

const getContactMessages = asyncHandler(async (req: Request, res: Response) => {
  const result = await SiteConfigService.getContactMessages();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact messages fetched successfully',
    data: result,
  });
});

const markMessageRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SiteConfigService.markContactMessageRead(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message marked as read',
    data: result,
  });
});

export const SiteConfigController = {
  getConfig,
  updateConfig,
  submitContact,
  getContactMessages,
  markMessageRead,
};
