"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityService = void 0;
const prisma_1 = require("../../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
// ─── Comments ───────────────────────────────────────────────────────────────
const getComments = async (chapterId, query) => {
    const { page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        prisma_1.prisma.comment.findMany({
            where: { chapterId },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, image: true },
                },
            },
        }),
        prisma_1.prisma.comment.count({ where: { chapterId } }),
    ]);
    return {
        meta: { total, page: Number(page), limit: Number(limit) },
        data,
    };
};
const createComment = async (userId, payload) => {
    const { chapterId, content } = payload;
    if (!chapterId || !content?.trim()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chapter ID and content are required');
    }
    const result = await prisma_1.prisma.comment.create({
        data: { userId, chapterId, content: content.trim() },
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
        },
    });
    return result;
};
const deleteComment = async (commentId, userId, role) => {
    const comment = await prisma_1.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Comment not found');
    // Only the author, moderators, or admins can delete
    if (comment.userId !== userId && role !== 'moderator' && role !== 'admin') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only delete your own comments');
    }
    await prisma_1.prisma.comment.delete({ where: { id: commentId } });
};
// ─── Reviews ────────────────────────────────────────────────────────────────
const getReviews = async (seriesId, query) => {
    const { page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        prisma_1.prisma.review.findMany({
            where: { seriesId },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, image: true },
                },
            },
        }),
        prisma_1.prisma.review.count({ where: { seriesId } }),
    ]);
    return {
        meta: { total, page: Number(page), limit: Number(limit) },
        data,
    };
};
const createReview = async (userId, payload) => {
    const { seriesId, rating, content } = payload;
    if (!seriesId || !rating || rating < 1 || rating > 5) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Series ID and a rating between 1-5 are required');
    }
    // Check if the user has already reviewed this series
    const existing = await prisma_1.prisma.review.findFirst({
        where: { userId, seriesId },
    });
    if (existing) {
        // Update existing review instead of creating a duplicate
        const result = await prisma_1.prisma.review.update({
            where: { id: existing.id },
            data: { rating: Number(rating), content: content?.trim() || null },
            include: {
                user: {
                    select: { id: true, name: true, image: true },
                },
            },
        });
        // Recalculate average rating for the series
        await recalculateSeriesRating(seriesId);
        return result;
    }
    const result = await prisma_1.prisma.review.create({
        data: {
            userId,
            seriesId,
            rating: Number(rating),
            content: content?.trim() || null,
        },
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
        },
    });
    await recalculateSeriesRating(seriesId);
    return result;
};
const deleteReview = async (reviewId, userId, role) => {
    const review = await prisma_1.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Review not found');
    if (review.userId !== userId && role !== 'moderator' && role !== 'admin') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only delete your own reviews');
    }
    const seriesId = review.seriesId;
    await prisma_1.prisma.review.delete({ where: { id: reviewId } });
    await recalculateSeriesRating(seriesId);
};
const recalculateSeriesRating = async (seriesId) => {
    const agg = await prisma_1.prisma.review.aggregate({
        where: { seriesId },
        _avg: { rating: true },
    });
    await prisma_1.prisma.series.update({
        where: { id: seriesId },
        data: { rating: agg._avg.rating || 0 },
    });
};
// ─── Reports ────────────────────────────────────────────────────────────────
const createReport = async (userId, payload) => {
    const { reason, targetType, targetId } = payload;
    if (!reason || !targetType || !targetId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Reason, targetType, and targetId are required');
    }
    const validTypes = ['series', 'chapter', 'comment', 'review', 'user'];
    if (!validTypes.includes(targetType)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `targetType must be one of: ${validTypes.join(', ')}`);
    }
    const result = await prisma_1.prisma.report.create({
        data: {
            reporterId: userId,
            reason,
            targetType,
            targetId,
            status: 'PENDING',
        },
    });
    return result;
};
const getReports = async (query) => {
    const { page = 1, limit = 20, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (status)
        where.status = status.toUpperCase();
    const [data, total] = await Promise.all([
        prisma_1.prisma.report.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: {
                    select: { id: true, name: true, email: true, image: true },
                },
            },
        }),
        prisma_1.prisma.report.count({ where }),
    ]);
    return {
        meta: { total, page: Number(page), limit: Number(limit) },
        data,
    };
};
const resolveReport = async (reportId, payload) => {
    const { status } = payload;
    if (!['RESOLVED', 'DISMISSED'].includes(status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Status must be RESOLVED or DISMISSED');
    }
    const report = await prisma_1.prisma.report.findUnique({ where: { id: reportId } });
    if (!report)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Report not found');
    if (report.status !== 'PENDING') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Report has already been processed');
    }
    const result = await prisma_1.prisma.report.update({
        where: { id: reportId },
        data: { status },
    });
    return result;
};
// ─── Chat Room ──────────────────────────────────────────────────────────────
const getChatMessages = async () => {
    const result = await prisma_1.prisma.chatMessage.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' }, // Get the newest 50 first
        include: {
            user: {
                select: { id: true, name: true, image: true, role: true }
            }
        }
    });
    // Return in chronological order for chat view
    return result.reverse();
};
const createChatMessage = async (userId, content) => {
    if (!content || !content.trim()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Message content is required');
    }
    const result = await prisma_1.prisma.chatMessage.create({
        data: {
            userId,
            content: content.trim()
        },
        include: {
            user: {
                select: { id: true, name: true, image: true, role: true }
            }
        }
    });
    return result;
};
const deleteChatMessage = async (messageId) => {
    const message = await prisma_1.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Message not found');
    await prisma_1.prisma.chatMessage.delete({ where: { id: messageId } });
};
exports.CommunityService = {
    getComments,
    createComment,
    deleteComment,
    getReviews,
    createReview,
    deleteReview,
    createReport,
    getReports,
    resolveReport,
    getChatMessages,
    createChatMessage,
    deleteChatMessage
};
