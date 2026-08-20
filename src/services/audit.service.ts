import { env } from "@/env";

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, any> | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

export interface AuditFilterParams {
  page?: number;
  limit?: number;
  action?: string;
  targetType?: string;
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

export const auditService = {
  getAuditLogs: async (params: AuditFilterParams = {}): Promise<ServiceResponse<AuditLog[]>> => {
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

      const url = `${env.NEXT_PUBLIC_API_URL}/api/v1/audit?${searchParams.toString()}`;
      // Known debt: no-store and next.tags are both set; caching strategy will be unified in Phase 2
      const res = await fetch(url, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["AuditLogs"] },
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, data: [], message: data?.message || "Failed to fetch audit logs" };
      }
      return data;
    } catch (_error) {
      return {
        success: false,
        message: "Failed to fetch audit logs",
        data: [],
      };
    }
  },
};
