import { env } from "@/env";

export interface CustomAdItem {
  id: string;
  title: string;
  provider: "CUSTOM" | "ADSENSE" | "ADMOB" | string;
  format: "BANNER" | "INTERSTITIAL" | "REWARDED" | "NATIVE" | string;
  placement: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  videoUrl?: string | null;
  adType?: string;
  socialPlatform?: string | null;
  socialActionUrl?: string | null;
  adClient?: string | null;
  adSlotId?: string | null;
  adUnitId?: string | null;
  points: number;
  impressions: number;
  clicks: number;
  revenue: number;
  isActive: boolean;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED" | string;
  targetCountries: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdStats {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
  totalRevenue: number;
  avgCtr?: string;
  ctr?: number;
}

export interface AdFilterParams {
  page?: number;
  limit?: number;
  placement?: string;
  provider?: string;
  status?: string;
  [key: string]: any;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export const adService = {
  getAdByPlacement: async (placement: string): Promise<ServiceResponse<CustomAdItem | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/ads/placement/${placement}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: [`Ad-${placement}`] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: null, message: data?.message || "Failed to fetch ad placement" };
      }
      return data;
    } catch (_error) {
      return { success: false, data: null, message: "Failed to fetch ad placement" };
    }
  },

  getCustomAds: async (params: AdFilterParams = {}): Promise<ServiceResponse<CustomAdItem[]>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/ads${queryStr}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["Ads"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], message: data?.message || "Failed to fetch custom ads" };
      }
      return data;
    } catch (_error) {
      return { success: false, data: [], message: "Failed to fetch custom ads" };
    }
  },

  getAdStats: async (): Promise<ServiceResponse<AdStats | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/ads/stats`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["AdStats"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: null, message: data?.message || "Failed to fetch ad stats" };
      }
      return data;
    } catch (_error) {
      return { success: false, data: null, message: "Failed to fetch ad stats" };
    }
  },
};
