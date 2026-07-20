"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const prisma_1 = require("../../../lib/prisma");
const getAdminStats = async () => {
    const totalUsers = await prisma_1.prisma.user.count();
    const totalSeries = await prisma_1.prisma.series.count();
    const totalChapters = await prisma_1.prisma.chapter.count();
    const topSeries = await prisma_1.prisma.series.findMany({
        take: 5,
        orderBy: { totalViews: 'desc' },
        select: {
            title: true,
            totalViews: true,
        },
    });
    // Example revenue stats (if we had a payment model)
    // For now, let's just return these basic counts
    return {
        totalUsers,
        totalSeries,
        totalChapters,
        topSeries,
        revenueByDay: [], // Placeholder
    };
};
exports.StatsService = {
    getAdminStats,
};
