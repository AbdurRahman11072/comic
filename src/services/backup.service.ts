import { env } from "@/env";

export interface BackupStats {
  usersCount: number;
  seriesCount: number;
  chaptersCount: number;
  commentsCount: number;
  transactionsCount: number;
  reportsCount: number;
  promosCount: number;
  auditLogsCount: number;
  timestamp: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  statusCode?: number;
  message?: string;
}

export const backupService = {
  getStats: async (): Promise<ServiceResponse<BackupStats | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/admin/backup/stats`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["BackupStats"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: null, statusCode: res.status, message: data?.message || "Failed to fetch backup stats" };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: null, statusCode: 500, message: "Failed to fetch backup stats" };
    }
  },
};
