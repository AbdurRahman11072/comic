import { env } from "@/env";

export interface SiteConfigData {
  id?: string;
  appName?: string;
  appTagline?: string | null;
  appLogoUrl?: string | null;
  heroHeadline?: string | null;
  heroSubtitle?: string | null;
  playStoreUrl?: string | null;
  appStoreUrl?: string | null;
  announceText?: string | null;
  announceLink?: string | null;
  termsOfService?: string | null;
  privacyPolicy?: string | null;
  aboutUs?: string | null;
  dmcaEmail?: string | null;
  contactEmail?: string | null;

  // System & Access
  isMaintenanceMode?: boolean;
  maintenanceMessage?: string | null;
  allowNewRegistrations?: boolean;
  allowCreatorApplications?: boolean;
  enableGlobalChat?: boolean;
  enableStripePayment?: boolean;
  enableCashOut?: boolean;
  enablePremiumChapters?: boolean;

  // SEO & Tracking
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImageUrl?: string | null;
  gaTrackingId?: string | null;
  googleAdsenseId?: string | null;
  adClient?: string | null;

  // Social Links
  facebook?: string;
  twitter?: string;
  discord?: string;
  instagram?: string;
  youtube?: string;
  telegram?: string;
  reddit?: string;

  // Economy & Rates
  minWithdrawalPoints?: number;
  creatorRevenueSharePercent?: number;
  referralBonusPercent?: number;
  referralActiveMonths?: number;
  referralSignupBonus?: number;
  maxDailyAdPoints?: number;
  pointToFiatRate?: number;
  featuredRequestFee?: number;
  customAdScript?: string | null;
  payoutMethods?: string[];
  updatedAt?: string;
}

export interface SiteConfigResponse {
  success: boolean;
  message?: string;
  data?: SiteConfigData | null;
}

export const siteService = {
  getSiteConfig: async (): Promise<SiteConfigResponse> => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/site-config`, {
        next: { tags: ["SiteConfig"] },
      });
      const data = await res.json();
      return data;
    } catch (_error) {
      return { success: false, data: null };
    }
  },
};
