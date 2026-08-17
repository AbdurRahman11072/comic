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
  const series = await prisma.series.findMany({
    where: { creatorId: userId },
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      totalViews: true,
      rating: true,
      createdAt: true,
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

  const totalViews = series.reduce((sum, s) => sum + s.totalViews, 0);
  const totalChapters = series.reduce((sum, s) => sum + s._count.chapters, 0);
  const totalBookmarks = series.reduce((sum, s) => sum + s._count.bookmarks, 0);
  const totalReviews = series.reduce((sum, s) => sum + s._count.reviews, 0);

  const chapterPurchases = await prisma.chapterPurchase.findMany({
    where: {
      chapter: {
        series: {
          creatorId: userId,
        },
      },
    },
    select: {
      pointsSpent: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
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

  return {
    overview: {
      totalSeries: series.length,
      totalChapters,
      totalViews,
      totalBookmarks,
      totalReviews,
      totalRevenue,
    },
    series,
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

export const CreatorService = {
  getAllCreators,
  getProfile,
  updateProfile,
  getAnalytics,
  applyForSeries,
  requestFeatureSeries,
  getCreatorFeatureRequests,
  getPublicChannel,
  createCreatorPost,
  getCreatorPosts,
  deleteCreatorPost,
};
