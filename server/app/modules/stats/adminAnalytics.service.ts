import { prisma } from '../../../lib/prisma';

export interface AdminAnalyticsQuery {
  timeframe?: '7d' | '30d' | '90d' | '1y' | 'all';
}

export const getAdminAnalyticsData = async (query: AdminAnalyticsQuery = {}) => {
  const timeframe = query.timeframe || '30d';
  const now = new Date();

  let startDate: Date;
  let prevStartDate: Date;

  switch (timeframe) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      prevStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      prevStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      startDate = new Date(0);
      prevStartDate = new Date(0);
      break;
    case '30d':
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      break;
  }

  // 1. Executive Platform KPIs
  const [
    totalUsers,
    usersInPeriod,
    usersInPrevPeriod,
    totalCreators,
    totalSeries,
    activeSeries,
    totalChapters,
    viewsAgg,
    grossPaymentsAgg,
    paymentsInPeriodAgg,
    paymentsInPrevPeriodAgg,
    chapterPurchasesAgg,
    adImpressionsAgg,
    adClicksAgg,
    approvedWithdrawalsAgg,
    pendingWithdrawalsAgg,
    totalDistributionRunsAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startDate } } }),
    prisma.user.count({ where: { createdAt: { gte: prevStartDate, lt: startDate } } }),
    prisma.creatorProfile.count(),
    prisma.series.count(),
    prisma.series.count({ where: { status: 'ONGOING' } }),
    prisma.chapter.count(),
    prisma.series.aggregate({ _sum: { totalViews: true } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true, points: true } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: startDate } }, _sum: { amount: true, points: true } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: prevStartDate, lt: startDate } }, _sum: { amount: true, points: true } }),
    prisma.chapterPurchase.aggregate({ _sum: { pointsSpent: true }, _count: { id: true } }),
    prisma.customAd.aggregate({ _sum: { impressions: true } }),
    prisma.customAd.aggregate({ _sum: { clicks: true } }),
    prisma.withdrawalRequest.aggregate({ where: { status: 'APPROVED' }, _sum: { fiatAmount: true, pointsRequested: true } }),
    prisma.withdrawalRequest.aggregate({ where: { status: 'PENDING' }, _sum: { fiatAmount: true, pointsRequested: true }, _count: { id: true } }),
    prisma.revenueDistributionRun.aggregate({ where: { status: 'COMPLETED' }, _sum: { distributablePool: true, totalCreatorsCount: true } }),
  ]);

  const calcGrowth = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
  };

  const userGrowth = calcGrowth(usersInPeriod, usersInPrevPeriod);
  const revCurr = paymentsInPeriodAgg._sum.amount || 0;
  const revPrev = paymentsInPrevPeriodAgg._sum.amount || 0;
  const revenueGrowth = calcGrowth(revCurr, revPrev);

  const grossRevenue = grossPaymentsAgg._sum.amount || 0;
  const totalFiatWithdrawn = approvedWithdrawalsAgg._sum.fiatAmount || 0;
  const pendingFiatLiability = pendingWithdrawalsAgg._sum.fiatAmount || 0;
  const totalAdViews = adImpressionsAgg._sum.impressions || 0;
  const totalAdClicks = adClicksAgg._sum.clicks || 0;
  const globalCtr = totalAdViews > 0 ? Math.round((totalAdClicks / totalAdViews) * 1000) / 10 : 0;
  const totalViews = viewsAgg._sum.totalViews || 0;
  const totalChapterUnlocks = chapterPurchasesAgg._count.id || 0;
  const totalPointsSpentOnChapters = chapterPurchasesAgg._sum.pointsSpent || 0;

  // 2. Revenue vs Payouts vs Margin Time Series
  const paymentsList = await prisma.payment.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: { gte: timeframe === 'all' ? new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) : startDate },
    },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const withdrawalsList = await prisma.withdrawalRequest.findMany({
    where: {
      status: 'APPROVED',
      createdAt: { gte: timeframe === 'all' ? new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) : startDate },
    },
    select: { fiatAmount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by day / week for time series
  const dateMap: { [key: string]: { revenue: number; payouts: number; margin: number } } = {};
  const dayCount = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 180;
  
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    dateMap[key] = { revenue: 0, payouts: 0, margin: 0 };
  }

  paymentsList.forEach((p) => {
    const key = p.createdAt.toISOString().split('T')[0];
    if (dateMap[key]) {
      dateMap[key].revenue += p.amount;
    }
  });

  withdrawalsList.forEach((w) => {
    const key = w.createdAt.toISOString().split('T')[0];
    if (dateMap[key]) {
      dateMap[key].payouts += w.fiatAmount;
    }
  });

  const revenueCashFlowChart = Object.keys(dateMap).map((date) => {
    const rev = Math.round(dateMap[date].revenue * 100) / 100;
    const payouts = Math.round(dateMap[date].payouts * 100) / 100;
    const margin = Math.round((rev - payouts) * 100) / 100;
    return {
      date,
      revenue: rev,
      payouts: payouts,
      margin: margin,
    };
  });

  // 3. User & Engagement Read Events
  const [readEventsGrouped, activeUsersToday, activeUsersMonth] = await Promise.all([
    prisma.chapterReadEvent.groupBy({
      by: ['qualityTier'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
    }),
    prisma.chapterReadEvent.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.chapterReadEvent.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const readQualityDistribution = [
    { tier: 'BOUNCED', name: 'Quick Bounce (<15s)', count: 0, color: '#f43f5e' },
    { tier: 'QUALIFIED', name: 'Standard Read (15-60s)', count: 0, color: '#f59e0b' },
    { tier: 'ENGAGED', name: 'Engaged Read (1-3m)', count: 0, color: '#3b82f6' },
    { tier: 'COMPLETED', name: 'Completed Chapter (>3m)', count: 0, color: '#10b981' },
  ];

  readEventsGrouped.forEach((g) => {
    const found = readQualityDistribution.find((r) => r.tier === g.qualityTier);
    if (found) found.count = g._count.id;
  });

  // 4. Ad Network Performance Breakdown
  const adsData = await prisma.customAd.findMany({
    select: {
      id: true,
      title: true,
      provider: true,
      placement: true,
      impressions: true,
      clicks: true,
      points: true,
      isActive: true,
    },
  });

  const adProviderBreakdown: Record<string, { provider: string; impressions: number; clicks: number; units: number }> = {
    ADSENSE: { provider: 'Google AdSense (Web)', impressions: 0, clicks: 0, units: 0 },
    ADMOB: { provider: 'Google AdMob (App)', impressions: 0, clicks: 0, units: 0 },
    CUSTOM: { provider: 'Direct Sponsor Placements', impressions: 0, clicks: 0, units: 0 },
  };

  adsData.forEach((ad) => {
    const prov = ad.provider || 'CUSTOM';
    if (adProviderBreakdown[prov]) {
      adProviderBreakdown[prov].impressions += ad.impressions;
      adProviderBreakdown[prov].clicks += ad.clicks;
      adProviderBreakdown[prov].units += 1;
    }
  });

  const adNetworkStats = Object.values(adProviderBreakdown).map((prov) => ({
    ...prov,
    ctr: prov.impressions > 0 ? Math.round((prov.clicks / prov.impressions) * 1000) / 10 : 0,
  }));

  // 5. Content Format & Genre Distribution
  const [seriesByType, topGenresRaw] = await Promise.all([
    prisma.series.groupBy({
      by: ['type'],
      _count: { id: true },
      _sum: { totalViews: true },
    }),
    prisma.genre.findMany({
      take: 8,
      include: {
        _count: { select: { series: true } },
      },
    }),
  ]);

  const typeColorMap: Record<string, string> = {
    MANHWA: '#e11d48',
    MANGA: '#3b82f6',
    MANHUA: '#8b5cf6',
    COMIC: '#10b981',
  };

  const contentFormatDistribution = seriesByType.map((item) => ({
    name: item.type,
    count: item._count.id,
    views: item._sum.totalViews || 0,
    color: typeColorMap[item.type] || '#f59e0b',
  }));

  const genreDistribution = topGenresRaw.map((g) => ({
    name: g.name,
    seriesCount: g._count.series,
  }));

  // 6. Top Performing Series Leaderboard
  const topSeriesList = await prisma.series.findMany({
    take: 8,
    orderBy: { totalViews: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      type: true,
      status: true,
      totalViews: true,
      favorites: true,
      rating: true,
      _count: { select: { chapters: true, bookmarks: true } },
    },
  });

  // 7. Top Creators Leaderboard
  const topCreatorsList = await prisma.creatorProfile.findMany({
    take: 8,
    orderBy: { totalEarnings: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      _count: { select: { series: true } },
    },
  });

  // 8. Platform Health & Action Items
  const [pendingReportsCount, pendingApplicationsCount, frozenUsersCount] = await Promise.all([
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.seriesApplication.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { transactionsFrozen: true } }),
  ]);

  return {
    timeframe,
    kpis: {
      grossRevenue,
      revenueGrowth,
      totalUsers,
      userGrowth,
      dau: activeUsersToday.length,
      mau: activeUsersMonth.length,
      totalCreators,
      totalSeries,
      activeSeries,
      totalChapters,
      totalViews,
      totalAdViews,
      totalAdClicks,
      globalCtr,
      totalFiatWithdrawn,
      pendingFiatLiability,
      pendingWithdrawalCount: pendingWithdrawalsAgg._count.id || 0,
      totalChapterUnlocks,
      totalPointsSpentOnChapters,
      totalDistributionPool: totalDistributionRunsAgg._sum.distributablePool || 0,
    },
    revenueCashFlowChart,
    readQualityDistribution,
    adNetworkStats,
    contentFormatDistribution,
    genreDistribution,
    topSeriesList: topSeriesList.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      coverUrl: s.coverUrl,
      type: s.type,
      status: s.status,
      views: s.totalViews,
      bookmarks: s._count.bookmarks,
      rating: s.rating,
      chapterCount: s._count.chapters,
    })),
    topCreatorsList: topCreatorsList.map((c) => ({
      id: c.id,
      channelName: c.channelName,
      userName: c.user?.name || 'Studio',
      userEmail: c.user?.email,
      userImage: c.profileImage || c.user?.image,
      totalEarnings: c.totalEarnings,
      withdrawnAmount: c.withdrawnAmount,
      seriesCount: c._count.series,
    })),
    healthAlerts: {
      pendingWithdrawals: pendingWithdrawalsAgg._count.id || 0,
      pendingWithdrawalAmount: pendingFiatLiability,
      pendingReports: pendingReportsCount,
      pendingApplications: pendingApplicationsCount,
      frozenUsers: frozenUsersCount,
    },
  };
};
