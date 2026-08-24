-- CreateEnum
CREATE TYPE "QualityTier" AS ENUM ('BOUNCED', 'QUALIFIED', 'ENGAGED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DistributionStatus" AS ENUM ('COMPLETED', 'REVERTED');

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'REVENUE_SHARE';
ALTER TYPE "TransactionType" ADD VALUE 'REVENUE_SHARE_REVERSAL';
ALTER TYPE "TransactionType" ADD VALUE 'WITHDRAWAL_REFUND';

-- CreateTable
CREATE TABLE "chapter_read_event" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "seriesId" TEXT,
    "chapterId" TEXT,
    "creatorId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "pagesViewed" INTEGER NOT NULL DEFAULT 0,
    "totalPages" INTEGER NOT NULL DEFAULT 1,
    "completionPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "scrollDepthPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "qualityTier" "QualityTier" NOT NULL DEFAULT 'BOUNCED',
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isBotLikely" BOOLEAN NOT NULL DEFAULT false,
    "botReason" TEXT,
    "clientIp" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapter_read_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_distribution_run" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "grossAmountEntered" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "distributablePool" INTEGER NOT NULL,
    "totalQualityScore" DOUBLE PRECISION NOT NULL,
    "totalQualifiedReads" INTEGER NOT NULL,
    "totalEngagedReads" INTEGER NOT NULL,
    "totalCompletedReads" INTEGER NOT NULL,
    "totalCreatorsCount" INTEGER NOT NULL,
    "status" "DistributionStatus" NOT NULL DEFAULT 'COMPLETED',
    "revertedAt" TIMESTAMP(3),
    "revertedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_distribution_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_distribution_payout" (
    "id" TEXT NOT NULL,
    "distributionRunId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "scorePercentage" DOUBLE PRECISION NOT NULL,
    "qualifiedReadsCount" INTEGER NOT NULL DEFAULT 0,
    "engagedReadsCount" INTEGER NOT NULL DEFAULT 0,
    "completedReadsCount" INTEGER NOT NULL DEFAULT 0,
    "totalReadsCount" INTEGER NOT NULL DEFAULT 0,
    "pointsAwarded" INTEGER NOT NULL,
    "fiatEquivalent" DOUBLE PRECISION NOT NULL,
    "revertedPoints" INTEGER NOT NULL DEFAULT 0,
    "shortfallPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_distribution_payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chapter_read_event_createdAt_idx" ON "chapter_read_event"("createdAt");

-- CreateIndex
CREATE INDEX "chapter_read_event_creatorId_createdAt_idx" ON "chapter_read_event"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "chapter_read_event_seriesId_createdAt_idx" ON "chapter_read_event"("seriesId", "createdAt");

-- CreateIndex
CREATE INDEX "chapter_read_event_chapterId_createdAt_idx" ON "chapter_read_event"("chapterId", "createdAt");
CREATE INDEX "chapter_read_event_clientIp_createdAt_idx" ON "chapter_read_event"("clientIp", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "chapter_read_event_sessionId_chapterId_key" ON "chapter_read_event"("sessionId", "chapterId");

-- CreateIndex
CREATE INDEX "revenue_distribution_run_periodStart_periodEnd_idx" ON "revenue_distribution_run"("periodStart", "periodEnd");
CREATE INDEX "revenue_distribution_run_status_periodStart_periodEnd_idx" ON "revenue_distribution_run"("status", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "revenue_distribution_payout_creatorId_idx" ON "revenue_distribution_payout"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_distribution_payout_distributionRunId_creatorId_key" ON "revenue_distribution_payout"("distributionRunId", "creatorId");

-- AddForeignKey
ALTER TABLE "chapter_read_event" ADD CONSTRAINT "chapter_read_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_read_event" ADD CONSTRAINT "chapter_read_event_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_read_event" ADD CONSTRAINT "chapter_read_event_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_read_event" ADD CONSTRAINT "chapter_read_event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creator_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_distribution_run" ADD CONSTRAINT "revenue_distribution_run_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_distribution_payout" ADD CONSTRAINT "revenue_distribution_payout_distributionRunId_fkey" FOREIGN KEY ("distributionRunId") REFERENCES "revenue_distribution_run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_distribution_payout" ADD CONSTRAINT "revenue_distribution_payout_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creator_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
