import { env } from "@/env";

export interface DashboardStatsResponse {
  scope: "PLATFORM" | "CREATOR";
  overview: {
    totalUsers?: number;
    userGrowth?: number;
    activeSeries: number;
    totalSeries: number;
    seriesGrowth?: number;
    totalViews: number;
    viewsGrowth?: number;
    netRevenue?: number;
    revenueGrowth?: number;
    totalBookmarks?: number;
    totalRevenue?: number;
    totalChapters?: number;
    totalCreators?: number;
  };
  revenueChart: Array<{
    name: string;
    revenue: number;
  }>;
  contentDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  recentReports: Array<{
    id: string;
    user: string;
    type: string;
    subject: string;
    status: string;
    date: string;
  }>;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  statusCode?: number;
  message?: string;
}

export const statsService = {
  getStats: async (): Promise<ServiceResponse<DashboardStatsResponse | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/stats`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["Stats"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          data: null,
          statusCode: res.status,
          message: data?.message || "Failed to fetch dashboard stats",
        };
      }
      return data;
    } catch (_error) {
      return {
        success: false,
        data: null,
        statusCode: 500,
        message: "Failed to fetch dashboard stats",
      };
    }
  },
};
