"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorService = void 0;
const prisma_1 = require("../../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const getProfile = async (userId) => {
    const profile = await prisma_1.prisma.creatorProfile.findUnique({
        where: { userId },
    });
    if (!profile) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Creator profile not found');
    }
    return profile;
};
const updateProfile = async (userId, payload) => {
    const profile = await prisma_1.prisma.creatorProfile.findUnique({
        where: { userId },
    });
    if (!profile) {
        // If not found, create it (in case they were just promoted to creator and don't have one)
        return await prisma_1.prisma.creatorProfile.create({
            data: {
                userId,
                channelName: payload.channelName || 'New Creator',
                ...payload
            }
        });
    }
    const result = await prisma_1.prisma.creatorProfile.update({
        where: { userId },
        data: payload,
    });
    return result;
};
const applyForSeries = async (userId, payload) => {
    const { title, description } = payload;
    if (!title) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Series title is required');
    }
    // Check for similar titles using basic ILIKE in Postgres
    const similarSeries = await prisma_1.prisma.series.findMany({
        where: {
            title: {
                contains: title,
                mode: 'insensitive',
            }
        }
    });
    if (similarSeries.length > 0) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, `Similar series already exist on the platform: ${similarSeries.map(s => s.title).join(', ')}`);
    }
    const application = await prisma_1.prisma.seriesApplication.create({
        data: {
            creatorId: userId,
            title,
            description,
            status: 'PENDING'
        }
    });
    return application;
};
const getAnalytics = async (userId) => {
    // Fetch all series by this creator with aggregated counts
    const series = await prisma_1.prisma.series.findMany({
        where: { creatorId: userId },
        select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            totalViews: true,
            rating: true,
            createdAt: true,
            _count: {
                select: {
                    chapters: true,
                    bookmarks: true,
                    reviews: true,
                },
            },
        },
        orderBy: { totalViews: 'desc' },
    });
    // Aggregate totals
    const totalViews = series.reduce((sum, s) => sum + s.totalViews, 0);
    const totalChapters = series.reduce((sum, s) => sum + s._count.chapters, 0);
    const totalBookmarks = series.reduce((sum, s) => sum + s._count.bookmarks, 0);
    const totalReviews = series.reduce((sum, s) => sum + s._count.reviews, 0);
    // Calculate chapter purchase revenue for this creator's chapters
    const chapterPurchases = await prisma_1.prisma.chapterPurchase.findMany({
        where: {
            chapter: {
                series: {
                    creatorId: userId,
                },
            },
        },
        select: {
            pointsSpent: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });
    const totalRevenue = chapterPurchases.reduce((sum, p) => sum + p.pointsSpent, 0);
    // Group purchases by day for the last 30 days for a chart
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentPurchases = chapterPurchases.filter(p => new Date(p.createdAt) >= thirtyDaysAgo);
    const dailyRevenue = {};
    for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = date.toISOString().split('T')[0];
        dailyRevenue[key] = 0;
    }
    recentPurchases.forEach(p => {
        const key = new Date(p.createdAt).toISOString().split('T')[0];
        if (dailyRevenue[key] !== undefined) {
            dailyRevenue[key] += p.pointsSpent;
        }
    });
    // Convert to sorted array
    const revenueChart = Object.entries(dailyRevenue)
        .map(([date, points]) => ({ date, points }))
        .sort((a, b) => a.date.localeCompare(b.date));
    return {
        overview: {
            totalSeries: series.length,
            totalChapters,
            totalViews,
            totalBookmarks,
            totalReviews,
            totalRevenue,
        },
        series,
        revenueChart,
    };
};
const requestFeatureSeries = async (userId, seriesId, notes) => {
    // Validate that series exists and belongs to the creator
    const series = await prisma_1.prisma.series.findUnique({
        where: { id: seriesId },
    });
    if (!series) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Series not found');
    }
    if (series.creatorId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not own this series');
    }
    // Get site configuration for the fee
    let config = await prisma_1.prisma.siteConfig.findUnique({
        where: { id: 'global' },
    });
    const fee = config ? config.featuredRequestFee : 500;
    // Check if creator has enough points
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user || user.points < fee) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Insufficient points. You need ${fee} points to request featured series.`);
    }
    // Perform point deduction, point transaction log, and featured request creation atomically
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        // Deduct points
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { points: { decrement: fee } },
        });
        // Create transaction log
        await tx.pointTransaction.create({
            data: {
                userId,
                type: 'BUY_POINTS',
                amount: -fee,
                description: `Fee for requesting featured status on series: ${series.title}`,
            },
        });
        // Create request
        const request = await tx.featuredRequest.create({
            data: {
                seriesId,
                creatorId: userId,
                status: 'PENDING',
                notes: notes ?? null,
            },
            include: {
                series: true,
            }
        });
        return { request, pointsLeft: updatedUser.points };
    });
    return result;
};
const getCreatorFeatureRequests = async (userId) => {
    return await prisma_1.prisma.featuredRequest.findMany({
        where: { creatorId: userId },
        include: {
            series: true,
        },
        orderBy: { createdAt: 'desc' },
    });
};
exports.CreatorService = {
    getProfile,
    updateProfile,
    getAnalytics,
    applyForSeries,
    requestFeatureSeries,
    getCreatorFeatureRequests,
};
