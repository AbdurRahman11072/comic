import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';

const POINTS_PER_AD = 10;

/** Return current point balance for a user */
const getBalance = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true },
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  return { points: user.points };
};

/** Return all point transactions for a user, newest first */
const getTransactions = async (userId: string) => {
  const transactions = await prisma.pointTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true },
  });
  return { balance: user?.points ?? 0, transactions };
};

/** Earn points by watching an ad — adds points and logs a transaction */
const earnFromAd = async (userId: string, requestedAmount: number = 10) => {
  const userCheck = await prisma.user.findUnique({
    where: { id: userId },
    select: { transactionsFrozen: true },
  });

  if (!userCheck) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  if (userCheck.transactionsFrozen) {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account transactions are frozen');
  }

  // Strictly clamp amount between 5 and 150 (max reward for a full ad pack)
  const amount = Math.min(Math.max(Number(requestedAmount) || 10, 5), 150);

  const [user, transaction] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
      select: { points: true },
    }),
    prisma.pointTransaction.create({
      data: {
        userId,
        type: 'EARN_AD',
        amount: amount,
        description: 'Earned by watching an ad',
      },
    }),
  ]);

  return { points: user.points, transaction };
};

/** Spend points to unlock a locked chapter */
const buyChapter = async (userId: string, chapterId: string) => {
  // 1. Fetch chapter
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { series: true },
  });
  if (!chapter) throw new AppError(httpStatus.NOT_FOUND, 'Chapter not found');
  if (!chapter.isLocked) throw new AppError(httpStatus.BAD_REQUEST, 'Chapter is not locked');
  if (chapter.coinCost <= 0)
    throw new AppError(httpStatus.BAD_REQUEST, 'This chapter has no point cost');

  // 2. Check if already purchased
  const existing = await prisma.chapterPurchase.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  });
  if (existing) throw new AppError(httpStatus.BAD_REQUEST, 'Chapter already purchased');

  // 3. Verify user has enough points and is not frozen
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true, transactionsFrozen: true },
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  if (user.transactionsFrozen) {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account transactions are frozen. Please contact support.');
  }
  if (user.points < chapter.coinCost)
    throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient points');

  const creatorId = chapter.series.creatorId;

  // 4. Deduct points, log transaction, create purchase record, credit creator (all atomic)
  const txs: any[] = [
    prisma.user.update({
      where: { id: userId },
      data: { points: { decrement: chapter.coinCost } },
      select: { points: true },
    }),
    prisma.pointTransaction.create({
      data: {
        userId,
        type: 'BUY_CHAPTER',
        amount: -chapter.coinCost,
        description: `Unlocked chapter #${chapter.number} of ${chapter.series.title}`,
      },
    }),
    prisma.chapterPurchase.create({
      data: { userId, chapterId, pointsSpent: chapter.coinCost },
    }),
  ];

  if (creatorId) {
    txs.push(
      prisma.user.update({
        where: { id: creatorId },
        data: { points: { increment: chapter.coinCost } },
      })
    );
    txs.push(
      prisma.pointTransaction.create({
        data: {
          userId: creatorId,
          type: 'BUY_CHAPTER',
          amount: chapter.coinCost,
          description: `Earning from chapter #${chapter.number} unlock: ${chapter.series.title}`,
        },
      })
    );
    txs.push(
      prisma.creatorProfile.upsert({
        where: { userId: creatorId },
        update: { totalEarnings: { increment: chapter.coinCost } },
        create: {
          userId: creatorId,
          channelName: 'Creator Channel',
          totalEarnings: chapter.coinCost,
        },
      })
    );
  }

  const results = await prisma.$transaction(txs);
  const updatedUser = results[0];
  const transaction = results[1];
  const purchase = results[2];

  return { points: updatedUser.points, transaction, purchase };
};

export const PointsService = {
  getBalance,
  getTransactions,
  earnFromAd,
  buyChapter,
};
