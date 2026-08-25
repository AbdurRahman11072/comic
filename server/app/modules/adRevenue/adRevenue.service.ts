import httpStatus from 'http-status';
import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import { DistributionStatus, QualityTier } from '../../../../server/generated/prisma';

interface TrackReadEventPayload {
  sessionId: string;
  seriesId: string;
  chapterId: string;
  durationSeconds: number;
  pagesViewed: number;
  totalPages: number;
  completionPercent: number;
  scrollDepthPercent?: number;
  interactionCount?: number;
  isExitBeacon?: boolean;
}

/**
 * Evaluates single-session bot-detection heuristics based on session interaction telemetry.
 */
export function evaluateBotDetection(payload: TrackReadEventPayload): {
  isBotLikely: boolean;
  botReason: string | null;
} {
  const {
    durationSeconds,
    pagesViewed,
    completionPercent,
    scrollDepthPercent = 0,
    interactionCount = 0,
  } = payload;

  // 1. INSTANT_BOUNCE: Scrolled/read 3+ pages or 50%+ of the chapter in under 3 seconds
  if (durationSeconds < 3 && (pagesViewed >= 3 || completionPercent >= 50)) {
    return {
      isBotLikely: true,
      botReason: 'INSTANT_BOUNCE',
    };
  }

  // 2. IMPOSSIBLE_SPEED: Reading speed faster than 500ms per page for 5+ pages
  if (durationSeconds > 0 && pagesViewed >= 5 && durationSeconds / pagesViewed < 0.5) {
    return {
      isBotLikely: true,
      botReason: 'IMPOSSIBLE_SPEED',
    };
  }

  // 3. NO_INTERACTION: Session open for 30s+ with 0 interactions and 0 scroll depth
  if (durationSeconds >= 30 && interactionCount === 0 && scrollDepthPercent === 0) {
    return {
      isBotLikely: true,
      botReason: 'NO_INTERACTION',
    };
  }

  return {
    isBotLikely: false,
    botReason: null,
  };
}

/**
 * Checks for multi-session IP farming by inspecting recent activity from the same client IP.
 * Thresholds:
 * - >= 8 concurrent/distinct sessions from the same IP in the last 10 minutes
 * - OR >= 25 total read events from the same IP in the last 10 minutes
 */
export async function checkHighFrequencyIp(
  clientIp: string | null | undefined,
  currentSessionId: string
): Promise<{ isHighFrequency: boolean; reason: string | null }> {
  if (!clientIp) return { isHighFrequency: false, reason: null };

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const [distinctSessions, totalEventsCount] = await Promise.all([
    prisma.chapterReadEvent.findMany({
      where: {
        clientIp,
        createdAt: { gte: tenMinutesAgo },
        sessionId: { not: currentSessionId },
      },
      distinct: ['sessionId'],
      select: { sessionId: true },
    }),
    prisma.chapterReadEvent.count({
      where: {
        clientIp,
        createdAt: { gte: tenMinutesAgo },
      },
    }),
  ]);

  if (distinctSessions.length >= 8 || totalEventsCount >= 25) {
    return {
      isHighFrequency: true,
      reason: 'HIGH_FREQUENCY_IP',
    };
  }

  return { isHighFrequency: false, reason: null };
}

/**
 * Computes Quality Tier and Quality Score based on duration, completion, and authentication.
 */
export function calculateQualityScore(
  durationSeconds: number,
  pagesViewed: number,
  completionPercent: number,
  isAuthenticated: boolean,
  isBotLikely: boolean
): { qualityTier: QualityTier; qualityScore: number } {
  // Disqualify bots and anonymous/guest reads from payout score
  if (isBotLikely || !isAuthenticated) {
    return {
      qualityTier: QualityTier.BOUNCED,
      qualityScore: 0.0,
    };
  }

  // Tier 3: COMPLETED (80%+ progress and at least 45 seconds active reading)
  if (completionPercent >= 80 && durationSeconds >= 45) {
    return {
      qualityTier: QualityTier.COMPLETED,
      qualityScore: 4.0,
    };
  }

  // Tier 2: ENGAGED (50%+ progress and at least 60 seconds active reading)
  if (completionPercent >= 50 && durationSeconds >= 60) {
    return {
      qualityTier: QualityTier.ENGAGED,
      qualityScore: 2.5,
    };
  }

  // Tier 1: QUALIFIED (At least 30s active reading AND at least 3 pages or 25% progress)
  if (durationSeconds >= 30 && (pagesViewed >= 3 || completionPercent >= 25)) {
    return {
      qualityTier: QualityTier.QUALIFIED,
      qualityScore: 1.0,
    };
  }

  // Tier 0: BOUNCED (< 30s or insufficient progress)
  return {
    qualityTier: QualityTier.BOUNCED,
    qualityScore: 0.0,
  };
}

/**
 * Ingests/updates a reading session event in place (1 row per sessionId + chapterId).
 */
const trackReadEvent = async (
  payload: TrackReadEventPayload,
  userId?: string | null,
  clientIp?: string,
  userAgent?: string
) => {
  const {
    sessionId,
    seriesId,
    chapterId,
    durationSeconds,
    pagesViewed,
    totalPages,
    completionPercent,
    scrollDepthPercent = 0,
    interactionCount = 0,
  } = payload;

  // Resolve creatorId from Chapter -> Series
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: {
      id: true,
      seriesId: true,
      series: {
        select: { creatorId: true },
      },
    },
  });

  if (!chapter) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chapter not found');
  }

  const creatorId = chapter.series?.creatorId || null;

  // Check existing session for in-place upsert
  const existingEvent = await prisma.chapterReadEvent.findUnique({
    where: {
      sessionId_chapterId: {
        sessionId,
        chapterId,
      },
    },
  });

  const effectiveDuration = Math.max(existingEvent?.durationSeconds ?? 0, durationSeconds);
  const effectivePagesViewed = Math.max(existingEvent?.pagesViewed ?? 0, pagesViewed);
  const effectiveCompletionPercent = Math.max(
    existingEvent?.completionPercent ?? 0,
    completionPercent
  );
  const effectiveScrollDepth = Math.max(
    existingEvent?.scrollDepthPercent ?? 0,
    scrollDepthPercent
  );
  const effectiveInteractions = Math.max(
    existingEvent?.interactionCount ?? 0,
    interactionCount
  );
  const effectiveUserId = userId || existingEvent?.userId || null;

  // 1. Run single-session bot heuristics on accumulated session telemetry
  const singleBotResult = evaluateBotDetection({
    ...payload,
    durationSeconds: effectiveDuration,
    pagesViewed: effectivePagesViewed,
    completionPercent: effectiveCompletionPercent,
    scrollDepthPercent: effectiveScrollDepth,
    interactionCount: effectiveInteractions,
  });

  // 2. Run multi-session IP farming check
  const ipBotResult = await checkHighFrequencyIp(clientIp, sessionId);

  const isBot = singleBotResult.isBotLikely || ipBotResult.isHighFrequency;

  const botReason =
    singleBotResult.botReason ||
    ipBotResult.reason ||
    null;

  // Calculate quality classification
  const { qualityTier, qualityScore } = calculateQualityScore(
    effectiveDuration,
    effectivePagesViewed,
    effectiveCompletionPercent,
    Boolean(effectiveUserId),
    isBot
  );

  const event = await prisma.chapterReadEvent.upsert({
    where: {
      sessionId_chapterId: {
        sessionId,
        chapterId,
      },
    },
    create: {
      sessionId,
      chapterId,
      seriesId: chapter.seriesId,
      creatorId,
      userId: effectiveUserId,
      startedAt: new Date(),
      endedAt: new Date(),
      durationSeconds: effectiveDuration,
      pagesViewed: effectivePagesViewed,
      totalPages: Math.max(totalPages, 1),
      completionPercent: effectiveCompletionPercent,
      scrollDepthPercent: effectiveScrollDepth,
      interactionCount: effectiveInteractions,
      qualityTier,
      qualityScore,
      isBotLikely: isBot,
      botReason,
      clientIp: clientIp || null,
      userAgent: userAgent || null,
    },
    update: {
      userId: effectiveUserId,
      endedAt: new Date(),
      durationSeconds: effectiveDuration,
      pagesViewed: effectivePagesViewed,
      totalPages: Math.max(totalPages, 1),
      completionPercent: effectiveCompletionPercent,
      scrollDepthPercent: effectiveScrollDepth,
      interactionCount: effectiveInteractions,
      qualityTier,
      qualityScore,
      isBotLikely: isBot,
      botReason,
      clientIp: clientIp || undefined,
      userAgent: userAgent || undefined,
    },
  });

  return event;
};

/**
 * Generates an aggregated dry-run preview of creator quality scores and points distribution.
 */
const getDistributionPreview = async (
  periodStart: Date,
  periodEnd: Date,
  amount: number,
  currency: 'USD' | 'POINTS' = 'USD'
) => {
  // 1. Validation checks
  const now = new Date();
  if (periodEnd > now) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Period end date cannot be in the future.'
    );
  }
  if (periodEnd <= periodStart) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Period end date must be after period start date.'
    );
  }

  // 2. Overlap detection against COMPLETED runs
  const overlappingRun = await prisma.revenueDistributionRun.findFirst({
    where: {
      status: DistributionStatus.COMPLETED,
      periodStart: { lte: periodEnd },
      periodEnd: { gte: periodStart },
    },
    select: {
      id: true,
      periodStart: true,
      periodEnd: true,
      grossAmountEntered: true,
      currency: true,
    },
  });

  // 3. Fetch config for fiat rate and calculate gross vs net pool
  const config = await prisma.siteConfig.findUnique({ where: { id: 'global' } });
  const pointRate = config?.pointToFiatRate || 0.01;
  const grossDistributablePool =
    currency === 'USD'
      ? Math.floor(amount / pointRate)
      : Math.floor(amount);

  // 3b. Query sum of all current creator wallet balances (Liability Reserve)
  const creatorWalletsAgg = await prisma.user.aggregate({
    where: { role: 'creator' },
    _sum: { points: true },
  });
  const creatorWalletReserve = creatorWalletsAgg._sum.points || 0;
  const netDistributablePool = Math.max(0, grossDistributablePool - creatorWalletReserve);
  const distributablePool = netDistributablePool;

  // 4. Query telemetry overview (raw, bots, guests)
  const [totalRawEvents, totalBotEvents, totalGuestEvents] = await Promise.all([
    prisma.chapterReadEvent.count({
      where: { createdAt: { gte: periodStart, lte: periodEnd } },
    }),
    prisma.chapterReadEvent.count({
      where: { createdAt: { gte: periodStart, lte: periodEnd }, isBotLikely: true },
    }),
    prisma.chapterReadEvent.count({
      where: { createdAt: { gte: periodStart, lte: periodEnd }, userId: null },
    }),
  ]);

  // 5. Query qualifying read events (authenticated, non-bot)
  const qualifyingEvents = await prisma.chapterReadEvent.findMany({
    where: {
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
      isBotLikely: false,
      userId: { not: null },
      creatorId: { not: null },
    },
    select: {
      id: true,
      userId: true,
      chapterId: true,
      creatorId: true,
      qualityTier: true,
      qualityScore: true,
      durationSeconds: true,
      completionPercent: true,
      creator: {
        select: {
          id: true,
          channelName: true,
          profileImage: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // 6. Aggregation-Time Deduplication: 1 best qualifying read per user per chapter per period
  const deduplicatedMap = new Map<string, (typeof qualifyingEvents)[0]>();
  for (const event of qualifyingEvents) {
    if (!event.userId) continue;
    const key = `${event.userId}_${event.chapterId}`;
    const existing = deduplicatedMap.get(key);
    if (!existing || event.qualityScore > existing.qualityScore) {
      deduplicatedMap.set(key, event);
    }
  }

  const deduplicatedEvents = Array.from(deduplicatedMap.values());

  // 7. Group by Creator and calculate Quality Scores
  interface CreatorAgg {
    creatorId: string;
    userId: string;
    channelName: string;
    profileImage: string | null;
    ownerName: string;
    ownerEmail: string;
    qualityScore: number;
    qualifiedReadsCount: number;
    engagedReadsCount: number;
    completedReadsCount: number;
    bouncedReadsCount: number;
    totalReadsCount: number;
  }

  const creatorMap = new Map<string, CreatorAgg>();

  let totalPlatformQualityScore = 0;
  let totalQualifiedReads = 0;
  let totalEngagedReads = 0;
  let totalCompletedReads = 0;

  for (const event of deduplicatedEvents) {
    if (!event.creatorId || !event.creator?.user) continue;

    let agg = creatorMap.get(event.creatorId);
    if (!agg) {
      agg = {
        creatorId: event.creatorId,
        userId: event.creator.user.id,
        channelName: event.creator.channelName,
        profileImage: event.creator.profileImage,
        ownerName: event.creator.user.name,
        ownerEmail: event.creator.user.email,
        qualityScore: 0,
        qualifiedReadsCount: 0,
        engagedReadsCount: 0,
        completedReadsCount: 0,
        bouncedReadsCount: 0,
        totalReadsCount: 0,
      };
      creatorMap.set(event.creatorId, agg);
    }

    agg.totalReadsCount += 1;
    agg.qualityScore += event.qualityScore;
    totalPlatformQualityScore += event.qualityScore;

    if (event.qualityTier === QualityTier.COMPLETED) {
      agg.completedReadsCount += 1;
      totalCompletedReads += 1;
    } else if (event.qualityTier === QualityTier.ENGAGED) {
      agg.engagedReadsCount += 1;
      totalEngagedReads += 1;
    } else if (event.qualityTier === QualityTier.QUALIFIED) {
      agg.qualifiedReadsCount += 1;
      totalQualifiedReads += 1;
    } else {
      agg.bouncedReadsCount += 1;
    }
  }

  // 8. Compute Share Ratios and Payouts
  const creators = Array.from(creatorMap.values()).map((c) => {
    const scorePercentage =
      totalPlatformQualityScore > 0
        ? (c.qualityScore / totalPlatformQualityScore) * 100
        : 0;
    const pointsAwarded =
      totalPlatformQualityScore > 0
        ? Math.floor(distributablePool * (c.qualityScore / totalPlatformQualityScore))
        : 0;
    const fiatEquivalent = pointsAwarded * pointRate;

    return {
      creatorId: c.creatorId,
      userId: c.userId,
      channelName: c.channelName,
      profileImage: c.profileImage,
      ownerName: c.ownerName,
      ownerEmail: c.ownerEmail,
      qualityScore: Number(c.qualityScore.toFixed(2)),
      scorePercentage: Number(scorePercentage.toFixed(2)),
      qualifiedReadsCount: c.qualifiedReadsCount,
      engagedReadsCount: c.engagedReadsCount,
      completedReadsCount: c.completedReadsCount,
      totalReadsCount: c.totalReadsCount,
      pointsAwarded,
      fiatEquivalent: Number(fiatEquivalent.toFixed(2)),
    };
  });

  // Sort by highest quality score
  creators.sort((a, b) => b.qualityScore - a.qualityScore);

  return {
    periodStart,
    periodEnd,
    grossAmountEntered: amount,
    currency,
    pointRate,
    grossDistributablePool,
    creatorWalletReserve,
    netDistributablePool,
    distributablePool: netDistributablePool,
    totalPlatformQualityScore: Number(totalPlatformQualityScore.toFixed(2)),
    totalQualifiedReads,
    totalEngagedReads,
    totalCompletedReads,
    totalDeduplicatedReads: deduplicatedEvents.length,
    telemetry: {
      totalRawEvents,
      totalBotEvents,
      totalGuestEvents,
      totalQualifyingEvents: qualifyingEvents.length,
    },
    overlappingRun: overlappingRun
      ? {
          id: overlappingRun.id,
          periodStart: overlappingRun.periodStart,
          periodEnd: overlappingRun.periodEnd,
          grossAmountEntered: overlappingRun.grossAmountEntered,
          currency: overlappingRun.currency,
        }
      : null,
    creators,
  };
};

/**
 * Executes an atomic Revenue Distribution Run crediting all creators and logging audit entries.
 */
const executeDistribution = async (
  adminId: string,
  periodStart: Date,
  periodEnd: Date,
  amount: number,
  currency: 'USD' | 'POINTS' = 'USD',
  notes?: string
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Strict overlap lock inside transaction
    const overlappingRun = await tx.revenueDistributionRun.findFirst({
      where: {
        status: DistributionStatus.COMPLETED,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: periodStart },
      },
    });

    if (overlappingRun) {
      throw new AppError(
        httpStatus.CONFLICT,
        `Cannot execute: Selected period [${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}] overlaps with completed distribution #${overlappingRun.id}.`
      );
    }

    // 2. Fetch point to fiat conversion rate and compute Net Pool after Creator Wallet Reserve
    const config = await tx.siteConfig.findUnique({ where: { id: 'global' } });
    const pointRate = config?.pointToFiatRate || 0.01;
    const grossDistributablePool =
      currency === 'USD'
        ? Math.floor(amount / pointRate)
        : Math.floor(amount);

    const creatorWalletsAgg = await tx.user.aggregate({
      where: { role: 'creator' },
      _sum: { points: true },
    });
    const creatorWalletReserve = creatorWalletsAgg._sum.points || 0;
    const netDistributablePool = Math.max(0, grossDistributablePool - creatorWalletReserve);
    const distributablePool = netDistributablePool;

    // 3. Query and deduplicate qualifying events
    const qualifyingEvents = await tx.chapterReadEvent.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        isBotLikely: false,
        userId: { not: null },
        creatorId: { not: null },
      },
      include: {
        creator: {
          select: {
            id: true,
            userId: true,
            channelName: true,
          },
        },
      },
    });

    const deduplicatedMap = new Map<string, (typeof qualifyingEvents)[0]>();
    for (const event of qualifyingEvents) {
      if (!event.userId) continue;
      const key = `${event.userId}_${event.chapterId}`;
      const existing = deduplicatedMap.get(key);
      if (!existing || event.qualityScore > existing.qualityScore) {
        deduplicatedMap.set(key, event);
      }
    }

    const deduplicatedEvents = Array.from(deduplicatedMap.values());

    // 4. Calculate quality scores per creator
    const creatorMap = new Map<
      string,
      {
        creatorId: string;
        userId: string;
        qualityScore: number;
        qualifiedReadsCount: number;
        engagedReadsCount: number;
        completedReadsCount: number;
        totalReadsCount: number;
      }
    >();

    let totalPlatformScore = 0;
    let totalQualified = 0;
    let totalEngaged = 0;
    let totalCompleted = 0;

    for (const event of deduplicatedEvents) {
      if (!event.creatorId || !event.creator?.userId) continue;

      let agg = creatorMap.get(event.creatorId);
      if (!agg) {
        agg = {
          creatorId: event.creatorId,
          userId: event.creator.userId,
          qualityScore: 0,
          qualifiedReadsCount: 0,
          engagedReadsCount: 0,
          completedReadsCount: 0,
          totalReadsCount: 0,
        };
        creatorMap.set(event.creatorId, agg);
      }

      agg.totalReadsCount += 1;
      agg.qualityScore += event.qualityScore;
      totalPlatformScore += event.qualityScore;

      if (event.qualityTier === QualityTier.COMPLETED) {
        agg.completedReadsCount += 1;
        totalCompleted += 1;
      } else if (event.qualityTier === QualityTier.ENGAGED) {
        agg.engagedReadsCount += 1;
        totalEngaged += 1;
      } else if (event.qualityTier === QualityTier.QUALIFIED) {
        agg.qualifiedReadsCount += 1;
        totalQualified += 1;
      }
    }

    const creatorsList = Array.from(creatorMap.values());

    // 5. Zero-Score division guard
    if (totalPlatformScore <= 0 || creatorsList.length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Cannot distribute: No qualified authenticated reading activity occurred during the selected period.'
      );
    }

    const runNotes = [
      notes,
      `Gross: ${grossDistributablePool.toLocaleString()} pts`,
      `Reserve: ${creatorWalletReserve.toLocaleString()} pts`,
      `Net Pool: ${netDistributablePool.toLocaleString()} pts`,
    ]
      .filter(Boolean)
      .join(' | ');

    // 6. Create RevenueDistributionRun
    const run = await tx.revenueDistributionRun.create({
      data: {
        adminId,
        periodStart,
        periodEnd,
        grossAmountEntered: amount,
        currency,
        distributablePool: netDistributablePool,
        totalQualityScore: totalPlatformScore,
        totalQualifiedReads: totalQualified,
        totalEngagedReads: totalEngaged,
        totalCompletedReads: totalCompleted,
        totalCreatorsCount: creatorsList.length,
        status: DistributionStatus.COMPLETED,
        notes: runNotes || null,
      },
    });

    const payoutItems = [];

    // 7. Atomic Credit loop for each creator
    for (const item of creatorsList) {
      const pointsAwarded = Math.floor(
        distributablePool * (item.qualityScore / totalPlatformScore)
      );
      const fiatEquivalent = pointsAwarded * pointRate;
      const scorePercentage = (item.qualityScore / totalPlatformScore) * 100;

      // Create itemized payout record
      const payout = await tx.revenueDistributionPayout.create({
        data: {
          distributionRunId: run.id,
          creatorId: item.creatorId,
          qualityScore: item.qualityScore,
          scorePercentage,
          qualifiedReadsCount: item.qualifiedReadsCount,
          engagedReadsCount: item.engagedReadsCount,
          completedReadsCount: item.completedReadsCount,
          totalReadsCount: item.totalReadsCount,
          pointsAwarded,
          fiatEquivalent,
        },
      });

      payoutItems.push(payout);

      // Increment User points
      await tx.user.update({
        where: { id: item.userId },
        data: {
          points: { increment: pointsAwarded },
        },
      });

      // Increment CreatorProfile totalEarnings
      await tx.creatorProfile.update({
        where: { id: item.creatorId },
        data: {
          totalEarnings: { increment: pointsAwarded },
        },
      });

      // Insert transparent PointTransaction ledger record
      await tx.pointTransaction.create({
        data: {
          userId: item.userId,
          type: 'REVENUE_SHARE',
          amount: pointsAwarded,
          description: `Reader Quality Revenue Distribution for ${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`,
        },
      });
    }

    // 8. Record Staff AuditLog
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: 'REVENUE_DISTRIBUTION_EXECUTE',
        targetType: 'RevenueDistributionRun',
        targetId: run.id,
        details: {
          runId: run.id,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          grossAmountEntered: amount,
          currency,
          distributablePool,
          totalQualityScore: totalPlatformScore,
          totalCreatorsCount: creatorsList.length,
        },
      },
    });

    return {
      run,
      payoutsCount: payoutItems.length,
      distributablePool,
    };
  });
};

/**
 * Fetches all past Revenue Distribution Runs.
 */
const getDistributionHistory = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [runs, total] = await Promise.all([
    prisma.revenueDistributionRun.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { creatorPayouts: true },
        },
      },
    }),
    prisma.revenueDistributionRun.count(),
  ]);

  return {
    runs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Fetches single Revenue Distribution Run details with per-creator breakdown.
 */
const getDistributionDetails = async (runId: string) => {
  const run = await prisma.revenueDistributionRun.findUnique({
    where: { id: runId },
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creatorPayouts: {
        orderBy: { pointsAwarded: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              channelName: true,
              profileImage: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!run) {
    throw new AppError(httpStatus.NOT_FOUND, 'Distribution run not found');
  }

  return run;
};

/**
 * Reverts a COMPLETED Revenue Distribution Run:
 * 1. Validates the run exists and is currently COMPLETED (allow-list check).
 * 2. In a single atomic $transaction:
 *    a) Updates RevenueDistributionRun.status = REVERTED, revertedAt = now(), revertedBy = adminId.
 *    b) For each creator payout:
 *       - Finds all PENDING WithdrawalRequests for that creator.
 *       - Rejects each pending withdrawal with:
 *         "Automatically cancelled due to a correction on a related revenue distribution — please resubmit if your balance still allows."
 *       - Refunds the pending points back to creator: User.points += pointsRequested.
 *       - Records PointTransaction (type: WITHDRAWAL_REFUND, amount: +pointsRequested).
 *       - Reads the creator's refreshed live balance: currentBalance = user.points.
 *       - Computes clawback:
 *         amountToClawback = payout.pointsAwarded
 *         actualDeduction = Math.min(currentBalance, amountToClawback)
 *         shortfall = amountToClawback - actualDeduction
 *       - Deducts actualDeduction from User.points (never goes negative).
 *       - Decrements CreatorProfile.totalEarnings by actualDeduction.
 *       - Updates RevenueDistributionPayout: revertedPoints = actualDeduction, shortfallPoints = shortfall.
 *       - Records PointTransaction (type: REVENUE_SHARE_REVERSAL, amount: -actualDeduction).
 *    c) Records Staff AuditLog with full accounting details (total clawed back, total shortfalls, auto-cancelled withdrawals).
 */
const revertDistribution = async (
  runId: string,
  adminId: string,
  revertReason?: string
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch distribution run and verify status with strict allow-list
    const run = await tx.revenueDistributionRun.findUnique({
      where: { id: runId },
      include: {
        creatorPayouts: {
          include: {
            creator: {
              select: {
                id: true,
                userId: true,
                channelName: true,
              },
            },
          },
        },
      },
    });

    if (!run) {
      throw new AppError(httpStatus.NOT_FOUND, 'Revenue distribution run not found');
    }

    if (run.status !== DistributionStatus.COMPLETED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot revert: Only COMPLETED runs can be reverted. Current run status is ${run.status}.`
      );
    }

    // 2. Mark the run as REVERTED
    const updatedRun = await tx.revenueDistributionRun.update({
      where: { id: runId },
      data: {
        status: DistributionStatus.REVERTED,
        revertedAt: new Date(),
        revertedBy: adminId,
        notes: revertReason
          ? run.notes
            ? `${run.notes} | REVERTED: ${revertReason}`
            : `REVERTED: ${revertReason}`
          : run.notes,
      },
    });

    let totalClawedBack = 0;
    let totalShortfall = 0;
    let autoCancelledWithdrawalsCount = 0;
    const clawbackSummary = [];

    // 3. Process each creator's payout reversal
    for (const payout of run.creatorPayouts) {
      const creatorUserId = payout.creator.userId;
      const creatorProfileId = payout.creatorId;

      // --- STEP A: Auto-reject and refund PENDING withdrawal requests ---
      const pendingWithdrawals = await tx.withdrawalRequest.findMany({
        where: {
          userId: creatorUserId,
          status: 'PENDING',
        },
      });

      for (const withdrawal of pendingWithdrawals) {
        // Auto-reject with clear explanatory note
        await tx.withdrawalRequest.update({
          where: { id: withdrawal.id },
          data: {
            status: 'REJECTED',
            notes:
              'Automatically cancelled due to a correction on a related revenue distribution — please resubmit if your balance still allows.',
          },
        });

        // Refund points back to live balance
        await tx.user.update({
          where: { id: creatorUserId },
          data: {
            points: { increment: withdrawal.pointsRequested },
          },
        });

        // Record WITHDRAWAL_REFUND ledger transaction
        await tx.pointTransaction.create({
          data: {
            userId: creatorUserId,
            type: 'WITHDRAWAL_REFUND',
            amount: withdrawal.pointsRequested,
            description: `Automatic refund for pending withdrawal #${withdrawal.id} due to revenue distribution reversal`,
          },
        });

        autoCancelledWithdrawalsCount++;
      }

      // --- STEP B: Read fresh balance and compute clawback ---
      const freshUser = await tx.user.findUnique({
        where: { id: creatorUserId },
        select: { points: true },
      });

      const currentBalance = freshUser?.points ?? 0;
      const amountToClawback = payout.pointsAwarded;
      const actualDeduction = Math.min(currentBalance, amountToClawback);
      const shortfall = amountToClawback - actualDeduction;

      totalClawedBack += actualDeduction;
      totalShortfall += shortfall;

      // Deduct available points from user balance (clamped at 0)
      if (actualDeduction > 0) {
        await tx.user.update({
          where: { id: creatorUserId },
          data: {
            points: { decrement: actualDeduction },
          },
        });

        await tx.creatorProfile.update({
          where: { id: creatorProfileId },
          data: {
            totalEarnings: { decrement: actualDeduction },
          },
        });

        // Record REVENUE_SHARE_REVERSAL transaction
        await tx.pointTransaction.create({
          data: {
            userId: creatorUserId,
            type: 'REVENUE_SHARE_REVERSAL',
            amount: -actualDeduction,
            description: `Clawback for reverted revenue distribution #${run.id} (${run.periodStart.toISOString().split('T')[0]} to ${run.periodEnd.toISOString().split('T')[0]})${
              shortfall > 0 ? ` [Unresolved shortfall: ${shortfall} pts]` : ''
            }`,
          },
        });
      }

      // Update payout item with clawback & shortfall accounting
      await tx.revenueDistributionPayout.update({
        where: { id: payout.id },
        data: {
          revertedPoints: actualDeduction,
          shortfallPoints: shortfall,
        },
      });

      clawbackSummary.push({
        creatorId: creatorProfileId,
        channelName: payout.creator.channelName,
        pointsAwarded: amountToClawback,
        clawedBack: actualDeduction,
        shortfall,
      });
    }

    // 4. Record Staff AuditLog
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: 'REVENUE_DISTRIBUTION_REVERT',
        targetType: 'RevenueDistributionRun',
        targetId: run.id,
        details: {
          runId: run.id,
          revertReason: revertReason || 'No reason provided',
          totalCreators: run.creatorPayouts.length,
          totalPoolPoints: run.distributablePool,
          totalClawedBack,
          totalShortfall,
          autoCancelledWithdrawalsCount,
          clawbackSummary,
        },
      },
    });

    return {
      run: updatedRun,
      totalClawedBack,
      totalShortfall,
      autoCancelledWithdrawalsCount,
    };
  });
};

export const AdRevenueService = {
  trackReadEvent,
  evaluateBotDetection,
  checkHighFrequencyIp,
  calculateQualityScore,
  getDistributionPreview,
  executeDistribution,
  revertDistribution,
  getDistributionHistory,
  getDistributionDetails,
};



