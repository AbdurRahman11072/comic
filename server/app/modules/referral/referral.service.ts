import { prisma } from '../../../lib/prisma';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { generateUniqueReferralCode } from '../../utils/referralCode';

const getReferralStats = async (userId: string) => {
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
      points: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Ensure user has a clean, readable referral code (e.g. CBD-XXXXXX)
  if (!user.referralCode || user.referralCode.length > 15) {
    const newCode = await generateUniqueReferralCode();
    user = await prisma.user.update({
      where: { id: userId },
      data: { referralCode: newCode },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        points: true,
      },
    });
  }

  // 1. Fetch site referral configuration
  const siteConfig = await prisma.siteConfig.findFirst({
    select: {
      referralBonusPercent: true,
      referralActiveMonths: true,
      referralSignupBonus: true,
    },
  });

  const referralBonusPercent = siteConfig?.referralBonusPercent ?? 10;
  const referralActiveMonths = siteConfig?.referralActiveMonths ?? 3;
  const referralSignupBonus = siteConfig?.referralSignupBonus ?? 50;

  // 2. Count total referrals
  const totalReferrals = await prisma.user.count({
    where: { referredById: userId },
  });

  // 3. Count active referrals (joined within referralActiveMonths)
  const activeSince = new Date();
  activeSince.setMonth(activeSince.getMonth() - referralActiveMonths);

  const activeReferrals = await prisma.user.count({
    where: {
      referredById: userId,
      createdAt: { gte: activeSince },
    },
  });

  // 4. Sum points earned from REFERRAL_BONUS transactions
  const bonusAggregate = await prisma.pointTransaction.aggregate({
    where: {
      userId,
      type: 'REFERRAL_BONUS',
    },
    _sum: {
      amount: true,
    },
  });

  const totalPointsEarned = bonusAggregate._sum.amount || 0;

  // 5. Fetch recent referred users list
  const recentReferrals = await prisma.user.findMany({
    where: { referredById: userId },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return {
    referralCode: user.referralCode,
    totalReferrals,
    activeReferrals,
    totalPointsEarned,
    referralBonusPercent,
    referralActiveMonths,
    referralSignupBonus,
    recentReferrals: recentReferrals.map((r) => ({
      id: r.id,
      name: r.name || 'Anonymous Reader',
      image: r.image,
      joinedAt: r.createdAt,
      isActive: new Date(r.createdAt) >= activeSince,
    })),
  };
};

const validateReferralCode = async (code: string) => {
  const cleanCode = (code || '').trim();
  if (!cleanCode) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Referral code is required');
  }

  const referrer = await prisma.user.findFirst({
    where: {
      referralCode: {
        equals: cleanCode,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      referralCode: true,
    },
  });

  if (!referrer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid referral code');
  }

  const siteConfig = await prisma.siteConfig.findFirst({
    select: {
      referralSignupBonus: true,
    },
  });

  return {
    valid: true,
    referrerName: referrer.name || 'A Comic BD Reader',
    referrerAvatar: referrer.image,
    referralCode: referrer.referralCode,
    signupBonusPoints: siteConfig?.referralSignupBonus ?? 50,
  };
};

export const ReferralService = {
  getReferralStats,
  validateReferralCode,
};
