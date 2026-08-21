import { env } from "@/env";

export interface SeriesApplication {
  id: string;
  title: string;
  description: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  statusCode?: number;
  message?: string;
}

export const applicationService = {
  getSeriesApplications: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<SeriesApplication[]>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored in client context
      }

      const query = new URLSearchParams();
      if (params?.status) query.set("status", params.status);
      if (params?.page) query.set("page", params.page.toString());
      if (params?.limit) query.set("limit", params.limit.toString());

      const url = `${env.NEXT_PUBLIC_API_URL}/api/v1/moderator/series-applications${
        query.toString() ? `?${query.toString()}` : ""
      }`;

      const res = await fetch(url, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["SeriesApplications"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          data: [],
          statusCode: res.status,
          message: data?.message || "Failed to fetch applications",
        };
      }
      return {
        success: true,
        data: Array.isArray(data.data) ? data.data : [],
        statusCode: res.status,
        message: data.message,
      };
    } catch (_error) {
      return {
        success: false,
        data: [],
        statusCode: 500,
        message: "Failed to fetch applications",
      };
    }
  },
};
