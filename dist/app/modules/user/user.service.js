"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../../../lib/prisma");
const getProfile = async (userId) => {
    const result = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            bookmarks: {
                include: { series: true },
            },
            history: {
                include: { series: true, chapter: true },
                orderBy: { updatedAt: 'desc' },
            },
            pointTransactions: {
                orderBy: { createdAt: 'desc' },
            },
            chapterPurchases: {
                include: { chapter: { include: { series: true } } },
                orderBy: { createdAt: 'desc' },
            },
        },
    });
    return result;
};
const toggleBookmark = async (userId, seriesId) => {
    const existing = await prisma_1.prisma.bookmark.findUnique({
        where: {
            userId_seriesId: { userId, seriesId },
        },
    });
    if (existing) {
        await prisma_1.prisma.bookmark.delete({
            where: { id: existing.id },
        });
        return { isBookmarked: false };
    }
    else {
        await prisma_1.prisma.bookmark.create({
            data: { userId, seriesId },
        });
        return { isBookmarked: true };
    }
};
const updateHistory = async (userId, seriesId, chapterId) => {
    const result = await prisma_1.prisma.history.upsert({
        where: {
            userId_seriesId: { userId, seriesId },
        },
        update: { chapterId },
        create: { userId, seriesId, chapterId },
    });
    return result;
};
const getAllUsers = async (query) => {
    const { page = 1, limit = 10, searchTerm } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (searchTerm) {
        where.OR = [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
        ];
    }
    const result = await prisma_1.prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
    });
    const total = await prisma_1.prisma.user.count({ where });
    return {
        meta: { total, page: Number(page), limit: Number(limit) },
        data: result,
    };
};
const updateUser = async (id, data) => {
    return await prisma_1.prisma.user.update({
        where: { id },
        data,
    });
};
const deleteUser = async (id) => {
    return await prisma_1.prisma.user.delete({
        where: { id },
    });
};
const getAllTransactions = async (query) => {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const result = await prisma_1.prisma.pointTransaction.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
        },
    });
    const total = await prisma_1.prisma.pointTransaction.count();
    return {
        meta: { total, page: Number(page), limit: Number(limit) },
        data: result,
    };
};
exports.UserService = {
    getProfile,
    toggleBookmark,
    updateHistory,
    getAllUsers,
    updateUser,
    deleteUser,
    getAllTransactions,
};
