import { prisma } from '../../../lib/prisma';

const getAdminStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalSeries = await prisma.series.count();
  const totalChapters = await prisma.chapter.count();
  
  const topSeries = await prisma.series.findMany({
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

export const StatsService = {
  getAdminStats,
};
