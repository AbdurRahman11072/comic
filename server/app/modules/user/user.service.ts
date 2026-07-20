import { prisma } from '../../../lib/prisma';

const getProfile = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bookmarks: {
        include: { series: true },
      },
      history: {
        include: { series: true, chapter: true },
        orderBy: { updatedAt: 'desc' },
      },
      pointTransactions: {
        orderBy: { createdAt: 'desc' },
      },
      chapterPurchases: {
        include: { chapter: { include: { series: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  return result;
};

const toggleBookmark = async (userId: string, seriesId: string) => {
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_seriesId: { userId, seriesId },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id },
    });
    return { isBookmarked: false };
  } else {
    await prisma.bookmark.create({
      data: { userId, seriesId },
    });
    return { isBookmarked: true };
  }
};

const updateHistory = async (userId: string, seriesId: string, chapterId: string) => {
  const result = await prisma.history.upsert({
    where: {
      userId_seriesId: { userId, seriesId },
    },
    update: { chapterId },
    create: { userId, seriesId, chapterId },
  });
  return result;
};

const getAllUsers = async (query: any) => {
  const { page = 1, limit = 10, searchTerm } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  const result = await prisma.user.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.user.count({ where });

  return {
    meta: { total, page: Number(page), limit: Number(limit) },
    data: result,
  };
};

const updateUser = async (id: string, data: any) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
  });
};

const getAllTransactions = async (query: any) => {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const result = await prisma.pointTransaction.findMany({
    skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const total = await prisma.pointTransaction.count();

  return {
    meta: { total, page: Number(page), limit: Number(limit) },
    data: result,
  };
};

export const UserService = {
  getProfile,
  toggleBookmark,
  updateHistory,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllTransactions,
};
