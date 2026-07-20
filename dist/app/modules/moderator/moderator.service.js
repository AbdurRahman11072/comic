"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeratorService = void 0;
const prisma_1 = require("../../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const banUser = async (userId, payload) => {
    const { banned, banReason, banExpires } = payload;
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    // Moderators cannot ban other moderators or admins
    if (user.role === 'moderator' || user.role === 'admin') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Cannot ban a moderator or admin');
    }
    const result = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            banned: banned !== undefined ? banned : !user.banned,
            banReason: banReason || null,
            banExpires: banExpires ? new Date(banExpires) : null,
        },
    });
    return result;
};
const freezeUser = async (userId, payload) => {
    const { frozen } = payload;
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    if (user.role === 'moderator' || user.role === 'admin') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Cannot freeze a moderator or admin');
    }
    const result = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            transactionsFrozen: frozen !== undefined ? frozen : !user.transactionsFrozen,
        },
    });
    return result;
};
const getSeriesApplications = async (query) => {
    const { page = 1, limit = 10, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (status)
        where.status = status.toUpperCase();
    const [data, total] = await Promise.all([
        prisma_1.prisma.seriesApplication.findMany({
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
        prisma_1.prisma.seriesApplication.count({ where }),
    ]);
    return {
        meta: { total, page: Number(page), limit: Number(limit) },
        data,
    };
};
const reviewSeriesApplication = async (id, payload) => {
    const { status, notes } = payload;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Status must be APPROVED or REJECTED');
    }
    const application = await prisma_1.prisma.seriesApplication.findUnique({ where: { id } });
    if (!application)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Application not found');
    if (application.status !== 'PENDING') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Application has already been reviewed');
    }
    const result = await prisma_1.prisma.seriesApplication.update({
        where: { id },
        data: { status, notes },
    });
    // If approved, upgrade user to creator role if they aren't already
    if (status === 'APPROVED') {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: application.creatorId } });
        if (user && user.role === 'user') {
            await prisma_1.prisma.user.update({
                where: { id: application.creatorId },
                data: { role: 'creator' },
            });
            // Create a creator profile if it doesn't exist
            const existingProfile = await prisma_1.prisma.creatorProfile.findUnique({
                where: { userId: application.creatorId },
            });
            if (!existingProfile) {
                await prisma_1.prisma.creatorProfile.create({
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
const getWithdrawalRequests = async (query) => {
    const { page = 1, limit = 10, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (status)
        where.status = status.toUpperCase();
    const [data, total] = await Promise.all([
        prisma_1.prisma.withdrawalRequest.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true, points: true, dailyAdViews: true, dailyAdPointsEarned: true },
                },
            },
        }),
        prisma_1.prisma.withdrawalRequest.count({ where }),
    ]);
    return {
        meta: { total, page: Number(page), limit: Number(limit) },
        data,
    };
};
const reviewWithdrawalRequest = async (id, payload) => {
    const { status, notes } = payload;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Status must be APPROVED or REJECTED');
    }
    const request = await prisma_1.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!request)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Withdrawal request not found');
    if (request.status !== 'PENDING') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Request has already been reviewed');
    }
    // If rejected, refund the points back to the user
    if (status === 'REJECTED') {
        await prisma_1.prisma.$transaction(async (tx) => {
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
    const result = await prisma_1.prisma.withdrawalRequest.update({
        where: { id },
        data: { status, notes },
    });
    return result;
};
const getFeaturedRequests = async (query) => {
    const { page = 1, limit = 10, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (status)
        where.status = status.toUpperCase();
    const [data, total] = await Promise.all([
        prisma_1.prisma.featuredRequest.findMany({
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
        prisma_1.prisma.featuredRequest.count({ where }),
    ]);
    return {
        meta: { total, page: Number(page), limit: Number(limit) },
        data,
    };
};
const reviewFeaturedRequest = async (id, payload) => {
    const { status, notes } = payload;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Status must be APPROVED or REJECTED');
    }
    const request = await prisma_1.prisma.featuredRequest.findUnique({ where: { id } });
    if (!request)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Featured request not found');
    if (request.status !== 'PENDING') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Request has already been reviewed');
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
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
exports.ModeratorService = {
    banUser,
    freezeUser,
    getSeriesApplications,
    reviewSeriesApplication,
    getWithdrawalRequests,
    reviewWithdrawalRequest,
    getFeaturedRequests,
    reviewFeaturedRequest,
};
