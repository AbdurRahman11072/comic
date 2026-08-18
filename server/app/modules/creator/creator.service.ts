import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const getAllCreators = async (query: any) => {
  const { search } = query;

  const where: any = {
    role: { in: ['creator', 'admin'] },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { creatorProfile: { channelName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const creators = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      points: true,
      banned: true,
      createdAt: true,
      creatorProfile: true,
      series: {
        select: {
          id: true,
          title: true,
          slug: true,
          totalViews: true,
          _count: {
            select: { chapters: true },
          },
        },
      },
      createdPromoCodes: {
        select: {
          id: true,
          code: true,
          usedCount: true,
          maxUses: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = creators.map((c) => {
    const totalViews = c.series.reduce((sum, s) => sum + s.totalViews, 0);
    const totalChapters = c.series.reduce((sum, s) => sum + s._count.chapters, 0);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role,
      image: c.image,
      points: c.points,
      banned: c.banned,
      createdAt: c.createdAt,
      channelId: c.creatorProfile?.id || c.id,
      channelName: c.creatorProfile?.channelName || c.name,
      channelDescription: c.creatorProfile?.description || null,
      channelBanner: c.creatorProfile?.bannerUrl || null,
      totalEarnings: c.creatorProfile?.totalEarnings || 0,
      withdrawnAmount: c.creatorProfile?.withdrawnAmount || 0,
      seriesCount: c.series.length,
      totalChapters,
      totalViews,
      promoCodesCount: c.createdPromoCodes.length,
    };
  });

  return formatted;
};

const getProfile = async (userId: string) => {
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Creator profile not found');
  }

  return profile;
};

const updateProfile = async (userId: string, payload: any) => {
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return await prisma.creatorProfile.create({
      data: {
        userId,
        channelName: payload.channelName || 'New Creator',
        ...payload
      }
    });
  }

  const result = await prisma.creatorProfile.update({
    where: { userId },
    data: payload,
  });

  return result;
};

const applyForSeries = async (userId: string, payload: any) => {
  const { title, description } = payload;
  
  if (!title) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Series title is required');
  }

  const similarSeries = await prisma.series.findMany({
    where: {
      title: {
        contains: title,
        mode: 'insensitive',
      }
    }
  });

  if (similarSeries.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT, 
      `Similar series already exist on the platform: ${similarSeries.map(s => s.title).join(', ')}`
    );
  }

  const application = await prisma.seriesApplication.create({
    data: {
      creatorId: userId,
      title,
      description,
      status: 'PENDING'
    }
  });

  return application;
};

const getAnalytics = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const isPlatformAdmin = user?.role === 'admin';
  const seriesWhere = isPlatformAdmin ? {} : { creatorId: userId };

  const seriesList = await prisma.series.findMany({
    where: seriesWhere,
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      totalViews: true,
      rating: true,
      status: true,
      type: true,
      createdAt: true,
      updatedAt: true,
      chapters: {
        select: {
          id: true,
          number: true,
          title: true,
          isLocked: true,
          coinCost: true,
          createdAt: true,
        },
        orderBy: { number: 'desc' },
      },
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

  const totalViews = seriesList.reduce((sum, s) => sum + (s.totalViews || 0), 0);
  const totalChapters = seriesList.reduce((sum, s) => sum + s._count.chapters, 0);
  const totalBookmarks = seriesList.reduce((sum, s) => sum + s._count.bookmarks, 0);
  const totalReviews = seriesList.reduce((sum, s) => sum + s._count.reviews, 0);

  const purchaseWhere = isPlatformAdmin ? {} : { chapter: { series: { creatorId: userId } } };
  const chapterPurchases = await prisma.chapterPurchase.findMany({
    where: purchaseWhere,
    select: {
      pointsSpent: true,
      createdAt: true,
      chapter: {
        select: {
          seriesId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  // Calculate earnings per series
  const seriesEarningsMap: Record<string, number> = {};
  chapterPurchases.forEach((p) => {
    const sId = p.chapter?.seriesId;
    if (sId) {
      seriesEarningsMap[sId] = (seriesEarningsMap[sId] || 0) + p.pointsSpent;
    }
  });

  const totalRevenue = chapterPurchases.reduce((sum, p) => sum + p.pointsSpent, 0);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentPurchases = chapterPurchases.filter(p => new Date(p.createdAt) >= thirtyDaysAgo);

  const dailyRevenue: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().split('T')[0]!;
    dailyRevenue[key] = 0;
  }
  recentPurchases.forEach(p => {
    const key = new Date(p.createdAt).toISOString().split('T')[0]!;
    if (dailyRevenue[key] !== undefined) {
      dailyRevenue[key] += p.pointsSpent;
    }
  });

  const revenueChart = Object.entries(dailyRevenue)
    .map(([date, points]) => ({ date, points }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Map enriched series with engagement & attention indicators
  const enrichedSeries = seriesList.map((s) => {
    const earnings = seriesEarningsMap[s.id] || 0;
    const views = s.totalViews || 0;
    const bookmarks = s._count.bookmarks || 0;
    const bookmarkRate = views > 0 ? Number(((bookmarks / views) * 100).toFixed(1)) : 0;
    const daysSinceUpdate = Math.floor((now.getTime() - new Date(s.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    
    // Diagnostic status
    let attentionStatus: 'TRENDING' | 'STEADY' | 'NEEDS_ATTENTION' | 'NEW' = 'STEADY';
    let attentionReason = 'Performing consistently.';

    if (s._count.chapters < 3) {
      attentionStatus = 'NEEDS_ATTENTION';
      attentionReason = 'Only ' + s._count.chapters + ' chapter(s). Readers rarely bookmark or pay for series with < 3 chapters.';
    } else if (daysSinceUpdate > 14 && s.status === 'ONGOING') {
      attentionStatus = 'NEEDS_ATTENTION';
      attentionReason = 'No chapter updates in ' + daysSinceUpdate + ' days. Regular uploads retain 45% more active readers.';
    } else if (views >= 100 && bookmarkRate >= 8) {
      attentionStatus = 'TRENDING';
      attentionReason = 'High bookmark rate (' + bookmarkRate + '%). Excellent reader retention!';
    } else if (views < 20 && s._count.chapters >= 3) {
      attentionStatus = 'NEEDS_ATTENTION';
      attentionReason = 'Low discovery. Consider requesting a homepage feature or setting up promo codes.';
    }

    return {
      id: s.id,
      title: s.title,
      slug: s.slug,
      coverUrl: s.coverUrl,
      type: s.type,
      status: s.status,
      totalViews: views,
      rating: s.rating,
      earnings,
      bookmarkRate,
      daysSinceUpdate,
      attentionStatus,
      attentionReason,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      _count: s._count,
      chapters: s.chapters.slice(0, 10),
    };
  });

  return {
    overview: {
      totalSeries: seriesList.length,
      totalChapters,
      totalViews,
      totalBookmarks,
      totalReviews,
      totalRevenue,
    },
    series: enrichedSeries,
    revenueChart,
  };
};

const requestFeatureSeries = async (userId: string, seriesId: string, durationDays: number = 7, notes?: string) => {
  const series = await prisma.series.findUnique({
    where: { id: seriesId },
  });

  if (!series) {
    throw new AppError(httpStatus.NOT_FOUND, 'Series not found');
  }

  if (series.creatorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not own this series');
  }

  // Check if series is already actively featured
  const isAlreadyFeatured = await prisma.featuredSeries.findUnique({
    where: { seriesId },
  });
  if (isAlreadyFeatured) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This series is already featured on the homepage!');
  }

  // Check if there is already a PENDING request for this series
  const existingPending = await prisma.featuredRequest.findFirst({
    where: { seriesId, status: 'PENDING' },
  });
  if (existingPending) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You already have a pending feature request for this series.');
  }

  const config = await prisma.siteConfig.findUnique({
    where: { id: 'global' },
  });

  const baseFee = config ? config.featuredRequestFee : 500;
  
  // Calculate total fee based on duration time lap
  const days = Number(durationDays) || 7;
  let multiplier = 1;
  if (days >= 28) multiplier = 4;
  else if (days >= 14) multiplier = 2;
  else multiplier = 1;

  const totalFee = baseFee * multiplier;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.points < totalFee) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Insufficient points. You need ${totalFee} points to feature your series for ${days} days (Your balance: ${user?.points || 0} points).`
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { points: { decrement: totalFee } },
    });

    await tx.pointTransaction.create({
      data: {
        userId,
        type: 'BUY_POINTS',
        amount: -totalFee,
        description: `Featured request fee (${days} days) for series: ${series.title}`,
      },
    });

    const requestNotes = `[Duration: ${days} Days | Cost: ${totalFee} Points] ${notes ? `- ${notes}` : ''}`;

    const request = await tx.featuredRequest.create({
      data: {
        seriesId,
        creatorId: userId,
        status: 'PENDING',
        notes: requestNotes,
      },
      include: {
        series: true,
      }
    });

    return { request, pointsLeft: updatedUser.points, totalFee, durationDays: days };
  });

  return result;
};

const getCreatorFeatureRequests = async (userId: string) => {
  return await prisma.featuredRequest.findMany({
    where: { creatorId: userId },
    include: {
      series: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getPublicChannel = async (channelIdOrUserId: string) => {
  const profile = await prisma.creatorProfile.findFirst({
    where: {
      OR: [{ id: channelIdOrUserId }, { userId: channelIdOrUserId }],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
          series: {
            where: { status: { not: 'DROPPED' } },
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
              type: true,
              status: true,
              rating: true,
              totalViews: true,
              _count: { select: { chapters: true, bookmarks: true } },
            },
          },
          creatorPosts: {
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          },
          createdPromoCodes: {
            where: { isActive: true },
            select: {
              id: true,
              code: true,
              pointsReward: true,
              discountPercent: true,
              expiresAt: true,
            },
          },
        },
      },
    },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Creator channel not found');
  }

  return profile;
};

const createCreatorPost = async (userId: string, payload: { title: string; content: string; imageUrl?: string; isPinned?: boolean }) => {
  if (!payload.title?.trim() || !payload.content?.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Title and content are required');
  }

  const result = await prisma.creatorPost.create({
    data: {
      creatorId: userId,
      title: payload.title.trim(),
      content: payload.content.trim(),
      imageUrl: payload.imageUrl || null,
      isPinned: !!payload.isPinned,
    },
  });

  return result;
};

const getCreatorPosts = async (creatorId: string) => {
  return await prisma.creatorPost.findMany({
    where: { creatorId },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  });
};

const deleteCreatorPost = async (id: string, userId: string) => {
  const post = await prisma.creatorPost.findUnique({ where: { id } });
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  if (post.creatorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own posts');
  }

  return await prisma.creatorPost.delete({ where: { id } });
};

const getSingleSeriesAnalytics = async (userId: string, seriesId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const isPlatformStaff = user?.role === 'admin' || user?.role === 'moderator';
  const seriesWhere = isPlatformStaff ? { id: seriesId } : { id: seriesId, creatorId: userId };

  const series = await prisma.series.findFirst({
    where: seriesWhere,
    include: {
      genres: true,
      creator: {
        select: { id: true, name: true, image: true },
      },
      chapters: {
        orderBy: { number: 'asc' },
        include: {
          _count: {
            select: {
              purchases: true,
              comments: true,
              history: true,
            },
          },
        },
      },
      _count: {
        select: {
          chapters: true,
          bookmarks: true,
          reviews: true,
        },
      },
    },
  });

  if (!series) {
    throw new AppError(httpStatus.NOT_FOUND, 'Series not found or access denied');
  }

  // Get chapter purchases for this specific series
  const chapterPurchases = await prisma.chapterPurchase.findMany({
    where: {
      chapter: {
        seriesId: series.id,
      },
    },
    select: {
      pointsSpent: true,
      chapterId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalEarnings = chapterPurchases.reduce((sum, p) => sum + p.pointsSpent, 0);

  // Chapter earnings & unlock counts breakdown map
  const chapterEarningsMap: Record<string, number> = {};
  const chapterPurchasesCountMap: Record<string, number> = {};
  chapterPurchases.forEach((p) => {
    chapterEarningsMap[p.chapterId] = (chapterEarningsMap[p.chapterId] || 0) + p.pointsSpent;
    chapterPurchasesCountMap[p.chapterId] = (chapterPurchasesCountMap[p.chapterId] || 0) + 1;
  });

  // 30 Days revenue chart
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentPurchases = chapterPurchases.filter(p => new Date(p.createdAt) >= thirtyDaysAgo);

  const dailyRevenue: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().split('T')[0]!;
    dailyRevenue[key] = 0;
  }
  recentPurchases.forEach(p => {
    const key = new Date(p.createdAt).toISOString().split('T')[0]!;
    if (dailyRevenue[key] !== undefined) {
      dailyRevenue[key] += p.pointsSpent;
    }
  });

  const revenueChart = Object.entries(dailyRevenue)
    .map(([date, points]) => ({ date, points }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Reviews summary
  const reviews = await prisma.review.findMany({
    where: { seriesId: series.id },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const views = series.totalViews || 0;
  const bookmarks = series._count.bookmarks || 0;
  const bookmarkRate = views > 0 ? Number(((bookmarks / views) * 100).toFixed(1)) : 0;
  const daysSinceUpdate = Math.floor((now.getTime() - new Date(series.updatedAt).getTime()) / (1000 * 60 * 60 * 24));

  // Diagnostics evaluation
  let attentionStatus: 'TRENDING' | 'STEADY' | 'NEEDS_ATTENTION' | 'NEW' = 'STEADY';
  const recommendations: string[] = [];

  if (series._count.chapters < 3) {
    attentionStatus = 'NEEDS_ATTENTION';
    recommendations.push(`Only ${series._count.chapters} chapter(s) uploaded. Readers typically look for 3–5 chapters before bookmarking or paying for coins.`);
  }

  if (daysSinceUpdate > 14 && series.status === 'ONGOING') {
    attentionStatus = 'NEEDS_ATTENTION';
    recommendations.push(`No new releases in ${daysSinceUpdate} days. Setting a weekly upload schedule increases reader retention by 45%.`);
  }

  if (views >= 100 && bookmarkRate >= 8) {
    attentionStatus = 'TRENDING';
    recommendations.push(`High save rate (${bookmarkRate}%)! This series has strong reader engagement. Consider requesting homepage featured placement to accelerate growth.`);
  }

  if (views < 20 && series._count.chapters >= 3) {
    attentionStatus = 'NEEDS_ATTENTION';
    recommendations.push(`Discovery is low despite having multiple chapters. Share promo codes with readers or request a homepage feature to increase impressions.`);
  }

  if (recommendations.length === 0) {
    recommendations.push(`Series metrics are steady and healthy. Keep up regular chapter releases!`);
  }

  const chaptersBreakdown = series.chapters.map((c) => ({
    id: c.id,
    number: c.number,
    title: c.title,
    isLocked: c.isLocked,
    coinCost: c.coinCost,
    createdAt: c.createdAt,
    unlocksCount: chapterPurchasesCountMap[c.id] || 0,
    earnings: chapterEarningsMap[c.id] || 0,
    commentsCount: c._count.comments,
    readersCount: c._count.history,
  }));

  return {
    series: {
      id: series.id,
      title: series.title,
      slug: series.slug,
      coverUrl: series.coverUrl,
      bgUrl: series.bgUrl,
      type: series.type,
      status: series.status,
      totalViews: views,
      rating: series.rating,
      genres: series.genres.map(g => g.name),
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
      creator: series.creator,
      chaptersCount: series._count.chapters,
      bookmarksCount: bookmarks,
      reviewsCount: series._count.reviews,
    },
    metrics: {
      totalViews: views,
      totalChapters: series._count.chapters,
      totalBookmarks: bookmarks,
      bookmarkRate,
      totalEarnings,
      daysSinceUpdate,
      attentionStatus,
      recommendations,
    },
    chapters: chaptersBreakdown,
    revenueChart,
    recentReviews: reviews,
  };
};

export const CreatorService = {
  getAllCreators,
  getProfile,
  updateProfile,
  getAnalytics,
  getSingleSeriesAnalytics,
  applyForSeries,
  requestFeatureSeries,
  getCreatorFeatureRequests,
  getPublicChannel,
  createCreatorPost,
  getCreatorPosts,
  deleteCreatorPost,
};
