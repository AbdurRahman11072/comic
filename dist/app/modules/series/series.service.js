"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeriesService = void 0;
const prisma_1 = require("../../../lib/prisma");
const getAllSeries = async (query) => {
    const { page = 1, limit = 10, type, status, genre, sort, isPinned, isDiscounted, creatorId } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (type)
        where.type = type.toUpperCase();
    if (status)
        where.status = status.toUpperCase();
    if (creatorId)
        where.creatorId = creatorId;
    if (isPinned !== undefined)
        where.isPinned = isPinned === 'true';
    if (isDiscounted === 'true') {
        where.discount = { not: null };
    }
    if (genre) {
        where.genres = {
            some: {
                name: genre,
            },
        };
    }
    const orderBy = {};
    if (sort === 'latest')
        orderBy.updatedAt = 'desc';
    else if (sort === 'popular')
        orderBy.totalViews = 'desc';
    else if (sort === 'rating')
        orderBy.rating = 'desc';
    else
        orderBy.createdAt = 'desc';
    const result = await prisma_1.prisma.series.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
            genres: true,
            featured: true,
            chapters: {
                take: 3,
                orderBy: { number: 'desc' },
            },
            _count: {
                select: { chapters: true },
            },
        },
    });
    const total = await prisma_1.prisma.series.count({ where });
    return {
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
        },
        data: result,
    };
};
const getPinnedSeries = async () => {
    return await prisma_1.prisma.series.findMany({
        where: { isPinned: true },
        include: {
            genres: true,
            chapters: {
                take: 4,
                orderBy: { number: 'desc' },
            },
        },
        orderBy: { updatedAt: 'desc' },
    });
};
const getDiscountedSeries = async () => {
    return await prisma_1.prisma.series.findMany({
        where: { discount: { not: null } },
        include: {
            genres: true,
        },
        orderBy: { updatedAt: 'desc' },
    });
};
const getSeriesBySlug = async (slug, userId) => {
    const result = await prisma_1.prisma.series.findUnique({
        where: { slug },
        include: {
            genres: true,
            chapters: {
                orderBy: { number: 'desc' },
            },
            _count: {
                select: { bookmarks: true }
            }
        },
    });
    if (!result)
        return null;
    if (userId) {
        const purchasedChapterIds = await prisma_1.prisma.chapterPurchase.findMany({
            where: { userId, chapterId: { in: result.chapters.map(c => c.id) } },
            select: { chapterId: true }
        });
        const purchasedIds = new Set(purchasedChapterIds.map(p => p.chapterId));
        const bookmark = await prisma_1.prisma.bookmark.findUnique({
            where: { userId_seriesId: { userId, seriesId: result.id } },
        });
        const history = await prisma_1.prisma.history.findUnique({
            where: { userId_seriesId: { userId, seriesId: result.id } },
            include: { chapter: true }
        });
        return {
            ...result,
            isBookmarked: !!bookmark,
            lastReadChapterNumber: history?.chapter?.number || null,
            chapters: result.chapters.map(c => ({
                ...c,
                isPurchased: purchasedIds.has(c.id)
            }))
        };
    }
    return result;
};
const getSeriesById = async (id) => {
    const result = await prisma_1.prisma.series.findUnique({
        where: { id },
        include: {
            genres: true,
        },
    });
    return result;
};
const createSeries = async (data) => {
    const { genres = [], ...seriesData } = data;
    // Generate slug if not provided
    if (!seriesData.slug && seriesData.title) {
        seriesData.slug = seriesData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    // Normalize enums
    if (seriesData.type)
        seriesData.type = seriesData.type.toUpperCase();
    if (seriesData.status)
        seriesData.status = seriesData.status.toUpperCase();
    console.log('Creating series with data:', JSON.stringify({ ...seriesData, genres }, null, 2));
    try {
        const result = await prisma_1.prisma.series.create({
            data: {
                ...seriesData,
                genres: {
                    connectOrCreate: (genres || []).map((name) => ({
                        where: { name },
                        create: { name },
                    })),
                },
            },
        });
        return result;
    }
    catch (error) {
        console.error('Prisma Create Error:', error);
        throw error;
    }
};
const updateSeries = async (id, data) => {
    const { genres, ...seriesData } = data;
    // Normalize enums
    if (seriesData.type)
        seriesData.type = seriesData.type.toUpperCase();
    if (seriesData.status)
        seriesData.status = seriesData.status.toUpperCase();
    const result = await prisma_1.prisma.series.update({
        where: { id },
        data: {
            ...seriesData,
            ...(genres && {
                genres: {
                    set: [],
                    connectOrCreate: genres.map((name) => ({
                        where: { name },
                        create: { name },
                    })),
                },
            }),
        },
    });
    return result;
};
const deleteSeries = async (id) => {
    return await prisma_1.prisma.series.delete({
        where: { id },
    });
};
const toggleFeatured = async (seriesId) => {
    const existing = await prisma_1.prisma.featuredSeries.findUnique({
        where: { seriesId },
    });
    if (existing) {
        await prisma_1.prisma.featuredSeries.delete({
            where: { seriesId },
        });
        return { featured: false };
    }
    else {
        await prisma_1.prisma.featuredSeries.create({
            data: { seriesId },
        });
        return { featured: true };
    }
};
const getFeaturedSeries = async () => {
    return await prisma_1.prisma.featuredSeries.findMany({
        include: {
            series: {
                include: {
                    genres: true,
                },
            },
        },
        orderBy: { order: 'asc' },
    });
};
exports.SeriesService = {
    getAllSeries,
    getSeriesBySlug,
    getPinnedSeries,
    getDiscountedSeries,
    createSeries,
    updateSeries,
    deleteSeries,
    toggleFeatured,
    getFeaturedSeries,
    getSeriesById,
};
