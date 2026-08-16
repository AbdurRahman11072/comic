import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import geoip from 'geoip-lite';

const earnAdPoints = async (userId: string, ipAddress: string, adId?: string) => {
  // We wrap everything in a transaction to ensure atomic updates
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

    const config = await tx.siteConfig.findUnique({
      where: { id: 'global' },
    });

    if (!config) throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Site config missing');

    // 1. Reset daily limits if a new day has started
    const now = new Date();
    const lastWatch = new Date(user.lastAdWatchDate);
    
    let currentDailyPoints = user.dailyAdPointsEarned;
    let currentDailyViews = user.dailyAdViews;

    if (now.toDateString() !== lastWatch.toDateString()) {
      currentDailyPoints = 0;
      currentDailyViews = 0;
    }

    if (currentDailyPoints >= config.maxDailyAdPoints) {
      throw new AppError(httpStatus.TOO_MANY_REQUESTS, 'Daily ad reward limit reached');
    }

    // 2. Geolocation check for point rewards
    const geo = geoip.lookup(ipAddress);
    const countryCode = geo ? geo.country : 'UNKNOWN';

    // Fetch dynamic reward config
    const rewardConfigs = await tx.adRewardConfig.findMany();
    let earnedPoints = 5; // Fallback default

    if (rewardConfigs.length > 0) {
      const specificConfig = rewardConfigs.find(c => c.countryCode.includes(countryCode));
      if (specificConfig) {
        earnedPoints = specificConfig.points;
      }
    } else {
      const asianCountries = ['BD', 'IN', 'PK', 'CN', 'JP', 'KR', 'ID', 'PH', 'VN'];
      const europeanCountries = ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'US', 'CA', 'AU'];
      
      if (europeanCountries.includes(countryCode)) {
        earnedPoints = 10;
      } else if (asianCountries.includes(countryCode)) {
        earnedPoints = 5;
      }
    }

    // If specific ad has custom point reward
    if (adId) {
      const ad = await tx.customAd.findUnique({ where: { id: adId } });
      if (ad && ad.points > 0) {
        earnedPoints = ad.points;
      }
    }

    // Ensure we don't exceed the daily max with this earning
    if (currentDailyPoints + earnedPoints > config.maxDailyAdPoints) {
      earnedPoints = config.maxDailyAdPoints - currentDailyPoints;
    }

    // 3. Update User
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        points: { increment: earnedPoints },
        dailyAdPointsEarned: currentDailyPoints + earnedPoints,
        dailyAdViews: currentDailyViews + 1,
        lastAdWatchDate: now,
      }
    });

    // If adId provided, increment impressions and completed views
    if (adId) {
      await tx.customAd.update({
        where: { id: adId },
        data: {
          impressions: { increment: 1 },
        }
      }).catch(() => null);
    }

    // 4. Log Transaction
    await tx.pointTransaction.create({
      data: {
        userId,
        type: 'EARN_AD',
        amount: earnedPoints,
        description: `Earned from Ad (${countryCode})`,
      }
    });

    // 5. Calculate Referral Bonus
    if (user.referredById) {
      const accountAgeMonths = (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (accountAgeMonths <= config.referralActiveMonths) {
        const bonusPoints = Math.floor((earnedPoints * config.referralBonusPercent) / 100);
        
        if (bonusPoints > 0) {
          await tx.user.update({
            where: { id: user.referredById },
            data: { points: { increment: bonusPoints } }
          });

          await tx.pointTransaction.create({
            data: {
              userId: user.referredById,
              type: 'REFERRAL_BONUS',
              amount: bonusPoints,
              description: `Referral bonus from user ${user.name}`,
            }
          });
        }
      }
    }

    return {
      earnedPoints,
      newBalance: updatedUser.points,
      dailyPointsEarned: updatedUser.dailyAdPointsEarned,
      countryDetected: countryCode
    };
  });
};

const getAdByPlacement = async (placement: string, countryCode?: string) => {
  const activeAds = await prisma.customAd.findMany({
    where: {
      placement,
      isActive: true,
      status: 'ACTIVE',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (activeAds.length === 0) {
    // If no ad specifically matching placement, look for general active ad
    const generalAd = await prisma.customAd.findFirst({
      where: { isActive: true, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    return generalAd;
  }

  // Country targeting check
  if (countryCode) {
    const targeted = activeAds.find(ad =>
      ad.targetCountries.length === 0 || ad.targetCountries.includes(countryCode)
    );
    if (targeted) return targeted;
  }

  // Return random or first active ad
  const randomIndex = Math.floor(Math.random() * activeAds.length);
  return activeAds[randomIndex];
};

const recordImpression = async (adId: string) => {
  return await prisma.customAd.update({
    where: { id: adId },
    data: {
      impressions: { increment: 1 },
    },
  });
};

const recordClick = async (adId: string) => {
  return await prisma.customAd.update({
    where: { id: adId },
    data: {
      clicks: { increment: 1 },
    },
  });
};

const getCustomAds = async (query: any = {}) => {
  const { page = 1, limit = 50, placement, provider, status } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const whereClause: any = {};
  if (placement) whereClause.placement = placement;
  if (provider) whereClause.provider = provider;
  if (status) whereClause.status = status;

  const [data, total] = await Promise.all([
    prisma.customAd.findMany({
      where: whereClause,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customAd.count({ where: whereClause }),
  ]);

  return { meta: { total, page: Number(page), limit: Number(limit) }, data };
};

const getAdStats = async () => {
  const ads = await prisma.customAd.findMany();
  const totalImpressions = ads.reduce((acc, ad) => acc + ad.impressions, 0);
  const totalClicks = ads.reduce((acc, ad) => acc + ad.clicks, 0);
  const totalRevenue = ads.reduce((acc, ad) => acc + ad.revenue, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  return {
    totalAds: ads.length,
    activeAds: ads.filter(a => a.isActive && a.status === 'ACTIVE').length,
    totalImpressions,
    totalClicks,
    totalRevenue,
    avgCtr: `${avgCtr}%`,
  };
};

const createCustomAd = async (payload: any) => {
  return await prisma.customAd.create({ data: payload });
};

const updateCustomAd = async (id: string, payload: any) => {
  return await prisma.customAd.update({ where: { id }, data: payload });
};

const deleteCustomAd = async (id: string) => {
  return await prisma.customAd.delete({ where: { id } });
};

export const AdService = {
  earnAdPoints,
  getAdByPlacement,
  recordImpression,
  recordClick,
  getCustomAds,
  getAdStats,
  createCustomAd,
  updateCustomAd,
  deleteCustomAd,
};
