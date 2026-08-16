import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { prisma } from '../../../lib/prisma';

const getDatabaseStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    usersCount,
    seriesCount,
    chaptersCount,
    commentsCount,
    transactionsCount,
    reportsCount,
    promosCount,
    auditLogsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.series.count(),
    prisma.chapter.count(),
    prisma.comment.count(),
    prisma.pointTransaction.count(),
    prisma.report.count(),
    prisma.promoCode.count(),
    prisma.auditLog.count(),
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Database backup stats retrieved',
    data: {
      usersCount,
      seriesCount,
      chaptersCount,
      commentsCount,
      transactionsCount,
      reportsCount,
      promosCount,
      auditLogsCount,
      timestamp: new Date().toISOString(),
    },
  });
});

const exportDatabaseDump = asyncHandler(async (req: Request, res: Response) => {
  // Collect full data snapshots across tables
  const [
    siteConfig,
    users,
    genres,
    series,
    chapters,
    promos,
    promoRedemptions,
    pointTransactions,
    reports,
    creatorPosts,
    auditLogs,
  ] = await Promise.all([
    prisma.siteConfig.findMany(),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        createdAt: true,
        creatorProfile: true,
      },
    }),
    prisma.genre.findMany(),
    prisma.series.findMany({
      include: {
        genres: true,
      },
    }),
    prisma.chapter.findMany({
      select: {
        id: true,
        seriesId: true,
        number: true,
        title: true,
        coinCost: true,
        isFastPass: true,
        publishAt: true,
        createdAt: true,
      },
    }),
    prisma.promoCode.findMany(),
    prisma.promoCodeRedemption.findMany(),
    prisma.pointTransaction.findMany({
      take: 5000,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.report.findMany({
      take: 1000,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.creatorPost.findMany(),
    prisma.auditLog.findMany({
      take: 2000,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const backupData = {
    metadata: {
      version: '1.0',
      appName: 'Comic Platform',
      exportedAt: new Date().toISOString(),
      exportedBy: req.user?.email || 'admin',
    },
    tables: {
      siteConfig,
      users,
      genres,
      series,
      chapters,
      promos,
      promoRedemptions,
      pointTransactions,
      reports,
      creatorPosts,
      auditLogs,
    },
  };

  // Record an audit log for this backup
  if (req.user?.id) {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'DATABASE_BACKUP_EXPORTED',
          targetType: 'SYSTEM',
          targetId: 'database',
          details: { count: series.length },
        },
      });
    } catch (e) {
      // ignore
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=comic_backup_${new Date().toISOString().slice(0, 10)}.json`
  );
  return res.status(httpStatus.OK).json(backupData);
});

export const BackupController = {
  getDatabaseStats,
  exportDatabaseDump,
};
