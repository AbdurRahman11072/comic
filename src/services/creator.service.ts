import { env } from "@/env";

export interface CreatorPost {
  id: string;
  creatorId: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  channelName: string;
  description: string | null;
  bannerUrl: string | null;
  profileImage: string | null;
  totalEarnings: number;
  withdrawnAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicChannelData extends CreatorProfile {
  series?: Array<{
    id: string;
    title: string;
    slug: string;
    coverUrl?: string | null;
    type: string;
    status: string;
    rating: number;
    totalViews: number;
    _count?: {
      chapters: number;
      bookmarks: number;
    };
  }>;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    createdAt: string;
    creatorPosts?: CreatorPost[];
    createdPromoCodes?: Array<{
      id: string;
      code: string;
      pointsReward: number;
      discountPercent: number;
      expiresAt: string | null;
    }>;
  };
}

export interface FeaturedRequestItem {
  id: string;
  seriesId: string;
  creatorId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  series: {
    id: string;
    title: string;
    slug: string;
    coverUrl?: string | null;
  };
  creator?: {
    id: string;
    name: string;
    image?: string;
    email?: string;
  };
}

export interface OverviewStats {
  totalSeries: number;
  totalChapters: number;
  totalViews: number;
  totalBookmarks: number;
  totalReviews: number;
  totalRevenue: number;
}

export interface SeriesStat {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  type: string;
  status: string;
  totalViews: number;
  rating: number;
  earnings: number;
  bookmarkRate: number;
  daysSinceUpdate: number;
  attentionStatus: "TRENDING" | "STEADY" | "NEEDS_ATTENTION" | "NEW";
  attentionReason: string;
  createdAt: string;
  updatedAt: string;
  chapters?: {
    id: string;
    number: number;
    title: string | null;
    isLocked: boolean;
    coinCost: number;
    createdAt: string;
  }[];
  _count: {
    chapters: number;
    bookmarks: number;
    reviews: number;
  };
}

export interface RevenuePoint {
  date: string;
  points: number;
}

export interface AnalyticsData {
  overview: OverviewStats;
  series: SeriesStat[];
  revenueChart: RevenuePoint[];
}

export interface ChapterStat {
  id: string;
  number: number;
  title: string | null;
  isLocked: boolean;
  coinCost: number;
  createdAt: string;
  unlocksCount: number;
  earnings: number;
  commentsCount: number;
  readersCount: number;
}

export interface SingleSeriesAnalyticsData {
  series: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    bgUrl: string | null;
    type: string;
    status: string;
    totalViews: number;
    rating: number;
    genres: string[];
    createdAt: string;
    updatedAt: string;
    creator?: {
      id: string;
      name: string;
      image?: string | null;
    } | null;
    chaptersCount: number;
    bookmarksCount: number;
    reviewsCount: number;
  };
  metrics: {
    totalViews: number;
    totalChapters: number;
    totalBookmarks: number;
    bookmarkRate: number;
    totalEarnings: number;
    daysSinceUpdate: number;
    attentionStatus: "TRENDING" | "STEADY" | "NEEDS_ATTENTION" | "NEW";
    recommendations: string[];
  };
  chapters: ChapterStat[];
  revenueChart: { date: string; points: number }[];
  recentReviews: {
    id: string;
    rating: number;
    content: string | null;
    createdAt: string;
    user: { id: string; name: string; image?: string | null };
  }[];
}

export interface CreatorItem {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  points: number;
  banned: boolean;
  createdAt: string;
  channelId: string;
  channelName: string;
  channelDescription: string | null;
  channelBanner: string | null;
  totalEarnings: number;
  withdrawnAmount: number;
  seriesCount: number;
  totalChapters: number;
  totalViews: number;
  promoCodesCount: number;
}

export interface FetchOptions {
  revalidate?: number | false;
  cache?: RequestCache;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  statusCode?: number;
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

export const creatorService = {
  getPublicChannel: async (
    id: string,
    options?: FetchOptions
  ): Promise<ServiceResponse<PublicChannelData | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const nextOptions: any = { tags: [`CreatorChannel-${id}`] };
      if (options?.revalidate !== undefined) {
        nextOptions.revalidate = options.revalidate;
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/channel/${id}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: nextOptions,
        cache: options?.cache || (options?.revalidate ? undefined : "no-store"),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: null, statusCode: res.status, message: data?.message || "Failed to fetch creator channel" };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: null, statusCode: 500, message: "Failed to fetch creator channel" };
    }
  },

  getCreatorPosts: async (creatorId: string): Promise<ServiceResponse<CreatorPost[]>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/${creatorId}/posts`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: [`CreatorPosts-${creatorId}`] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], statusCode: res.status, message: data?.message || "Failed to fetch creator posts" };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: [], statusCode: 500, message: "Failed to fetch creator posts" };
    }
  },

  getProfile: async (): Promise<ServiceResponse<CreatorProfile | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/profile`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["CreatorProfile"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: null, statusCode: res.status, message: data?.message || "Failed to fetch creator profile" };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: null, statusCode: 500, message: "Failed to fetch creator profile" };
    }
  },

  getCreatorFeatureRequests: async (): Promise<ServiceResponse<FeaturedRequestItem[]>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/feature-requests`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["CreatorFeatureRequests"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], statusCode: res.status, message: data?.message || "Failed to fetch creator featured requests" };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: [], statusCode: 500, message: "Failed to fetch creator featured requests" };
    }
  },

  getAnalytics: async (): Promise<ServiceResponse<AnalyticsData | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/analytics`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["CreatorAnalytics"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: null, statusCode: res.status, message: data?.message || "Failed to fetch creator analytics" };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: null, statusCode: 500, message: "Failed to fetch creator analytics" };
    }
  },

  getSingleSeriesAnalytics: async (
    seriesId: string
  ): Promise<ServiceResponse<SingleSeriesAnalyticsData | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/series/${seriesId}/analytics`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: [`SeriesAnalytics-${seriesId}`] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: null, statusCode: res.status, message: data?.message || "Failed to fetch series analytics" };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: null, statusCode: 500, message: "Failed to fetch series analytics" };
    }
  },

  getAllCreators: async (params: { search?: string } = {}): Promise<ServiceResponse<CreatorItem[]>> => {
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
      if (params.search?.trim()) {
        searchParams.append("search", params.search.trim());
      }

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/admin/all${queryStr}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["AdminCreators"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], statusCode: res.status, message: data?.message || "Failed to fetch creators list" };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: [], statusCode: 500, message: "Failed to fetch creators list" };
    }
  },
};
