import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';

const getChapterByNumber = async (seriesSlug: string, number: number, userId?: string) => {
  const series = await prisma.series.findUnique({
    where: { slug: seriesSlug },
    select: { id: true }
  });

  if (!series) return null;

  const result = await prisma.chapter.findFirst({
    where: { 
      seriesId: series.id,
      number: Number(number)
    },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
      series: {
        select: { title: true, slug: true },
      },
    },
  });
  
  if (!result) return null;

  // Check if the authenticated user already purchased this chapter
  let isPurchased = false;
  if (userId && result.isLocked) {
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

  return {
    ...result,
    images: (result.isLocked && !isPurchased) ? [] : result.images,
    isPurchased,
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
  const result = await prisma.chapter.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
      series: {
        select: { title: true, slug: true },
      },
    },
  });
  
  if (!result) return null;

  // Check if the authenticated user already purchased this chapter
  let isPurchased = false;
  if (userId && result.isLocked) {
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
    images: (result.isLocked && !isPurchased) ? [] : result.images,
    isPurchased,
    prevChapterNumber: prevChapter?.number || null,
    nextChapterNumber: nextChapter?.number || null,
  };
};

const createChapter = async (data: any) => {
  const { images = [], ...chapterData } = data;

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

const updateChapter = async (id: string, data: any) => {
  const { images, ...chapterData } = data;

  const existing = await prisma.chapter.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chapter not found');
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

const deleteChapter = async (id: string) => {
  const existing = await prisma.chapter.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chapter not found');
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
