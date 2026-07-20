"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = require("../../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const getChapterByNumber = async (seriesSlug, number, userId) => {
    const series = await prisma_1.prisma.series.findUnique({
        where: { slug: seriesSlug },
        select: { id: true }
    });
    if (!series)
        return null;
    const result = await prisma_1.prisma.chapter.findFirst({
        where: {
            seriesId: series.id,
            number: Number(number)
        },
        include: {
            images: {
                orderBy: { order: 'asc' },
            },
            series: {
                select: { title: true, slug: true },
            },
        },
    });
    if (!result)
        return null;
    // Check if the authenticated user already purchased this chapter
    let isPurchased = false;
    if (userId && result.isLocked) {
        const purchase = await prisma_1.prisma.chapterPurchase.findUnique({
            where: { userId_chapterId: { userId, chapterId: result.id } },
        });
        isPurchased = !!purchase;
    }
    // Find prev and next chapters
    const prevChapter = await prisma_1.prisma.chapter.findFirst({
        where: {
            seriesId: result.seriesId,
            number: { lt: result.number },
        },
        orderBy: { number: 'desc' },
    });
    const nextChapter = await prisma_1.prisma.chapter.findFirst({
        where: {
            seriesId: result.seriesId,
            number: { gt: result.number },
        },
        orderBy: { number: 'asc' },
    });
    return {
        ...result,
        images: (result.isLocked && !isPurchased) ? [] : result.images,
        isPurchased,
        prevChapterNumber: prevChapter?.number || null,
        nextChapterNumber: nextChapter?.number || null,
    };
};
const getAllChapters = async (query) => {
    const { page = 1, limit = 10, seriesId, creatorId } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (seriesId)
        where.seriesId = seriesId;
    if (creatorId)
        where.series = { creatorId };
    const result = await prisma_1.prisma.chapter.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            series: {
                select: { title: true },
            },
        },
    });
    const total = await prisma_1.prisma.chapter.count({ where });
    return {
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
        },
        data: result,
    };
};
const getChapterById = async (id, userId) => {
    const result = await prisma_1.prisma.chapter.findUnique({
        where: { id },
        include: {
            images: {
                orderBy: { order: 'asc' },
            },
            series: {
                select: { title: true, slug: true },
            },
        },
    });
    if (!result)
        return null;
    // Check if the authenticated user already purchased this chapter
    let isPurchased = false;
    if (userId && result.isLocked) {
        const purchase = await prisma_1.prisma.chapterPurchase.findUnique({
            where: { userId_chapterId: { userId, chapterId: id } },
        });
        isPurchased = !!purchase;
    }
    // Find prev and next chapters
    const prevChapter = await prisma_1.prisma.chapter.findFirst({
        where: {
            seriesId: result.seriesId,
            number: { lt: result.number },
        },
        orderBy: { number: 'desc' },
    });
    const nextChapter = await prisma_1.prisma.chapter.findFirst({
        where: {
            seriesId: result.seriesId,
            number: { gt: result.number },
        },
        orderBy: { number: 'asc' },
    });
    return {
        ...result,
        images: (result.isLocked && !isPurchased) ? [] : result.images,
        isPurchased,
        prevChapterNumber: prevChapter?.number || null,
        nextChapterNumber: nextChapter?.number || null,
    };
};
const createChapter = async (data) => {
    const { images = [], ...chapterData } = data;
    const result = await prisma_1.prisma.chapter.create({
        data: {
            ...chapterData,
            images: {
                create: (images || []).map((img) => ({
                    url: img.url,
                    order: img.order,
                })),
            },
        },
    });
    return result;
};
const updateChapter = async (id, data) => {
    const { images, ...chapterData } = data;
    const existing = await prisma_1.prisma.chapter.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Chapter not found');
    }
    const result = await prisma_1.prisma.chapter.update({
        where: { id },
        data: {
            ...chapterData,
            ...(images && {
                images: {
                    deleteMany: {},
                    create: images.map((img) => ({
                        url: img.url,
                        order: img.order,
                    })),
                },
            }),
        },
    });
    return result;
};
const deleteChapter = async (id) => {
    const existing = await prisma_1.prisma.chapter.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Chapter not found');
    }
    return await prisma_1.prisma.chapter.delete({
        where: { id },
    });
};
exports.ChapterService = {
    getChapterById,
    getChapterByNumber,
    getAllChapters,
    createChapter,
    updateChapter,
    deleteChapter,
};
