import { env } from "@/env";

export interface CreatorPost {
  id: string;
  creatorId: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface CreatorProfile {
  id: string;
  userId: string;
  channelName: string;
  channelDescription?: string | null;
  description?: string | null;
  channelBanner?: string | null;
  bannerUrl?: string | null;
  profileImage?: string | null;
  socialTwitter?: string | null;
  socialDiscord?: string | null;
  socialInstagram?: string | null;
  socialWebsite?: string | null;
  donationLink?: string | null;
  totalEarnings?: number;
  withdrawnAmount?: number;
  user?: {
    id: string;
    name: string;
    image: string | null;
    role: string;
    createdAt?: string;
  };
}

export interface PublicChannelData extends CreatorProfile {
  series?: any[];
  user?: {
    id: string;
    name: string;
    image: string | null;
    role: string;
    createdAt?: string;
    creatorPosts?: CreatorPost[];
    createdPromoCodes?: any[];
  };
}

export interface FeaturedRequestItem {
  id: string;
  seriesId: string;
  creatorId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  durationDays: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  series: {
    id: string;
    title: string;
    coverUrl?: string | null;
    slug?: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export interface CreatorItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  channelId: string;
  channelName: string;
  channelDescription: string | null;
  channelBanner: string | null;
  seriesCount: number;
  totalChapters: number;
  totalViews: number;
  points: number;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  statusCode?: number;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface OverviewStats {
  totalViews: number;
  totalSeries: number;
  totalChapters: number;
  totalLikes: number;
  totalComments: number;
  totalEarnings: number;
  recentViews: number;
  averageRating: number;
}

export interface SeriesStat {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  views?: number;
  totalViews?: number;
  chaptersCount?: number;
  likesCount?: number;
  rating: number;
  earnings: number;
  commentsCount?: number;
  status: string;
  type?: string;
  bookmarkRate?: number;
  daysSinceUpdate?: number;
  attentionStatus?: "TRENDING" | "STEADY" | "NEEDS_ATTENTION" | "NEW";
  attentionReason?: string;
  _count?: {
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
      email: string;
    };
  };
  overview: {
    totalViews: number;
    totalEarnings: number;
    totalUnlocks: number;
    totalChapters: number;
    totalComments: number;
    averageRating: number;
    freeChapters: number;
    lockedChapters: number;
  };
  chapters: ChapterStat[];
  revenueChart: RevenuePoint[];
}

export const creatorService = {
  getProfile: async (): Promise<ServiceResponse<CreatorProfile | null>> => {
    return creatorService.getCreatorProfile();
  },

  getCreatorProfile: async (): Promise<ServiceResponse<CreatorProfile | null>> => {
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

  getPublicChannel: async (id: string, fetchOptions?: any): Promise<ServiceResponse<PublicChannelData | null>> => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/channel/${id}`, {
        next: { tags: [`CreatorChannel-${id}`], ...(fetchOptions?.next || {}) },
        cache: fetchOptions?.cache || "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: null, statusCode: res.status, message: data?.message || "Failed to fetch channel" };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: null, statusCode: 500, message: "Failed to fetch channel" };
    }
  },

  getCreatorPosts: async (creatorId?: string): Promise<ServiceResponse<CreatorPost[]>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const url = creatorId
        ? `${env.NEXT_PUBLIC_API_URL}/api/v1/creators/${creatorId}/posts`
        : `${env.NEXT_PUBLIC_API_URL}/api/v1/creators/posts`;

      const tags = creatorId ? [`CreatorPosts-${creatorId}`] : ["CreatorPosts"];

      const res = await fetch(url, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags },
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

  getModeratorFeaturedRequests: async (params: { status?: string } = {}): Promise<ServiceResponse<FeaturedRequestItem[]>> => {
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
      if (params.status && params.status !== "ALL") {
        searchParams.append("status", params.status);
      }

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/moderator/featured-requests${queryStr}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["FeaturedRequests"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], statusCode: res.status, message: data?.message || "Failed to fetch moderator featured requests" };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: [], statusCode: 500, message: "Failed to fetch moderator featured requests" };
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
