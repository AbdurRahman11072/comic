import { baseApi } from './baseApi';

export interface SiteConfigData {
  id: string;
  appName: string;
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

  // System & Access
  isMaintenanceMode: boolean;
  maintenanceMessage?: string | null;
  allowNewRegistrations: boolean;
  allowCreatorApplications: boolean;
  enableGlobalChat: boolean;
  enableStripePayment?: boolean;
  enableCashOut?: boolean;

  // SEO & Tracking
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  ogImageUrl?: string | null;
  gaTrackingId?: string | null;

  // Social Links
  facebook?: string;
  twitter?: string;
  discord?: string;
  instagram?: string;
  youtube?: string;
  telegram?: string;
  reddit?: string;

  // Economy & Rates
  minWithdrawalPoints: number;
  creatorRevenueSharePercent: number;
  referralBonusPercent: number;
  referralActiveMonths: number;
  referralSignupBonus: number;
  maxDailyAdPoints: number;
  pointToFiatRate: number;
  featuredRequestFee: number;
  customAdScript?: string | null;
  updatedAt?: string;
}

export const siteConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSiteConfig: builder.query<{ success: boolean; data: SiteConfigData }, void>({
      query: () => '/site-config',
      providesTags: ['SiteConfig'],
    }),

    updateSiteConfig: builder.mutation<
      { success: boolean; data: SiteConfigData },
      Partial<SiteConfigData>
    >({
      query: (body) => ({
        url: '/site-config',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SiteConfig'],
    }),
  }),
});

export const {
  useGetSiteConfigQuery,
  useUpdateSiteConfigMutation,
} = siteConfigApi;
