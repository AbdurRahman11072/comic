import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const banUser = async (userId: string, payload: any) => {
  const { banned, banReason, banExpires } = payload;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  // Moderators cannot ban other moderators or admins
  if (user.role === 'moderator' || user.role === 'admin') {
    throw new AppError(httpStatus.FORBIDDEN, 'Cannot ban a moderator or admin');
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      banned: banned !== undefined ? banned : !user.banned,
      banReason: banReason || null,
      banExpires: banExpires ? new Date(banExpires) : null,
    },
  });

  return result;
};

const freezeUser = async (userId: string, payload: any) => {
  const { frozen } = payload;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  if (user.role === 'moderator' || user.role === 'admin') {
    throw new AppError(httpStatus.FORBIDDEN, 'Cannot freeze a moderator or admin');
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      transactionsFrozen: frozen !== undefined ? frozen : !user.transactionsFrozen,
    },
  });

  return result;
};

const muteUser = async (userId: string, payload: { durationHours?: number; unmute?: boolean }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  if (user.role === 'moderator' || user.role === 'admin') {
    throw new AppError(httpStatus.FORBIDDEN, 'Cannot mute a moderator or admin');
  }

  let mutedUntil: Date | null = null;
  if (!payload.unmute && payload.durationHours) {
    mutedUntil = new Date(Date.now() + payload.durationHours * 60 * 60 * 1000);
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: { mutedUntil },
  });

  return result;
};

const getSeriesApplications = async (query: any) => {
  const { page = 1, limit = 10, status } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status.toUpperCase();

  const [data, total] = await Promise.all([
    prisma.seriesApplication.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    }),
    prisma.seriesApplication.count({ where }),
  ]);

  return {
    meta: { total, page: Number(page), limit: Number(limit) },
    data,
  };
};

const reviewSeriesApplication = async (id: string, payload: any) => {
  const { status, notes } = payload;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Status must be APPROVED or REJECTED');
  }

  const application = await prisma.seriesApplication.findUnique({ where: { id } });
  if (!application) throw new AppError(httpStatus.NOT_FOUND, 'Application not found');

  if (application.status !== 'PENDING') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Application has already been reviewed');
  }

  const result = await prisma.seriesApplication.update({
    where: { id },
    data: { status, notes },
  });

  // If approved, upgrade user to creator role if they aren't already
  if (status === 'APPROVED') {
    const user = await prisma.user.findUnique({ where: { id: application.creatorId } });
    if (user && user.role === 'user') {
      await prisma.user.update({
        where: { id: application.creatorId },
        data: { role: 'creator' },
      });

      // Create a creator profile if it doesn't exist
      const existingProfile = await prisma.creatorProfile.findUnique({
        where: { userId: application.creatorId },
      });
      if (!existingProfile) {
        await prisma.creatorProfile.create({
          data: {
            userId: application.creatorId,
            channelName: user.name,
          },
        });
      }
    }
  }

  return result;
};

const getWithdrawalRequests = async (query: any) => {
  const {
    page = 1,
    limit = 20,
    status,
    search,
    rangeFrom,
    rangeTo,
    batchIndex,
    batchSize = 20,
  } = query;

  const where: any = {};
  if (status && status !== 'ALL') {
    where.status = status.toUpperCase();
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { bankDetails: { contains: q, mode: 'insensitive' } },
      { id: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.withdrawalRequest.count({ where }),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    prisma.withdrawalRequest.count({ where: { status: 'APPROVED' } }),
    prisma.withdrawalRequest.count({ where: { status: 'REJECTED' } }),
  ]);

  let skip = (Number(page) - 1) * Number(limit);
  let take = Number(limit);

  if (rangeFrom !== undefined && rangeTo !== undefined) {
    const from = Math.max(1, Number(rangeFrom));
    const to = Math.max(from, Number(rangeTo));
    skip = from - 1;
    take = to - from + 1;
  } else if (batchIndex !== undefined) {
    const bIndex = Math.max(1, Number(batchIndex));
    const bSize = Math.max(1, Number(batchSize));
    skip = (bIndex - 1) * bSize;
    take = bSize;
  }

  const orderBy: any = where.status === 'PENDING' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const rawData = await prisma.withdrawalRequest.findMany({
    where,
    skip,
    take,
    orderBy,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          points: true,
          dailyAdViews: true,
          dailyAdPointsEarned: true,
          transactionsFrozen: true,
          banned: true,
          createdAt: true,
        },
      },
    },
  });

  const userIds = Array.from(new Set(rawData.map((r) => r.user.id)));
  const adAggregates = await prisma.pointTransaction.groupBy({
    by: ['userId'],
    where: {
      userId: { in: userIds },
      type: 'EARN_AD',
    },
    _count: { id: true },
    _sum: { amount: true },
  });

  const adStatsMap = new Map<string, { totalAdViews: number; totalAdPoints: number }>();
  for (const agg of adAggregates) {
    adStatsMap.set(agg.userId, {
      totalAdViews: agg._count.id || 0,
      totalAdPoints: agg._sum.amount || 0,
    });
  }

  const data = rawData.map((req, idx) => {
    const stats = adStatsMap.get(req.user.id) || { totalAdViews: 0, totalAdPoints: 0 };
    return {
      ...req,
      queueIndex: skip + idx + 1,
      user: {
        ...req.user,
        totalAdViews: stats.totalAdViews,
        totalAdPoints: stats.totalAdPoints,
      },
    };
  });

  const totalBatches = Math.ceil(pendingCount / Number(batchSize || 20)) || 1;

  return {
    meta: {
      total,
      totalPending: pendingCount,
      totalApproved: approvedCount,
      totalRejected: rejectedCount,
      page: Number(page),
      limit: take,
      rangeFrom: skip + 1,
      rangeTo: skip + data.length,
      totalBatches,
    },
    data,
  };
};

const getUserFinancialHistory = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      points: true,
      dailyAdViews: true,
      dailyAdPointsEarned: true,
      transactionsFrozen: true,
      banned: true,
      banReason: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  const [transactions, withdrawals, adAgg, purchaseAgg, approvedWithdrawalAgg] = await Promise.all([
    prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pointTransaction.aggregate({
      where: { userId, type: 'EARN_AD' },
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.chapterPurchase.count({
      where: { userId },
    }),
    prisma.withdrawalRequest.aggregate({
      where: { userId, status: 'APPROVED' },
      _sum: { fiatAmount: true, pointsRequested: true },
    }),
  ]);

  return {
    user,
    stats: {
      totalAdViews: adAgg._count.id || 0,
      totalAdPointsEarned: adAgg._sum.amount || 0,
      totalChaptersPurchased: purchaseAgg || 0,
      totalFiatWithdrawn: approvedWithdrawalAgg._sum?.fiatAmount || 0,
      totalPointsWithdrawn: approvedWithdrawalAgg._sum?.pointsRequested || 0,
      previousWithdrawalsCount: withdrawals.length,
    },
    transactions,
    withdrawals,
  };
};

const reviewWithdrawalRequest = async (id: string, payload: any) => {
  const { status, notes } = payload;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Status must be APPROVED or REJECTED');
  }

  const request = await prisma.withdrawalRequest.findUnique({ where: { id } });
  if (!request) throw new AppError(httpStatus.NOT_FOUND, 'Withdrawal request not found');

  if (request.status !== 'PENDING') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Request has already been reviewed');
  }

  // If rejected, refund the points back to the user
  if (status === 'REJECTED') {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: request.userId },
        data: { points: { increment: request.pointsRequested } },
      });

      await tx.pointTransaction.create({
        data: {
          userId: request.userId,
          type: 'WITHDRAWAL',
          amount: request.pointsRequested,
          description: `Withdrawal refund: ${notes || 'Rejected by moderator'}`,
        },
      });
    });
  }

  const result = await prisma.withdrawalRequest.update({
    where: { id },
    data: { status, notes },
  });

  return result;
};

const getFeaturedRequests = async (query: any) => {
  const { page = 1, limit = 10, status } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status.toUpperCase();

  const [data, total] = await Promise.all([
    prisma.featuredRequest.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        series: true,
        creator: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    }),
    prisma.featuredRequest.count({ where }),
  ]);

  return {
    meta: { total, page: Number(page), limit: Number(limit) },
    data,
  };
};

const reviewFeaturedRequest = async (id: string, payload: any) => {
  const { status, notes } = payload;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Status must be APPROVED or REJECTED');
  }

  const request = await prisma.featuredRequest.findUnique({ where: { id } });
  if (!request) throw new AppError(httpStatus.NOT_FOUND, 'Featured request not found');

  if (request.status !== 'PENDING') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Request has already been reviewed');
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.featuredRequest.update({
      where: { id },
      data: { status, notes },
    });

    if (status === 'APPROVED') {
      // Upsert into FeaturedSeries
      const existingFeatured = await tx.featuredSeries.findUnique({
        where: { seriesId: request.seriesId },
      });

      if (!existingFeatured) {
        // Find max order
        const maxOrderObj = await tx.featuredSeries.findFirst({
          orderBy: { order: 'desc' },
          select: { order: true },
        });
        const order = maxOrderObj ? maxOrderObj.order + 1 : 0;

        await tx.featuredSeries.create({
          data: {
            seriesId: request.seriesId,
            order,
          },
        });
      }
    }

    return updatedRequest;
  });

  return result;
};

export const ModeratorService = {
  banUser,
  freezeUser,
  muteUser,
  getSeriesApplications,
  reviewSeriesApplication,
  getWithdrawalRequests,
  getUserFinancialHistory,
  reviewWithdrawalRequest,
  getFeaturedRequests,
  reviewFeaturedRequest,
};
