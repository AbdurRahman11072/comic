import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { PromoService } from './promo.service';
import AppError from '../../error/AppError';

const createPromoCode = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');

  const result = await PromoService.createPromoCode(userId, role, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Promo code created successfully',
    data: result,
  });
});

const getPromoCodes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');

  const result = await PromoService.getPromoCodes(userId, role, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promo codes retrieved successfully',
    pagination: result.meta,
    data: result.data,
  });
});

const deletePromoCode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');

  await PromoService.deletePromoCode(id as string, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promo code deleted successfully',
    data: null,
  });
});

const redeemPromoCode = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { code } = req.body;
  if (!userId) throw new AppError(httpStatus.UNAUTHORIZED, 'Please log in to redeem promo codes');
  if (!code) throw new AppError(httpStatus.BAD_REQUEST, 'Promo code is required');

  const result = await PromoService.redeemPromoCode(userId, code);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Promo code ${result.code} redeemed successfully!`,
    data: result,
  });
});

export const PromoController = {
  createPromoCode,
  getPromoCodes,
  deletePromoCode,
  redeemPromoCode,
};
