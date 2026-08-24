import { env } from "@/env";

export interface AdminAnalyticsData {
  timeframe: string;
  kpis: {
    grossRevenue: number;
    revenueGrowth: number;
    totalUsers: number;
    userGrowth: number;
    dau: number;
    mau: number;
    totalCreators: number;
    totalSeries: number;
    activeSeries: number;
    totalChapters: number;
    totalViews: number;
    totalAdViews: number;
    totalAdClicks: number;
    globalCtr: number;
    totalFiatWithdrawn: number;
    pendingFiatLiability: number;
    pendingWithdrawalCount: number;
    totalChapterUnlocks: number;
    totalPointsSpentOnChapters: number;
    totalDistributionPool: number;
  };
  revenueCashFlowChart: Array<{
    date: string;
    revenue: number;
    payouts: number;
    margin: number;
  }>;
  readQualityDistribution: Array<{
    tier: string;
    name: string;
    count: number;
    color: string;
  }>;
  adNetworkStats: Array<{
    provider: string;
    impressions: number;
    clicks: number;
    units: number;
    ctr: number;
  }>;
  contentFormatDistribution: Array<{
    name: string;
    count: number;
    views: number;
    color: string;
  }>;
  genreDistribution: Array<{
    name: string;
    seriesCount: number;
  }>;
  topSeriesList: Array<{
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    type: string;
    status: string;
    views: number;
    bookmarks: number;
    rating: number;
    chapterCount: number;
  }>;
  topCreatorsList: Array<{
    id: string;
    channelName: string;
    userName: string;
    userEmail?: string;
    userImage?: string | null;
    totalEarnings: number;
    withdrawnAmount: number;
    seriesCount: number;
  }>;
  healthAlerts: {
    pendingWithdrawals: number;
    pendingWithdrawalAmount: number;
    pendingReports: number;
    pendingApplications: number;
    frozenUsers: number;
  };
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  statusCode?: number;
  message?: string;
}

export const adminAnalyticsService = {
  getAnalytics: async (
    timeframe: string = "30d"
  ): Promise<ServiceResponse<AdminAnalyticsData | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Client-side context
      }

      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/stats/admin-analytics?timeframe=${timeframe}`,
        {
          headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
          credentials: "include",
          next: { tags: ["AdminAnalytics"] },
          cache: "no-store",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          data: null,
          statusCode: res.status,
          message: data?.message || "Failed to fetch admin analytics",
        };
      }
      return data;
    } catch (_error) {
      return {
        success: false,
        data: null,
        statusCode: 500,
        message: "Failed to fetch admin analytics",
      };
    }
  },
};
