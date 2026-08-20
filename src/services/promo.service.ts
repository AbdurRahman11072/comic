import { env } from "@/env";

export interface PromoCode {
  id: string;
  code: string;
  creatorId?: string | null;
  seriesId?: string | null;
  pointsReward: number;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  statusCode?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export const promoService = {
  getPromoCodes: async (
    query: { page?: number; limit?: number } = {}
  ): Promise<ServiceResponse<PromoCode[]>> => {
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
      if (query.page) searchParams.append("page", String(query.page));
      if (query.limit) searchParams.append("limit", String(query.limit));
      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/promo${queryStr}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["PromoCodes", "SiteConfig"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          data: [],
          statusCode: res.status,
          message: data?.message || "Failed to fetch promo codes",
        };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: [], statusCode: 500, message: "Failed to fetch promo codes" };
    }
  },
};
