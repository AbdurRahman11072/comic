"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdService = void 0;
const prisma_1 = require("../../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const earnAdPoints = async (userId, ipAddress) => {
    // We wrap everything in a transaction to ensure atomic updates
    return await prisma_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        const config = await tx.siteConfig.findUnique({
            where: { id: 'global' },
        });
        if (!config)
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Site config missing');
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
            throw new AppError_1.default(http_status_1.default.TOO_MANY_REQUESTS, 'Daily ad reward limit reached');
        }
        // 2. Geolocation check for point rewards
        // By default, Asia gets 5, Europe gets 10, everyone else gets default 5.
        // We will check AdRewardConfig to see if there are custom values set by admin
        const geo = geoip_lite_1.default.lookup(ipAddress);
        const countryCode = geo ? geo.country : 'UNKNOWN';
        // Fetch dynamic reward config
        const rewardConfigs = await tx.adRewardConfig.findMany();
        let earnedPoints = 5; // Fallback default
        if (rewardConfigs.length > 0) {
            // Find a config that includes the user's country
            const specificConfig = rewardConfigs.find(c => c.countryCode.includes(countryCode));
            if (specificConfig) {
                earnedPoints = specificConfig.points;
            }
        }
        else {
            // Hardcoded fallback logic requested by user initially
            const asianCountries = ['BD', 'IN', 'PK', 'CN', 'JP', 'KR', 'ID', 'PH', 'VN']; // Short list
            const europeanCountries = ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE'];
            if (europeanCountries.includes(countryCode)) {
                earnedPoints = 10;
            }
            else if (asianCountries.includes(countryCode)) {
                earnedPoints = 5;
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
            // Check if the referral is still active
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
const getCustomAds = async (query = {}) => {
    const { page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        prisma_1.prisma.customAd.findMany({
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.prisma.customAd.count(),
    ]);
    return { meta: { total, page: Number(page), limit: Number(limit) }, data };
};
const getActiveCustomAd = async (countryCode) => {
    // Fetch active custom ads. If country code is provided, try to target by country.
    const allActive = await prisma_1.prisma.customAd.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
    });
    if (allActive.length === 0)
        return null;
    // Try to find one targeted to the user's country
    if (countryCode) {
        const targeted = allActive.find(ad => ad.targetCountries.length === 0 || ad.targetCountries.includes(countryCode));
        if (targeted)
            return targeted;
    }
    // Fallback: return the first active ad
    return allActive[0];
};
const createCustomAd = async (payload) => {
    return await prisma_1.prisma.customAd.create({ data: payload });
};
const updateCustomAd = async (id, payload) => {
    return await prisma_1.prisma.customAd.update({ where: { id }, data: payload });
};
const deleteCustomAd = async (id) => {
    return await prisma_1.prisma.customAd.delete({ where: { id } });
};
exports.AdService = {
    earnAdPoints,
    getCustomAds,
    getActiveCustomAd,
    createCustomAd,
    updateCustomAd,
    deleteCustomAd,
};
