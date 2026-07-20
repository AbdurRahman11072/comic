"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = require("../../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const achievement_service_1 = require("../achievement/achievement.service");
const POINTS_PER_AD = 10;
/** Return current point balance for a user */
const getBalance = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
    });
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    return { points: user.points };
};
/** Return all point transactions for a user, newest first */
const getTransactions = async (userId) => {
    const transactions = await prisma_1.prisma.pointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
    });
    return { balance: user?.points ?? 0, transactions };
};
/** Earn points by watching an ad — adds points and logs a transaction */
const earnFromAd = async (userId, amount = 10) => {
    const [user, transaction] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: { id: userId },
            data: { points: { increment: amount } },
            select: { points: true },
        }),
        prisma_1.prisma.pointTransaction.create({
            data: {
                userId,
                type: 'EARN_AD',
                amount: amount,
                description: 'Earned by watching an ad',
            },
        }),
    ]);
    // Run achievement checks asynchronously
    achievement_service_1.AchievementService.checkAndUnlockAchievements(userId).catch(console.error);
    return { points: user.points, transaction };
};
/** Spend points to unlock a locked chapter */
const buyChapter = async (userId, chapterId) => {
    // 1. Fetch chapter
    const chapter = await prisma_1.prisma.chapter.findUnique({
        where: { id: chapterId },
        include: { series: true },
    });
    if (!chapter)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Chapter not found');
    if (!chapter.isLocked)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chapter is not locked');
    if (chapter.coinCost <= 0)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This chapter has no point cost');
    // 2. Check if already purchased
    const existing = await prisma_1.prisma.chapterPurchase.findUnique({
        where: { userId_chapterId: { userId, chapterId } },
    });
    if (existing)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chapter already purchased');
    // 3. Verify user has enough points
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
    });
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    if (user.points < chapter.coinCost)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Insufficient points');
    const creatorId = chapter.series.creatorId;
    // 4. Deduct points, log transaction, create purchase record, credit creator (all atomic)
    const txs = [
        prisma_1.prisma.user.update({
            where: { id: userId },
            data: { points: { decrement: chapter.coinCost } },
            select: { points: true },
        }),
        prisma_1.prisma.pointTransaction.create({
            data: {
                userId,
                type: 'BUY_CHAPTER',
                amount: -chapter.coinCost,
                description: `Unlocked chapter #${chapter.number} of ${chapter.series.title}`,
            },
        }),
        prisma_1.prisma.chapterPurchase.create({
            data: { userId, chapterId, pointsSpent: chapter.coinCost },
        }),
    ];
    if (creatorId) {
        txs.push(prisma_1.prisma.user.update({
            where: { id: creatorId },
            data: { points: { increment: chapter.coinCost } },
        }));
        txs.push(prisma_1.prisma.pointTransaction.create({
            data: {
                userId: creatorId,
                type: 'BUY_CHAPTER',
                amount: chapter.coinCost,
                description: `Earning from chapter #${chapter.number} unlock: ${chapter.series.title}`,
            },
        }));
        txs.push(prisma_1.prisma.creatorProfile.upsert({
            where: { userId: creatorId },
            update: { totalEarnings: { increment: chapter.coinCost } },
            create: {
                userId: creatorId,
                channelName: 'Creator Channel',
                totalEarnings: chapter.coinCost,
            },
        }));
    }
    const results = await prisma_1.prisma.$transaction(txs);
    const updatedUser = results[0];
    const transaction = results[1];
    const purchase = results[2];
    // Run achievement checks asynchronously
    achievement_service_1.AchievementService.checkAndUnlockAchievements(userId).catch(console.error);
    return { points: updatedUser.points, transaction, purchase };
};
exports.PointsService = {
    getBalance,
    getTransactions,
    earnFromAd,
    buyChapter,
};
