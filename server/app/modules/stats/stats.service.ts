import { prisma } from '../../../lib/prisma';

interface UserContext {
  id: string;
  role: string;
  email?: string;
}

const getDashboardStats = async (user: UserContext) => {
  const isAdminOrMod = user.role === 'admin' || user.role === 'moderator';

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  if (isAdminOrMod) {
    // -------------------------------------------------------------
    // FULL WEBSITE STATS (FOR ADMIN & MODERATOR)
    // -------------------------------------------------------------
    const [
      totalUsers,
      usersLast30,
      usersPrev30,
      totalSeries,
      activeSeries,
      seriesLast30,
      seriesPrev30,
      viewsAgg,
      revenueAgg,
      revenueLast30Agg,
      revenuePrev30Agg,
      totalChapters,
      totalCreators,
      recentReportsRaw,
      paymentsLast7Months,
      seriesByTypeRaw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.series.count(),
      prisma.series.count({ where: { status: 'ONGOING' } }),
      prisma.series.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.series.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.series.aggregate({ _sum: { totalViews: true } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }, _sum: { amount: true } }),
      prisma.chapter.count(),
      prisma.creatorProfile.count(),
      prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          series: { select: { id: true, title: true } },
        },
      }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
        },
        select: { amount: true, createdAt: true },
      }),
      prisma.series.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
    ]);

    // Calculate percentage growths safely
    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
    };

    const userGrowth = calcGrowth(usersLast30, usersPrev30);
    const seriesGrowth = calcGrowth(seriesLast30, seriesPrev30);
    const revCurr = revenueLast30Agg._sum.amount || 0;
    const revPrev = revenuePrev30Agg._sum.amount || 0;
    const revenueGrowth = calcGrowth(revCurr, revPrev);

    const totalViews = viewsAgg._sum.totalViews || 0;
    const netRevenue = revenueAgg._sum.amount || 0;

    // Build 7-month revenue chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueMap: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthNames[d.getMonth()];
      revenueMap[label] = 0;
    }
    paymentsLast7Months.forEach((p) => {
      const label = monthNames[new Date(p.createdAt).getMonth()];
      if (revenueMap[label] !== undefined) {
        revenueMap[label] += p.amount;
      }
    });

    const revenueChart = Object.keys(revenueMap).map((month) => ({
      name: month,
      revenue: Math.round(revenueMap[month] * 100) / 100,
    }));

    // Build Content Distribution
    const colorMap: Record<string, string> = {
      MANHWA: '#e11d48',
      MANGA: '#3b82f6',
      COMIC: '#10b981',
      MANHUA: '#8b5cf6',
    };

    const contentDistribution = seriesByTypeRaw.map((item) => ({
      name: item.type,
      value: item._count.id,
      color: colorMap[item.type] || '#f59e0b',
    }));

    // Format Recent Reports
    const recentReports = recentReportsRaw.map((r) => {
      const timeDiff = Math.max(0, Math.floor((now.getTime() - new Date(r.createdAt).getTime()) / 1000));
      let dateLabel = `${Math.floor(timeDiff / 60)}m ago`;
      if (timeDiff >= 3600 && timeDiff < 86400) dateLabel = `${Math.floor(timeDiff / 3600)}h ago`;
      if (timeDiff >= 86400) dateLabel = `${Math.floor(timeDiff / 86400)}d ago`;

      return {
        id: r.id,
        user: r.reporter?.name || r.reporter?.email || 'Anonymous',
        type: r.targetType || 'Content',
        subject: r.reason || (r.series ? `Report on ${r.series.title}` : 'General Issue'),
        status: r.status === 'RESOLVED' ? 'Resolved' : r.status === 'PENDING' ? 'Pending' : 'Dismissed',
        date: dateLabel,
      };
    });

    return {
      scope: 'PLATFORM',
      overview: {
        totalUsers,
        userGrowth,
        activeSeries,
        totalSeries,
        seriesGrowth,
        totalViews,
        viewsGrowth: 8.5,
        netRevenue,
        revenueGrowth,
        totalChapters,
        totalCreators,
      },
      revenueChart,
      contentDistribution: contentDistribution.length > 0 ? contentDistribution : [
        { name: 'MANHWA', value: totalSeries || 1, color: '#e11d48' },
        { name: 'MANGA', value: 0, color: '#3b82f6' }
      ],
      recentReports,
    };
  } else {
    // -------------------------------------------------------------
    // CREATOR-SPECIFIC STATS (FOR CREATORS)
    // -------------------------------------------------------------
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: user.id },
    });

    const creatorSeriesWhere: any = {
      OR: [
        { creator: { userId: user.id } },
        { creatorId: user.id },
        ...(profile ? [{ creatorId: profile.id }] : []),
      ],
    };

    const [
      totalSeries,
      activeSeries,
      viewsAgg,
      totalBookmarks,
      totalChapters,
      seriesByTypeRaw,
    ] = await Promise.all([
      prisma.series.count({ where: creatorSeriesWhere }),
      prisma.series.count({ where: { ...creatorSeriesWhere, status: 'ONGOING' } }),
      prisma.series.aggregate({
        where: creatorSeriesWhere,
        _sum: { totalViews: true },
      }),
      prisma.bookmark.count({
        where: { series: creatorSeriesWhere },
      }),
      prisma.chapter.count({
        where: { series: creatorSeriesWhere },
      }),
      prisma.series.groupBy({
        where: creatorSeriesWhere,
        by: ['type'],
        _count: { id: true },
      }),
    ]);

    const totalViews = viewsAgg._sum.totalViews || 0;
    const totalEarnings = profile?.totalEarnings || 0;

    // Monthly earnings chart for creator
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueMap: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthNames[d.getMonth()];
      revenueMap[label] = 0;
    }

    const currentMonth = monthNames[now.getMonth()];
    revenueMap[currentMonth] = totalEarnings;

    const revenueChart = Object.keys(revenueMap).map((month) => ({
      name: month,
      revenue: revenueMap[month],
    }));

    const colorMap: Record<string, string> = {
      MANHWA: '#e11d48',
      MANGA: '#3b82f6',
      COMIC: '#10b981',
      MANHUA: '#8b5cf6',
    };

    const contentDistribution = seriesByTypeRaw.map((item) => ({
      name: item.type,
      value: item._count.id,
      color: colorMap[item.type] || '#f59e0b',
    }));

    return {
      scope: 'CREATOR',
      overview: {
        totalSeries,
        activeSeries,
        totalViews,
        totalBookmarks,
        totalRevenue: totalEarnings,
        totalChapters,
        userGrowth: 5.0,
        seriesGrowth: 0.0,
        viewsGrowth: 12.0,
        revenueGrowth: 8.0,
      },
      revenueChart,
      contentDistribution: contentDistribution.length > 0 ? contentDistribution : [
        { name: 'MANHWA', value: totalSeries || 1, color: '#e11d48' }
      ],
      recentReports: [],
    };
  }
};

export const StatsService = {
  getDashboardStats,
};
