import { prisma } from '../../../lib/prisma';
import { cacheService } from '../../utils/redis';
import { deleteFromCloudinary } from '../../utils/cloudinary';

const formatCreator = (c: any) => {
  if (!c) return null;
  return {
    id: c.user?.id || c.userId || c.id,
    name: c.channelName || c.user?.name || 'Creator Studio',
    email: c.user?.email || null,
    image: c.profileImage || c.user?.image || null,
    channelId: c.id,
    channelName: c.channelName,
    profileImage: c.profileImage,
    bannerUrl: c.bannerUrl,
    description: c.description,
    creatorProfile: {
      id: c.id,
      channelName: c.channelName,
      profileImage: c.profileImage,
      bannerUrl: c.bannerUrl,
      description: c.description,
    },
    user: c.user || null,
  };
};

const getAllSeries = async (query: any) => {
  const { page = 1, limit = 10, type, status, genre, sort, isPinned, isDiscounted, creatorId, search, includeHidden } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (includeHidden !== 'true') {
    where.isHidden = false;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { altTitles: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (type) where.type = type.toUpperCase();
  if (status) where.status = status.toUpperCase();
  if (creatorId) {
    where.OR = [
      { creatorId },
      { creator: { userId: creatorId } },
    ];
  }
  if (isPinned !== undefined) where.isPinned = isPinned === 'true';
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

  const orderBy: any = {};
  if (sort === 'latest') orderBy.updatedAt = 'desc';
  else if (sort === 'popular') orderBy.totalViews = 'desc';
  else if (sort === 'rating') orderBy.rating = 'desc';
  else orderBy.createdAt = 'desc';

  const result = await prisma.series.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy,
    include: {
      genres: true,
      chapters: {
        take: 4,
        orderBy: { number: 'desc' },
      },
      creator: {
        select: {
          id: true,
          channelName: true,
          profileImage: true,
          bannerUrl: true,
          description: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          chapters: true,
          bookmarks: true,
        },
      },
    },
  });

  const total = await prisma.series.count({ where });

  const formattedData = result.map((item) => ({
    ...item,
    creator: formatCreator(item.creator),
  }));

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
    data: formattedData,
  };
};

const getAdminSeriesList = async (query: any) => {
  const { page = 1, limit = 20, search, status, type, isHidden, sort = 'latest' } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { altTitles: { contains: search, mode: 'insensitive' } },
      { creator: { channelName: { contains: search, mode: 'insensitive' } } },
      { creator: { user: { name: { contains: search, mode: 'insensitive' } } } },
      { creator: { user: { email: { contains: search, mode: 'insensitive' } } } },
    ];
  }
  if (status) where.status = status.toUpperCase();
  if (type) where.type = type.toUpperCase();
  if (isHidden !== undefined && isHidden !== 'all') {
    where.isHidden = isHidden === 'true';
  }

  const orderBy: any = {};
  if (sort === 'popular') orderBy.totalViews = 'desc';
  else if (sort === 'rating') orderBy.rating = 'desc';
  else if (sort === 'oldest') orderBy.createdAt = 'asc';
  else orderBy.updatedAt = 'desc';

  const [data, total] = await Promise.all([
    prisma.series.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy,
      include: {
        genres: true,
        featured: true,
        creator: {
          select: {
            id: true,
            channelName: true,
            profileImage: true,
            bannerUrl: true,
            description: true,
            userId: true,
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        _count: {
          select: { chapters: true, reports: true, bookmarks: true },
        },
      },
    }),
    prisma.series.count({ where }),
  ]);

  const formattedData = data.map((item) => ({
    ...item,
    creator: formatCreator(item.creator),
  }));

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
    data: formattedData,
  };
};

const toggleHideSeries = async (id: string, isHidden: boolean, hiddenReason?: string) => {
  const result = await prisma.series.update({
    where: { id },
    data: {
      isHidden,
      hiddenReason: isHidden ? (hiddenReason || 'Hidden by administration') : null,
    },
  });

  cacheService.delByPattern('cache:series:*').catch(() => null);

  return result;
};

const getPinnedSeries = async () => {
  const list = await prisma.series.findMany({
    where: { isPinned: true, isHidden: false },
    include: {
      genres: true,
      chapters: {
        take: 4,
        orderBy: { number: 'desc' },
      },
      creator: {
        select: {
          id: true,
          channelName: true,
          profileImage: true,
          userId: true,
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return list.map((s) => ({
    ...s,
    creator: formatCreator(s.creator),
  }));
};

const getDiscountedSeries = async () => {
  const list = await prisma.series.findMany({
    where: { discount: { not: null }, isHidden: false },
    include: {
      genres: true,
      creator: {
        select: {
          id: true,
          channelName: true,
          profileImage: true,
          userId: true,
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return list.map((s) => ({
    ...s,
    creator: formatCreator(s.creator),
  }));
};

const getSeriesBySlug = async (slug: string, userId?: string) => {
  const result = await prisma.series.findUnique({
    where: { slug },
    include: {
      genres: true,
      creator: {
        select: {
          id: true,
          channelName: true,
          profileImage: true,
          bannerUrl: true,
          description: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      chapters: {
        orderBy: { number: 'desc' },
      },
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  if (!result) return null;

  // Increment view count asynchronously
  prisma.series.update({
    where: { id: result.id },
    data: { totalViews: { increment: 1 } },
  }).catch(() => null);

  result.totalViews = (result.totalViews || 0) + 1;

  let creator = formatCreator(result.creator);
  if (!creator) {
    const defaultProfile = await prisma.creatorProfile.findFirst({
      select: {
        id: true,
        channelName: true,
        profileImage: true,
        bannerUrl: true,
        description: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    if (defaultProfile) {
      creator = formatCreator(defaultProfile);
    }
  }

  const isPremiumChaptersEnabled = async (): Promise<boolean> => {
    try {
      const config = await prisma.siteConfig.findUnique({
        where: { id: 'global' },
        select: { enablePremiumChapters: true },
      });
      return (config as any)?.enablePremiumChapters ?? true;
    } catch (e) {
      return true;
    }
  };

  const premiumEnabled = await isPremiumChaptersEnabled();

  let chaptersWithPurchaseStatus = result.chapters.map((c) => ({
    ...c,
    isLocked: premiumEnabled ? c.isLocked : false,
    coinCost: premiumEnabled ? c.coinCost : 0,
    isPurchased: !premiumEnabled || !c.isLocked,
  }));

  if (userId) {
    const isCreator = result.creator?.userId === userId;
    const [isBookmarked, userRating, purchases] = await Promise.all([
      prisma.bookmark.findUnique({
        where: {
          userId_seriesId: {
            userId,
            seriesId: result.id,
          },
        },
      }),
      prisma.review.findFirst({
        where: {
          userId,
          seriesId: result.id,
        },
      }),
      prisma.chapterPurchase.findMany({
        where: {
          userId,
          chapterId: { in: result.chapters.map((c) => c.id) },
        },
        select: { chapterId: true },
      }),
    ]);

    const purchasedSet = new Set(purchases.map((p) => p.chapterId));

    chaptersWithPurchaseStatus = result.chapters.map((c) => {
      const locked = premiumEnabled ? c.isLocked : false;
      return {
        ...c,
        isLocked: locked,
        coinCost: premiumEnabled ? c.coinCost : 0,
        isPurchased: !locked || isCreator || purchasedSet.has(c.id),
      };
    });

    return {
      ...result,
      creator,
      chapters: chaptersWithPurchaseStatus,
      isBookmarked: !!isBookmarked,
      userRating: userRating ? userRating.rating : null,
    };
  }

  return {
    ...result,
    creator,
    chapters: chaptersWithPurchaseStatus,
  };
};

const getSeriesById = async (id: string) => {
  const result = await prisma.series.findUnique({
    where: { id },
    include: {
      genres: true,
      creator: {
        select: {
          id: true,
          channelName: true,
          profileImage: true,
          bannerUrl: true,
          description: true,
          userId: true,
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
      chapters: {
        orderBy: { number: 'desc' },
      },
    },
  });
  if (!result) return null;
  return {
    ...result,
    creator: formatCreator(result.creator),
  };
};

const generateSlug = async (title: string): Promise<string> => {
  const clean = (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const baseSlug = clean || `series-${Date.now().toString(36)}`;
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.series.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

const createSeries = async (data: any) => {
  const { genres, creatorId, userId, ...seriesData } = data;
  
  let targetCreatorId = creatorId;
  const userIdentifier = userId || creatorId;

  if (userIdentifier) {
    // Check if it's already a CreatorProfile id
    const profileById = await prisma.creatorProfile.findUnique({
      where: { id: userIdentifier },
    });

    if (profileById) {
      targetCreatorId = profileById.id;
    } else {
      // Find or create CreatorProfile by userId
      let profile = await prisma.creatorProfile.findUnique({
        where: { userId: userIdentifier },
      });
      if (!profile) {
        const user = await prisma.user.findUnique({
          where: { id: userIdentifier },
          select: { name: true, image: true },
        });
        profile = await prisma.creatorProfile.create({
          data: {
            userId: userIdentifier,
            channelName: user?.name || 'Creator Studio',
            profileImage: user?.image || null,
          },
        });
      }
      targetCreatorId = profile.id;
    }
  }

  const slug = await generateSlug(seriesData.title);

  const genreNames: string[] = Array.isArray(genres)
    ? genres.filter((g) => typeof g === 'string' && g.trim())
    : [];

  const result = await prisma.series.create({
    data: {
      ...seriesData,
      creatorId: targetCreatorId,
      slug,
      genres: {
        connectOrCreate: genreNames.map((name) => ({
          where: { name: name.trim() },
          create: { name: name.trim() },
        })),
      },
    },
    include: {
      genres: true,
      creator: {
        select: {
          id: true,
          channelName: true,
          profileImage: true,
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
  });

  cacheService.delByPattern('cache:series:*').catch(() => null);

  return {
    ...result,
    creator: formatCreator(result.creator),
  };
};

const updateSeries = async (id: string, data: any) => {
  const { genres, ...seriesData } = data;

  const existing = await prisma.series.findUnique({
    where: { id },
    select: { coverUrl: true, bgUrl: true },
  });

  if (existing) {
    if (seriesData.coverUrl && existing.coverUrl && seriesData.coverUrl !== existing.coverUrl) {
      deleteFromCloudinary(existing.coverUrl).catch(() => null);
    }
    if (seriesData.bgUrl && existing.bgUrl && seriesData.bgUrl !== existing.bgUrl) {
      deleteFromCloudinary(existing.bgUrl).catch(() => null);
    }
  }

  const updatePayload: any = { ...seriesData };

  if (genres !== undefined && Array.isArray(genres)) {
    const genreNames: string[] = genres
      .filter((g) => typeof g === 'string' && g.trim())
      .map((g) => g.trim());

    // Ensure all genres exist in the database
    await Promise.all(
      genreNames.map((name) =>
        prisma.genre.upsert({
          where: { name },
          create: { name },
          update: {},
        })
      )
    );

    const dbGenres = await prisma.genre.findMany({
      where: { name: { in: genreNames } },
      select: { id: true },
    });

    updatePayload.genres = {
      set: dbGenres.map((g) => ({ id: g.id })),
    };
  }

  const result = await prisma.series.update({
    where: { id },
    data: updatePayload,
    include: {
      genres: true,
      creator: {
        select: {
          id: true,
          channelName: true,
          profileImage: true,
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
  });

  cacheService.delByPattern('cache:series:*').catch(() => null);

  return {
    ...result,
    creator: formatCreator(result.creator),
  };
};

const deleteSeries = async (id: string) => {
  const existing = await prisma.series.findUnique({
    where: { id },
    include: {
      chapters: {
        include: { images: true },
      },
    },
  });

  if (existing) {
    if (existing.coverUrl) deleteFromCloudinary(existing.coverUrl).catch(() => null);
    if (existing.bgUrl) deleteFromCloudinary(existing.bgUrl).catch(() => null);
    for (const ch of existing.chapters) {
      for (const img of ch.images) {
        deleteFromCloudinary(img.url).catch(() => null);
      }
    }
  }

  const result = await prisma.series.delete({
    where: { id },
  });

  cacheService.delByPattern('cache:series:*').catch(() => null);

  return result;
};

const toggleFeatured = async (seriesId: string) => {
  const existing = await prisma.featuredSeries.findUnique({
    where: { seriesId },
  });

  let result;
  if (existing) {
    await prisma.featuredSeries.delete({
      where: { seriesId },
    });
    result = { featured: false };
  } else {
    await prisma.featuredSeries.create({
      data: { seriesId },
    });
    result = { featured: true };
  }

  cacheService.delByPattern('cache:series:*').catch(() => null);

  return result;
};

const getFeaturedSeries = async () => {
  return await prisma.featuredSeries.findMany({
    where: { series: { isHidden: false } },
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

const getTop50Series = async (period: 'today' | 'weekly' | 'monthly' = 'today') => {
  const now = new Date();
  let startDate: Date;

  if (period === 'today') {
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (period === 'weekly') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // 1. Group read events in the given timeframe
  const readEvents = await prisma.chapterReadEvent.groupBy({
    by: ['seriesId'],
    where: {
      createdAt: { gte: startDate },
      series: { isHidden: false },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 50,
  });

  const periodViewMap: Record<string, number> = {};
  readEvents.forEach((item) => {
    if (item.seriesId) {
      periodViewMap[item.seriesId] = item._count.id;
    }
  });

  // 2. Fetch series details
  const seriesList = await prisma.series.findMany({
    where: { isHidden: false },
    include: {
      genres: true,
      chapters: {
        take: 1,
        orderBy: { number: 'desc' },
        select: { id: true, number: true, title: true, createdAt: true },
      },
      creator: {
        select: {
          id: true,
          channelName: true,
          profileImage: true,
          user: { select: { id: true, name: true, image: true } },
        },
      },
      _count: {
        select: {
          chapters: true,
          bookmarks: true,
        },
      },
    },
  });

  // 3. Sort by period views, fallback to totalViews
  const ranked = seriesList
    .map((s) => {
      const periodViews = periodViewMap[s.id] || 0;
      return {
        ...s,
        periodViews,
        creator: formatCreator(s.creator),
      };
    })
    .sort((a, b) => {
      if (b.periodViews !== a.periodViews) {
        return b.periodViews - a.periodViews;
      }
      return (b.totalViews || 0) - (a.totalViews || 0);
    })
    .slice(0, 50)
    .map((s, idx) => ({
      ...s,
      rank: idx + 1,
    }));

  return ranked;
};

export const SeriesService = {
  getAllSeries,
  getAdminSeriesList,
  toggleHideSeries,
  getSeriesBySlug,
  getPinnedSeries,
  getDiscountedSeries,
  createSeries,
  updateSeries,
  deleteSeries,
  toggleFeatured,
  getFeaturedSeries,
  getSeriesById,
  getTop50Series,
};
