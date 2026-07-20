import { env } from "@/env";

export const seriesService = {
  getAllSeries: async (params: any = {}) => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const url = `${env.NEXT_PUBLIC_API_URL}/api/v1/series?${searchParams.toString()}`;
      const res = await fetch(url, {
        next: { tags: ["AllSeries"] },
        cache: "no-store",
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, data: [], meta: { total: 0, page: 1, limit: 10 } };
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: "Something went wrong",
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      };
    }
  },

  getSeriesBySlug: async (slug: string) => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (e) {
        // Ignored if called from client
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/${slug}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        next: { tags: [`Series-${slug}`] },
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: "Failed to fetch series details" };
    }
  },

  getPinnedSeries: async () => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/pinned`, {
        next: { tags: ["PinnedSeries"] },
        cache: "no-store",
      });
      if (!res.ok) return { success: false, data: [] };
      const data = await res.json();
      return { success: true, data: data?.data ?? [] };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getDiscountedSeries: async () => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/discounted`, {
        next: { tags: ["DiscountedSeries"] },
        cache: "no-store",
      });
      if (!res.ok) return { success: false, data: [] };
      const data = await res.json();
      return { success: true, data: data?.data ?? [] };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getFeaturedSeries: async () => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/featured`, {
        next: { tags: ["FeaturedSeries"] },
        cache: "no-store",
      });
      if (!res.ok) return { success: false, data: [] };
      const data = await res.json();
      return { success: true, data: data?.data ?? [] };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getSeriesList: async () => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series?limit=100`);
      const data = await res.json();
      if (!res.ok) return { data: [] };
      return {
        data: data.data.map((s: any) => ({ id: s.id, title: s.title }))
      };
    } catch (error) {
      return { data: [] };
    }
  },
  getSeriesById: async (id: string) => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/id/${id}`);
      const data = await res.json();
      if (!res.ok) return { success: false, data: null };
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, data: null };
    }
  }
};
