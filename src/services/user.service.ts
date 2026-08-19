import { env } from "@/env";
import { cookies, headers } from "next/headers";

export const userService = {
  getUserSession: async () => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();
      if (!cookieHeader) return null;

      const forwardedHeaders: Record<string, string> = {
        Cookie: cookieHeader,
      };

      try {
        const headerList = await headers();
        const proto = headerList.get("x-forwarded-proto") || "http";
        const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
        if (proto) forwardedHeaders["x-forwarded-proto"] = proto;
        if (host) {
          forwardedHeaders["x-forwarded-host"] = host;
          forwardedHeaders["host"] = host;
        }
      } catch {}

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
    } catch (error) {
      console.error("[userService.getUserSession] Error:", error);
      return null;
    }
  },

  getProfile: async () => {
    try {
      const cookieStore = await cookies();
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/user/profile`, {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return null;
    }
  },

  getAllUsers: async (params: any = {}) => {
    try {
      const cookieStore = await cookies();
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/user?${searchParams.toString()}`,
        {
          headers: {
            Cookie: cookieStore.toString(),
          },
          next: { tags: ["AllUsers"] },
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getAllTransactions: async (params: any = {}) => {
    try {
      const cookieStore = await cookies();
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/user/admin/transactions?${searchParams.toString()}`,
        {
          headers: {
            Cookie: cookieStore.toString(),
          },
          next: { tags: ["AllTransactions"] },
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, data: [] };
    }
  },
};
