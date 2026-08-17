import { prisma } from '../../../lib/prisma';
import { cacheService } from '../../utils/redis';
import { deleteFromCloudinary } from '../../utils/cloudinary';

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
  if (creatorId) where.creatorId = creatorId;
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
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  const total = await prisma.series.count({ where });

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
    data: result,
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
      { creator: { name: { contains: search, mode: 'insensitive' } } },
      { creator: { email: { contains: search, mode: 'insensitive' } } },
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
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: { chapters: true, reports: true, bookmarks: true },
        },
      },
    }),
    prisma.series.count({ where }),
  ]);

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
    data,
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
  return await prisma.series.findMany({
    where: { isPinned: true, isHidden: false },
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
  return await prisma.series.findMany({
    where: { discount: { not: null }, isHidden: false },
    include: {
      genres: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
};

const getSeriesBySlug = async (slug: string, userId?: string) => {
  const result = await prisma.series.findUnique({
    where: { slug },
    include: {
      genres: true,
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
          creatorProfile: {
            select: {
              id: true,
              channelName: true,
              profileImage: true,
              bannerUrl: true,
              description: true,
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

  let creator = result.creator;
  if (!creator) {
    creator = await prisma.user.findFirst({
      where: { role: { in: ['creator', 'admin'] } },
      select: {
        id: true,
        name: true,
        image: true,
        creatorProfile: {
          select: {
            id: true,
            channelName: true,
            profileImage: true,
            bannerUrl: true,
            description: true,
          },
        },
      },
    });
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
    const isCreator = result.creatorId === userId;
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
      chapters: {
        orderBy: { number: 'desc' },
      },
    },
  });
  return result;
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
  const { genres, ...seriesData } = data;
  
  const slug = await generateSlug(seriesData.title);

  const genreNames: string[] = Array.isArray(genres)
    ? genres.filter((g) => typeof g === 'string' && g.trim())
    : [];

  const result = await prisma.series.create({
    data: {
      ...seriesData,
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
    },
  });

  cacheService.delByPattern('cache:series:*').catch(() => null);

  return result;
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
    },
  });

  cacheService.delByPattern('cache:series:*').catch(() => null);

  return result;
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
};
