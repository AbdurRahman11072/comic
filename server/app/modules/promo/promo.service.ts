import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import { AuditService } from '../audit/audit.service';

interface CreatePromoCodePayload {
  code: string;
  creatorId?: string;
  seriesId?: string;
  pointsReward?: number;
  discountPercent?: number;
  maxUses?: number;
  expiresAt?: string | null;
}

const createPromoCode = async (
  userId: string,
  role: string,
  payload: CreatePromoCodePayload
) => {
  const code = payload.code.trim().toUpperCase();

  const existing = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, 'A promo code with this name already exists');
  }

  // If creator, enforce that creatorId matches their user ID
  const creatorId = role === 'creator' ? userId : payload.creatorId || null;

  const result = await prisma.promoCode.create({
    data: {
      code,
      creatorId,
      seriesId: payload.seriesId || null,
      pointsReward: Number(payload.pointsReward) || 0,
      discountPercent: Number(payload.discountPercent) || 0,
      maxUses: Number(payload.maxUses) || 100,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
    },
  });

  await AuditService.logAction({
    actorId: userId,
    action: 'CREATE_PROMO_CODE',
    targetType: 'promo_code',
    targetId: result.id,
    details: { code, pointsReward: result.pointsReward, creatorId },
  });

  return result;
};

const getPromoCodes = async (userId: string, role: string, query: any = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (role === 'creator') {
    where.creatorId = userId;
  }

  const [data, total] = await Promise.all([
    prisma.promoCode.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { redemptions: true },
        },
      },
    }),
    prisma.promoCode.count({ where }),
  ]);

  return {
    meta: { total, page: Number(page), limit: Number(limit) },
    data,
  };
};

const deletePromoCode = async (id: string, userId: string, role: string) => {
  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo) {
    throw new AppError(httpStatus.NOT_FOUND, 'Promo code not found');
  }

  if (role === 'creator' && promo.creatorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own promo codes');
  }

  const result = await prisma.promoCode.delete({ where: { id } });

  await AuditService.logAction({
    actorId: userId,
    action: 'DELETE_PROMO_CODE',
    targetType: 'promo_code',
    targetId: id,
    details: { code: promo.code },
  });

  return result;
};

const redeemPromoCode = async (userId: string, codeInput: string) => {
  const code = codeInput.trim().toUpperCase();

  const promo = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (!promo || !promo.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid or inactive promo code');
  }

  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This promo code has expired');
  }

  if (promo.usedCount >= promo.maxUses) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This promo code has reached its maximum redemptions');
  }

  // Check if user already redeemed this code
  const alreadyRedeemed = await prisma.promoCodeRedemption.findUnique({
    where: {
      promoCodeId_userId: {
        promoCodeId: promo.id,
        userId,
      },
    },
  });

  if (alreadyRedeemed) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You have already redeemed this promo code');
  }

  // Redeem atomically: credit points, record redemption, increment usedCount
  const [redemption, updatedUser] = await prisma.$transaction([
    prisma.promoCodeRedemption.create({
      data: {
        promoCodeId: promo.id,
        userId,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: promo.pointsReward },
      },
    }),
    prisma.promoCode.update({
      where: { id: promo.id },
      data: {
        usedCount: { increment: 1 },
      },
    }),
    ...(promo.pointsReward > 0
      ? [
          prisma.pointTransaction.create({
            data: {
              userId,
              type: 'EARN_AD',
              amount: promo.pointsReward,
              description: `Redeemed promo code: ${promo.code}`,
            },
          }),
        ]
      : []),
  ]);

  return {
    code: promo.code,
    pointsAwarded: promo.pointsReward,
    discountPercent: promo.discountPercent,
    newBalance: updatedUser.points,
  };
};

export const PromoService = {
  createPromoCode,
  getPromoCodes,
  deletePromoCode,
  redeemPromoCode,
};
