import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import { deleteFromCloudinary } from '../../utils/cloudinary';

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

const getChapterByNumber = async (seriesSlug: string, number: number, userId?: string) => {
  const series = await prisma.series.findUnique({
    where: { slug: seriesSlug },
    select: { id: true }
  });

  if (!series) return null;

  const [result, premiumEnabled] = await Promise.all([
    prisma.chapter.findFirst({
      where: { 
        seriesId: series.id,
        number: Number(number)
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        series: {
          select: {
            title: true,
            slug: true,
            coverUrl: true,
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
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    isPremiumChaptersEnabled(),
  ]);
  
  if (!result) return null;

  // If premium chapters are disabled globally by admin, all chapters are unlocked & free
  const effectivelyLocked = premiumEnabled ? result.isLocked : false;

  // Check if the authenticated user already purchased this chapter
  let isPurchased = !effectivelyLocked;
  if (userId && effectivelyLocked) {
    const purchase = await prisma.chapterPurchase.findUnique({
      where: { userId_chapterId: { userId, chapterId: result.id } },
    });
    isPurchased = !!purchase;
  }

  // Find prev and next chapters
  const prevChapter = await prisma.chapter.findFirst({
    where: {
      seriesId: result.seriesId,
      number: { lt: result.number },
    },
    orderBy: { number: 'desc' },
  });

  const nextChapter = await prisma.chapter.findFirst({
    where: {
      seriesId: result.seriesId,
      number: { gt: result.number },
    },
    orderBy: { number: 'asc' },
  });

  let chapterSeries = result.series;
  if (chapterSeries && !(chapterSeries as any).creator) {
    const defaultCreator = await prisma.user.findFirst({
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
            description: true,
          },
        },
      },
    });
    chapterSeries = {
      ...chapterSeries,
      creator: defaultCreator,
    } as any;
  }

  return {
    ...result,
    isLocked: effectivelyLocked,
    coinCost: effectivelyLocked ? result.coinCost : 0,
    series: chapterSeries,
    images: (effectivelyLocked && !isPurchased) ? [] : result.images,
    isPurchased: !effectivelyLocked || isPurchased,
    prevChapterNumber: prevChapter?.number || null,
    nextChapterNumber: nextChapter?.number || null,
  };
};

const getAllChapters = async (query: any) => {
  const { page = 1, limit = 10, seriesId, creatorId } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (seriesId) where.seriesId = seriesId;
  if (creatorId) where.series = { creatorId };

  const result = await prisma.chapter.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
    include: {
      series: {
        select: { title: true },
      },
    },
  });

  const total = await prisma.chapter.count({ where });

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
    data: result,
  };
};

const getChapterById = async (id: string, userId?: string) => {
  const [result, premiumEnabled] = await Promise.all([
    prisma.chapter.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        series: {
          select: { title: true, slug: true },
        },
      },
    }),
    isPremiumChaptersEnabled(),
  ]);
  
  if (!result) return null;

  const effectivelyLocked = premiumEnabled ? result.isLocked : false;

  // Check if the authenticated user already purchased this chapter
  let isPurchased = !effectivelyLocked;
  if (userId && effectivelyLocked) {
    const purchase = await prisma.chapterPurchase.findUnique({
      where: { userId_chapterId: { userId, chapterId: id } },
    });
    isPurchased = !!purchase;
  }

  // Find prev and next chapters
  const prevChapter = await prisma.chapter.findFirst({
    where: {
      seriesId: result.seriesId,
      number: { lt: result.number },
    },
    orderBy: { number: 'desc' },
  });

  const nextChapter = await prisma.chapter.findFirst({
    where: {
      seriesId: result.seriesId,
      number: { gt: result.number },
    },
    orderBy: { number: 'asc' },
  });

  return {
    ...result,
    isLocked: effectivelyLocked,
    coinCost: effectivelyLocked ? result.coinCost : 0,
    images: (effectivelyLocked && !isPurchased) ? [] : result.images,
    isPurchased: !effectivelyLocked || isPurchased,
    prevChapterNumber: prevChapter?.number || null,
    nextChapterNumber: nextChapter?.number || null,
  };
};

const createChapter = async (data: any, userId?: string, role?: string) => {
  const { images = [], ...chapterData } = data;

  if (role === 'creator') {
    const series = await prisma.series.findUnique({
      where: { id: chapterData.seriesId },
      select: { creatorId: true },
    });
    if (!series || series.creatorId !== userId) {
      throw new AppError(httpStatus.FORBIDDEN, 'You can only add chapters to your own series');
    }
  }

  const result = await prisma.chapter.create({
    data: {
      ...chapterData,
      images: {
        create: (images || []).map((img: { url: string; order: number }) => ({
          url: img.url,
          order: img.order,
        })),
      },
    },
  });
  return result;
};

const updateChapter = async (id: string, data: any, userId?: string, role?: string) => {
  const { images, ...chapterData } = data;

  const existing = await prisma.chapter.findUnique({
    where: { id },
    include: {
      series: { select: { creatorId: true } },
      images: true,
    },
  });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chapter not found');
  }

  if (role === 'creator' && existing.series.creatorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only edit chapters of your own series');
  }

  // Delete replaced or removed images from Cloudinary
  if (images && Array.isArray(images)) {
    const newUrls = new Set(images.map((img: any) => img.url));
    const oldImagesToDelete = existing.images.filter((img) => !newUrls.has(img.url));
    for (const oldImg of oldImagesToDelete) {
      deleteFromCloudinary(oldImg.url).catch(() => null);
    }
  }

  const result = await prisma.chapter.update({
    where: { id },
    data: {
      ...chapterData,
      ...(images && {
        images: {
          deleteMany: {},
          create: images.map((img: { url: string; order: number }) => ({
            url: img.url,
            order: img.order,
          })),
        },
      }),
    },
  });
  return result;
};

const deleteChapter = async (id: string, userId?: string, role?: string) => {
  const existing = await prisma.chapter.findUnique({
    where: { id },
    include: {
      series: { select: { creatorId: true } },
      images: true,
    },
  });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chapter not found');
  }

  if (role === 'creator' && existing.series.creatorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete chapters of your own series');
  }

  // Delete all chapter images from Cloudinary
  if (existing.images && existing.images.length > 0) {
    for (const img of existing.images) {
      deleteFromCloudinary(img.url).catch(() => null);
    }
  }

  return await prisma.chapter.delete({
    where: { id },
  });
};

export const ChapterService = {
  getChapterById,
  getChapterByNumber,
  getAllChapters,
  createChapter,
  updateChapter,
  deleteChapter,
};
