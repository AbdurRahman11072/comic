import { env } from "@/env";

export interface CommentUser {
  id: string;
  name: string;
  image: string | null;
}

export interface CommentItem {
  id: string;
  chapterId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: CommentUser;
}

export interface ReviewItem {
  id: string;
  seriesId: string;
  userId: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: CommentUser;
}

export interface ChatMessageItem {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    role: string;
  };
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reason: string;
  targetType: "series" | "chapter" | "comment" | "review" | "user" | string;
  targetId: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface ReportFilterParams {
  page?: number;
  limit?: number;
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

export const communityService = {
  getComments: async (
    chapterId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<ServiceResponse<CommentItem[]>> => {
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
      if (params.page) searchParams.append("page", String(params.page));
      if (params.limit) searchParams.append("limit", String(params.limit));

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/community/comments/${chapterId}${queryStr}`,
        {
          headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
          credentials: "include",
          next: { tags: [`Comments-${chapterId}`] },
          cache: "no-store",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], message: data?.message || "Failed to fetch comments" };
      }
      return data;
    } catch (_error) {
      return { success: false, data: [], message: "Failed to fetch comments" };
    }
  },

  getReviews: async (
    seriesId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<ServiceResponse<ReviewItem[]>> => {
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
      if (params.page) searchParams.append("page", String(params.page));
      if (params.limit) searchParams.append("limit", String(params.limit));

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/community/reviews/${seriesId}${queryStr}`,
        {
          headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
          credentials: "include",
          next: { tags: [`Reviews-${seriesId}`] },
          cache: "no-store",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], message: data?.message || "Failed to fetch reviews" };
      }
      return data;
    } catch (_error) {
      return { success: false, data: [], message: "Failed to fetch reviews" };
    }
  },

  getChatMessages: async (): Promise<ServiceResponse<ChatMessageItem[]>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/community/chat`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["Chat"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], message: data?.message || "Failed to fetch chat messages" };
      }
      return data;
    } catch (_error) {
      return { success: false, data: [], message: "Failed to fetch chat messages" };
    }
  },

  getReports: async (
    params: ReportFilterParams = {}
  ): Promise<ServiceResponse<ReportItem[]>> => {
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
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/community/reports${queryStr}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["Reports"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], message: data?.message || "Failed to fetch reports" };
      }
      return data;
    } catch (_error) {
      return { success: false, data: [], message: "Failed to fetch reports" };
    }
  },
};

