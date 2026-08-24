-- CreateEnum
CREATE TYPE "AdProvider" AS ENUM ('CUSTOM', 'ADSENSE', 'ADMOB');

-- CreateEnum
CREATE TYPE "AdFormat" AS ENUM ('BANNER', 'INTERSTITIAL', 'REWARDED', 'NATIVE');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "series" DROP CONSTRAINT "series_creatorId_fkey";

-- AlterTable
ALTER TABLE "chapter" ADD COLUMN "isFastPass" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publishAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "chat_message" ADD COLUMN "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "custom_ad" ADD COLUMN "adClient" TEXT,
ADD COLUMN "adSlotId" TEXT,
ADD COLUMN "adUnitId" TEXT,
ADD COLUMN "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "format" "AdFormat" NOT NULL DEFAULT 'BANNER',
ADD COLUMN "impressions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "placement" TEXT NOT NULL DEFAULT 'home_banner',
ADD COLUMN "provider" "AdProvider" NOT NULL DEFAULT 'CUSTOM',
ADD COLUMN "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN "status" "AdStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "linkUrl" DROP NOT NULL,
ALTER COLUMN "points" SET DEFAULT 10;

-- AlterTable
ALTER TABLE "series" ADD COLUMN "hiddenReason" TEXT,
ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "site_config" ADD COLUMN "aboutUs" TEXT,
ADD COLUMN "adClient" TEXT,
ADD COLUMN "allowCreatorApplications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "allowNewRegistrations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "appLogoUrl" TEXT,
ADD COLUMN "appName" TEXT NOT NULL DEFAULT 'Genz Toon',
ADD COLUMN "appStoreUrl" TEXT,
ADD COLUMN "appTagline" TEXT,
ADD COLUMN "contactEmail" TEXT DEFAULT 'support@comicbd.com',
ADD COLUMN "creatorRevenueSharePercent" INTEGER NOT NULL DEFAULT 70,
ADD COLUMN "dmcaEmail" TEXT,
ADD COLUMN "enableCashOut" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "enableGlobalChat" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "enablePremiumChapters" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "enableStripePayment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "gaTrackingId" TEXT,
ADD COLUMN "heroHeadline" TEXT,
ADD COLUMN "heroSubtitle" TEXT,
ADD COLUMN "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "maintenanceMessage" TEXT,
ADD COLUMN "minWithdrawalPoints" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN "ogImageUrl" TEXT,
ADD COLUMN "payoutMethods" TEXT[] DEFAULT ARRAY['bKash', 'Nagad', 'Rocket', 'Bank Transfer']::TEXT[],
ADD COLUMN "playStoreUrl" TEXT,
ADD COLUMN "privacyPolicy" TEXT,
ADD COLUMN "referralSignupBonus" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "seoDescription" TEXT,
ADD COLUMN "seoKeywords" TEXT,
ADD COLUMN "seoTitle" TEXT,
ADD COLUMN "termsOfService" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN "mutedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "withdrawal_request" ADD COLUMN "accountNumber" TEXT,
ADD COLUMN "paymentMethod" TEXT;

-- CreateTable
CREATE TABLE "creator_post" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "creatorId" TEXT,
    "seriesId" TEXT,
    "pointsReward" INTEGER NOT NULL DEFAULT 0,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER NOT NULL DEFAULT 100,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_code_redemption" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_code_redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "category" TEXT DEFAULT 'General',
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promo_code_code_key" ON "promo_code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "promo_code_redemption_promoCodeId_userId_key" ON "promo_code_redemption"("promoCodeId", "userId");

-- CreateIndex
CREATE INDEX "custom_ad_placement_status_idx" ON "custom_ad"("placement", "status");

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creator_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_post" ADD CONSTRAINT "creator_post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_code" ADD CONSTRAINT "promo_code_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_code_redemption" ADD CONSTRAINT "promo_code_redemption_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promo_code"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_code_redemption" ADD CONSTRAINT "promo_code_redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
