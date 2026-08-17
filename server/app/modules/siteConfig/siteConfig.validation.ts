import { z } from 'zod';

const optionalString = z.string().nullable().optional().or(z.literal(''));
const optionalBool = z
  .boolean()
  .nullable()
  .optional()
  .or(z.string().transform((v) => v === 'true'));
const optionalNumber = z
  .number()
  .nullable()
  .optional()
  .or(z.string().transform((v) => (v === '' ? undefined : Number(v))));

export const updateSiteConfigSchema = z.object({
  body: z
    .object({
      id: z.string().optional(),
      appName: z.string().min(1).max(100).nullable().optional(),
      appTagline: optionalString,
      appLogoUrl: optionalString,
      heroHeadline: optionalString,
      heroSubtitle: optionalString,
      announceText: optionalString,
      announceLink: optionalString,
      dmcaEmail: optionalString,
      termsOfService: optionalString,
      privacyPolicy: optionalString,
      aboutUs: optionalString,
      isMaintenanceMode: optionalBool,
      maintenanceMessage: optionalString,
      allowNewRegistrations: optionalBool,
      allowCreatorApplications: optionalBool,
      enableGlobalChat: optionalBool,
      enableStripePayment: optionalBool,
      enableCashOut: optionalBool,
      enablePremiumChapters: optionalBool,
      seoTitle: optionalString,
      seoDescription: optionalString,
      seoKeywords: optionalString,
      ogImageUrl: optionalString,
      gaTrackingId: optionalString,
      adClient: optionalString,
      playStoreUrl: optionalString,
      appStoreUrl: optionalString,
      pointToFiatRate: optionalNumber,
      minWithdrawalPoints: optionalNumber,
      creatorRevenueSharePercent: optionalNumber,
      maxDailyAdPoints: optionalNumber,
      featuredRequestFee: optionalNumber,
      referralBonusPercent: optionalNumber,
      referralActiveMonths: optionalNumber,
      customAdScript: optionalString,
      discord: optionalString,
      twitter: optionalString,
      telegram: optionalString,
      youtube: optionalString,
      instagram: optionalString,
      facebook: optionalString,
      reddit: optionalString,
      socialLinks: z.any().optional(),
      createdAt: z.any().optional(),
      updatedAt: z.any().optional(),
    })
    .passthrough(),
});
