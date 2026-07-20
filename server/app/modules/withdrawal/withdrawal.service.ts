import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const requestWithdrawal = async (userId: string, payload: any) => {
  const { pointsRequested, bankDetails } = payload;
  
  if (!pointsRequested || pointsRequested <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid points amount');
  }

  if (!bankDetails) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Bank details are required');
  }

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    
    if (user.transactionsFrozen) {
      throw new AppError(httpStatus.FORBIDDEN, 'Your transactions are currently frozen. Please contact support.');
    }

    if (user.points < pointsRequested) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient points balance');
    }

    const config = await tx.siteConfig.findUnique({
      where: { id: 'global' }
    });
    
    const rate = config?.pointToFiatRate || 0.01;
    const fiatAmount = pointsRequested * rate;

    // Deduct points immediately to prevent double spending
    await tx.user.update({
      where: { id: userId },
      data: { points: { decrement: pointsRequested } }
    });

    // Create withdrawal log
    await tx.pointTransaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        amount: -pointsRequested,
        description: `Requested withdrawal of ${pointsRequested} points for $${fiatAmount}`,
      }
    });

    const request = await tx.withdrawalRequest.create({
      data: {
        userId,
        pointsRequested,
        fiatAmount,
        bankDetails,
        status: 'PENDING'
      }
    });

    return request;
  });
};

const getMyRequests = async (userId: string) => {
  return await prisma.withdrawalRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

export const WithdrawalService = {
  requestWithdrawal,
  getMyRequests,
};
