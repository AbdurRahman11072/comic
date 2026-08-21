import { env } from "@/env";

export interface ChapterFilterParams {
  page?: number;
  limit?: number;
  seriesId?: string;
  creatorId?: string;
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

export const chapterService = {
  getAllChapters: async (params: ChapterFilterParams = {}): Promise<ServiceResponse<any[]>> => {
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

      const url = `${env.NEXT_PUBLIC_API_URL}/api/v1/chapters?${searchParams.toString()}`;
      // Known debt: no-store and next.tags are both set; caching strategy will be unified in Phase 2
      const res = await fetch(url, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["AllChapters"] },
        cache: "no-store",
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, data: [], message: data?.message || "Failed to fetch chapters" };
      }
      return data;
    } catch (_error) {
      return {
        success: false,
        message: "Something went wrong",
        data: [],
      };
    }
  },

  getChapterByNumber: async (slug: string, number: number): Promise<ServiceResponse<any | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/chapters/${slug}/${number}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: [`Chapter-${slug}-${number}`] },
        cache: "no-store",
      });
      const data = await res.json();
      return data;
    } catch (_error) {
      return { success: false, data: null, message: "Failed to fetch chapter details" };
    }
  },

  getChapterById: async (id: string): Promise<ServiceResponse<any | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const url = `${env.NEXT_PUBLIC_API_URL}/api/v1/chapters/${id}`;
      // Known debt: no-store and next.tags are both set; caching strategy will be unified in Phase 2
      const res = await fetch(url, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: [`Chapter-${id}`] },
        cache: "no-store",
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, data: null, message: data?.message || "Failed to fetch chapter" };
      }
      return data;
    } catch (_error) {
      return { success: false, data: null, message: "Failed to fetch chapter" };
    }
  },

  extractWebpageImages: async (url: string): Promise<ServiceResponse<{ images: string[] }>> => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/chapters/extract-webpage-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      return data;
    } catch (_error) {
      return { success: false, data: { images: [] }, message: "Failed to extract images from webpage" };
    }
  },
};
