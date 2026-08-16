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

/** Spend points to unlock a single locked chapter */
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

/** Spend points to unlock multiple chapters in bulk, with optional 1-time Promo Code / discount */
const buyBulkChapters = async (userId: string, chapterIds: string[], promoCodeInput?: string) => {
  if (!chapterIds || chapterIds.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please select at least one chapter to unlock');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, points: true, transactionsFrozen: true },
  });

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  if (user.transactionsFrozen) {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account transactions are frozen. Please contact support.');
  }

  // 1. Fetch chapters
  const chapters = await prisma.chapter.findMany({
    where: { id: { in: chapterIds } },
    include: { series: true },
  });

  if (chapters.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No matching chapters found');
  }

  // 2. Filter out already purchased chapters
  const existingPurchases = await prisma.chapterPurchase.findMany({
    where: {
      userId,
      chapterId: { in: chapterIds },
    },
    select: { chapterId: true },
  });
  const purchasedSet = new Set(existingPurchases.map((p) => p.chapterId));

  const chaptersToUnlock = chapters.filter((c) => c.isLocked && !purchasedSet.has(c.id));
  if (chaptersToUnlock.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'All selected chapters are already free or unlocked');
  }

  // 3. Calculate base cost
  const baseCost = chaptersToUnlock.reduce((acc, c) => acc + (c.coinCost || 0), 0);

  // 4. Validate & apply promo code if provided
  let discountAmount = 0;
  let validatedPromo: any = null;

  if (promoCodeInput && promoCodeInput.trim()) {
    const code = promoCodeInput.trim().toUpperCase();
    const promo = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promo || !promo.isActive) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or inactive promo code');
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This promo code has expired');
    }

    if (promo.usedCount >= promo.maxUses) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This promo code has reached its maximum redemptions');
    }

    // 1-time per user check
    const alreadyRedeemed = await prisma.promoCodeRedemption.findUnique({
      where: {
        promoCodeId_userId: {
          promoCodeId: promo.id,
          userId,
        },
      },
    });

    if (alreadyRedeemed) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You have already used this promo code');
    }

    // Calculate discount: percentage or points credit
    if (promo.discountPercent > 0) {
      discountAmount += Math.round(baseCost * (promo.discountPercent / 100));
    }
    if (promo.pointsReward > 0) {
      discountAmount += promo.pointsReward;
    }

    validatedPromo = promo;
  }

  const finalCost = Math.max(0, baseCost - discountAmount);

  if (user.points < finalCost) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Insufficient points. You need ${finalCost} points, but have ${user.points} points.`
    );
  }

  // 5. Execute atomic transaction
  const txs: any[] = [
    // Deduct final points
    prisma.user.update({
      where: { id: userId },
      data: { points: { decrement: finalCost } },
      select: { points: true },
    }),
    // Log user transaction
    prisma.pointTransaction.create({
      data: {
        userId,
        type: 'BUY_CHAPTER',
        amount: -finalCost,
        description: `Bulk unlocked ${chaptersToUnlock.length} chapters${validatedPromo ? ` (Promo ${validatedPromo.code} applied)` : ''}`,
      },
    }),
    // Create chapter purchases for each unlocked chapter
    prisma.chapterPurchase.createMany({
      data: chaptersToUnlock.map((c) => ({
        userId,
        chapterId: c.id,
        pointsSpent: c.coinCost || 0,
      })),
      skipDuplicates: true,
    }),
  ];

  // If promo code used, record redemption & increment counter
  if (validatedPromo) {
    txs.push(
      prisma.promoCodeRedemption.create({
        data: {
          promoCodeId: validatedPromo.id,
          userId,
        },
      })
    );
    txs.push(
      prisma.promoCode.update({
        where: { id: validatedPromo.id },
        data: { usedCount: { increment: 1 } },
      })
    );
  }

  // Group creator earnings
  const creatorEarningsMap = new Map<string, number>();
  for (const c of chaptersToUnlock) {
    if (c.series?.creatorId) {
      const current = creatorEarningsMap.get(c.series.creatorId) || 0;
      creatorEarningsMap.set(c.series.creatorId, current + (c.coinCost || 0));
    }
  }

  for (const [creatorId, earned] of creatorEarningsMap.entries()) {
    txs.push(
      prisma.user.update({
        where: { id: creatorId },
        data: { points: { increment: earned } },
      })
    );
    txs.push(
      prisma.pointTransaction.create({
        data: {
          userId: creatorId,
          type: 'BUY_CHAPTER',
          amount: earned,
          description: `Earnings from bulk unlock of ${chaptersToUnlock.length} chapters`,
        },
      })
    );
    txs.push(
      prisma.creatorProfile.upsert({
        where: { userId: creatorId },
        update: { totalEarnings: { increment: earned } },
        create: {
          userId: creatorId,
          channelName: 'Creator Channel',
          totalEarnings: earned,
        },
      })
    );
  }

  const results = await prisma.$transaction(txs);
  const updatedUser = results[0];

  return {
    success: true,
    newBalance: updatedUser.points,
    unlockedCount: chaptersToUnlock.length,
    baseCost,
    discountApplied: discountAmount,
    pointsSpent: finalCost,
    promoCodeApplied: validatedPromo ? validatedPromo.code : null,
  };
};

export const PointsService = {
  getBalance,
  getTransactions,
  earnFromAd,
  buyChapter,
  buyBulkChapters,
};
