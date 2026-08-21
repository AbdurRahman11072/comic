import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

// ─── Comments ───────────────────────────────────────────────────────────────

const getComments = async (chapterId: string, query: any) => {
  const { page = 1, limit = 20 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    prisma.comment.findMany({
      where: { chapterId },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    }),
    prisma.comment.count({ where: { chapterId } }),
  ]);

  return {
    meta: { total, page: Number(page), limit: Number(limit) },
    data,
  };
};

const createComment = async (userId: string, payload: any) => {
  const { chapterId, content } = payload;

  if (!chapterId || !content?.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chapter ID and content are required');
  }

  const result = await prisma.comment.create({
    data: { userId, chapterId, content: content.trim() },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  return result;
};

const deleteComment = async (commentId: string, userId: string, role: string) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');

  // Only the author, moderators, or admins can delete
  if (comment.userId !== userId && role !== 'moderator' && role !== 'admin') {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own comments');
  }

  await prisma.comment.delete({ where: { id: commentId } });
};

// ─── Reviews ────────────────────────────────────────────────────────────────

const getReviews = async (seriesId: string, query: any) => {
  const { page = 1, limit = 20 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where: { seriesId },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    }),
    prisma.review.count({ where: { seriesId } }),
  ]);

  return {
    meta: { total, page: Number(page), limit: Number(limit) },
    data,
  };
};

const createReview = async (userId: string, payload: any) => {
  const { seriesId, rating, content } = payload;

  if (!seriesId || !rating || rating < 1 || rating > 5) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Series ID and a rating between 1-5 are required');
  }

  // Check if the user has already reviewed this series
  const existing = await prisma.review.findFirst({
    where: { userId, seriesId },
  });

  if (existing) {
    // Update existing review instead of creating a duplicate
    const result = await prisma.review.update({
      where: { id: existing.id },
      data: { rating: Number(rating), content: content?.trim() || null },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Recalculate average rating for the series
    await recalculateSeriesRating(seriesId);
    return result;
  }

  const result = await prisma.review.create({
    data: {
      userId,
      seriesId,
      rating: Number(rating),
      content: content?.trim() || null,
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  await recalculateSeriesRating(seriesId);
  return result;
};

const deleteReview = async (reviewId: string, userId: string, role: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(httpStatus.NOT_FOUND, 'Review not found');

  if (review.userId !== userId && role !== 'moderator' && role !== 'admin') {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own reviews');
  }

  const seriesId = review.seriesId;
  await prisma.review.delete({ where: { id: reviewId } });
  await recalculateSeriesRating(seriesId);
};

const recalculateSeriesRating = async (seriesId: string) => {
  const agg = await prisma.review.aggregate({
    where: { seriesId },
    _avg: { rating: true },
  });

  await prisma.series.update({
    where: { id: seriesId },
    data: { rating: agg._avg.rating || 0 },
  });
};

// ─── Reports ────────────────────────────────────────────────────────────────

const createReport = async (userId: string, payload: any) => {
  const { reason, targetType, targetId } = payload;

  if (!reason || !targetType || !targetId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reason, targetType, and targetId are required');
  }

  const validTypes = ['series', 'chapter', 'comment', 'review', 'user'];
  if (!validTypes.includes(targetType)) {
    throw new AppError(httpStatus.BAD_REQUEST, `targetType must be one of: ${validTypes.join(', ')}`);
  }

  const result = await prisma.report.create({
    data: {
      reporterId: userId,
      reason,
      targetType,
      targetId,
      status: 'PENDING',
    },
  });

  return result;
};

const getReports = async (query: any) => {
  const { page = 1, limit = 20, status } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status.toUpperCase();

  const [data, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    }),
    prisma.report.count({ where }),
  ]);

  return {
    meta: { total, page: Number(page), limit: Number(limit) },
    data,
  };
};

const resolveReport = async (reportId: string, payload: any) => {
  const { status } = payload;

  if (!['RESOLVED', 'DISMISSED'].includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Status must be RESOLVED or DISMISSED');
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError(httpStatus.NOT_FOUND, 'Report not found');

  if (report.status !== 'PENDING') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Report has already been processed');
  }

  const result = await prisma.report.update({
    where: { id: reportId },
    data: { status },
  });

  return result;
};

// ─── Chat Room ──────────────────────────────────────────────────────────────
const getChatMessages = async () => {
  const result = await prisma.chatMessage.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' }, // Get the newest 50 first
    include: {
      user: {
        select: { id: true, name: true, image: true, role: true }
      }
    }
  });

  // Return in chronological order for chat view
  return result.reverse();
};

const createChatMessage = async (userId: string, content?: string, imageUrl?: string) => {
  if ((!content || !content.trim()) && !imageUrl) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Message content or image is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mutedUntil: true },
  });

  if (user?.mutedUntil && new Date(user.mutedUntil) > new Date()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `You are temporarily muted in chat until ${new Date(user.mutedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    );
  }

  const result = await prisma.chatMessage.create({
    data: {
      userId,
      content: content ? content.trim() : '',
      imageUrl: imageUrl || null,
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, role: true }
      }
    }
  });

  return result;
};

const deleteChatMessage = async (messageId: string, userId?: string, role?: string) => {
  const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!message) throw new AppError(httpStatus.NOT_FOUND, 'Message not found');

  if (role !== 'admin' && role !== 'moderator' && message.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own chat messages');
  }

  await prisma.chatMessage.delete({ where: { id: messageId } });
};

export const CommunityService = {
  getComments,
  createComment,
  deleteComment,
  getReviews,
  createReview,
  deleteReview,
  createReport,
  getReports,
  resolveReport,
  getChatMessages,
  createChatMessage,
  deleteChatMessage
};
