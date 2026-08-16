import { prisma } from '../../../lib/prisma';

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
  return await prisma.series.update({
    where: { id },
    data: {
      isHidden,
      hiddenReason: isHidden ? (hiddenReason || 'Hidden by administration') : null,
    },
  });
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
      chapters: {
        orderBy: { number: 'desc' },
      },
      _count: {
        select: { bookmarks: true }
      }
    },
  });

  if (!result) return null;

  if (userId) {
    const isBookmarked = await prisma.bookmark.findUnique({
      where: {
        userId_seriesId: {
          userId,
          seriesId: result.id,
        },
      },
    });

    const userRating = await prisma.review.findFirst({
      where: {
        userId,
        seriesId: result.id,
      },
    });

    return {
      ...result,
      isBookmarked: !!isBookmarked,
      userRating: userRating ? userRating.rating : null,
    };
  }

  return result;
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

const createSeries = async (data: any) => {
  const { genres, ...seriesData } = data;
  
  const result = await prisma.series.create({
    data: {
      ...seriesData,
      genres: {
        connect: genres?.map((id: string) => ({ id })) || [],
      },
    },
    include: {
      genres: true,
    },
  });

  return result;
};

const updateSeries = async (id: string, data: any) => {
  const { genres, ...seriesData } = data;

  const updatePayload: any = { ...seriesData };

  if (genres) {
    updatePayload.genres = {
      set: genres.map((id: string) => ({ id })),
    };
  }

  const result = await prisma.series.update({
    where: { id },
    data: updatePayload,
    include: {
      genres: true,
    },
  });

  return result;
};

const deleteSeries = async (id: string) => {
  return await prisma.series.delete({
    where: { id },
  });
};

const toggleFeatured = async (seriesId: string) => {
  const existing = await prisma.featuredSeries.findUnique({
    where: { seriesId },
  });

  if (existing) {
    await prisma.featuredSeries.delete({
      where: { seriesId },
    });
    return { featured: false };
  } else {
    await prisma.featuredSeries.create({
      data: { seriesId },
    });
    return { featured: true };
  }
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
