import { env } from "@/env";

export interface UserFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
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

export const userService = {
  getUserSession: async () => {
    try {
      const forwardedHeaders: Record<string, string> = {};

      try {
        const { cookies, headers } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();
        if (cookieHeader) forwardedHeaders["Cookie"] = cookieHeader;

        const headerList = await headers();
        const proto = headerList.get("x-forwarded-proto") || "http";
        const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
        if (proto) forwardedHeaders["x-forwarded-proto"] = proto;
        if (host) {
          forwardedHeaders["x-forwarded-host"] = host;
          forwardedHeaders["host"] = host;
        }
      } catch (_e) {
        // Headers unavailable in client context
      }

      // Known debt: Better-Auth session query is called per-request; cache strategy will be unified in Phase 2
      const res = await fetch(
        `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/get-session`,
        {
          headers: forwardedHeaders,
          cache: "no-store",
        }
      );
      if (!res.ok) return null;
      const session = await res.json();
      return session;
    } catch (_error) {
      return null;
    }
  },

  getProfile: async (): Promise<ServiceResponse<any | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client browser
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/user/profile`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      return data;
    } catch (_error) {
      return { success: false, data: null, message: "Failed to fetch user profile" };
    }
  },

  getAllUsers: async (params: UserFilterParams = {}): Promise<ServiceResponse<any[]>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client browser
      }

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/user?${searchParams.toString()}`,
        {
          headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
          credentials: "include",
          next: { tags: ["AllUsers"] },
          cache: "no-store",
        }
      );
      const data = await res.json();
      return data;
    } catch (_error) {
      return { success: false, data: [], message: "Failed to fetch users" };
    }
  },

  getUserFinancialHistory: async (userId: string): Promise<ServiceResponse<any | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client browser
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/moderator/users/${userId}/financial-history`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      return data;
    } catch (_error) {
      return { success: false, data: null, message: "Failed to fetch financial history" };
    }
  },
};

