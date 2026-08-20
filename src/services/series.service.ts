import { env } from "@/env";

export interface SeriesFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  title?: string;
  sort?: string;
  type?: string;
  status?: string;
  genre?: string;
  genres?: string;
  creatorId?: string;
  isHidden?: string | boolean;
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

export const seriesService = {
  getAllSeries: async (params: SeriesFilterParams = {}): Promise<ServiceResponse<any[]>> => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const url = `${env.NEXT_PUBLIC_API_URL}/api/v1/series?${searchParams.toString()}`;
      // Known debt: cache: "no-store" bypasses Next.js Data Cache, making tags inert until caching strategy is unified in Phase 2
      const res = await fetch(url, {
        next: { tags: ["AllSeries"] },
        cache: "no-store",
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, data: [], meta: { total: 0, page: 1, limit: 10 } };
      }
      return data;
    } catch (_error) {
      return {
        success: false,
        message: "Something went wrong fetching series",
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      };
    }
  },

  getAdminAllSeries: async (params: SeriesFilterParams = {}): Promise<ServiceResponse<any[]>> => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client browser
      }

      const url = `${env.NEXT_PUBLIC_API_URL}/api/v1/series/admin/all?${searchParams.toString()}`;
      const res = await fetch(url, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, data: [], message: data?.message || "Failed to fetch admin series" };
      }
      return data;
    } catch (_error) {
      return {
        success: false,
        message: "Something went wrong fetching admin series catalog",
        data: [],
      };
    }
  },

  getSeriesBySlug: async (slug: string): Promise<ServiceResponse<any | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored if called from client
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/${slug}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        cache: "no-store",
        next: { tags: [`Series-${slug}`] },
      });
      const data = await res.json();
      return data;
    } catch (_error) {
      return { success: false, data: null, message: "Failed to fetch series details" };
    }
  },

  getPinnedSeries: async (): Promise<ServiceResponse<any[]>> => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/pinned`, {
        next: { tags: ["PinnedSeries"] },
        cache: "no-store",
      });
      if (!res.ok) return { success: false, data: [] };
      const data = await res.json();
      return { success: true, data: data?.data ?? [] };
    } catch (_error) {
      return { success: false, data: [] };
    }
  },

  getDiscountedSeries: async (): Promise<ServiceResponse<any[]>> => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/discounted`, {
        next: { tags: ["DiscountedSeries"] },
        cache: "no-store",
      });
      if (!res.ok) return { success: false, data: [] };
      const data = await res.json();
      return { success: true, data: data?.data ?? [] };
    } catch (_error) {
      return { success: false, data: [] };
    }
  },

  getFeaturedSeries: async (): Promise<ServiceResponse<any[]>> => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/featured`, {
        next: { tags: ["FeaturedSeries"] },
        cache: "no-store",
      });
      if (!res.ok) return { success: false, data: [] };
      const data = await res.json();
      return { success: true, data: data?.data ?? [] };
    } catch (_error) {
      return { success: false, data: [] };
    }
  },

  getSeriesList: async (): Promise<{ data: { id: string; title: string }[] }> => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series?limit=100`);
      const data = await res.json();
      if (!res.ok) return { data: [] };
      return {
        data: data.data.map((s: any) => ({ id: s.id, title: s.title }))
      };
    } catch (_error) {
      return { data: [] };
    }
  },

  getSeriesById: async (id: string): Promise<ServiceResponse<any | null>> => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/id/${id}`);
      const data = await res.json();
      if (!res.ok) return { success: false, data: null };
      return { success: true, data: data.data };
    } catch (_error) {
      return { success: false, data: null };
    }
  }
};

