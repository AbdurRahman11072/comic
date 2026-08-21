import { env } from "@/env";

export interface WithdrawalUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  points: number;
  dailyAdViews: number;
  dailyAdPointsEarned: number;
  totalAdViews?: number;
  totalAdPoints?: number;
  transactionsFrozen?: boolean;
  banned?: boolean;
  createdAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  queueIndex?: number;
  pointsRequested: number;
  fiatAmount: number;
  bankDetails: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes: string | null;
  createdAt: string;
  user: WithdrawalUser;
}

export interface WithdrawalMetaData {
  total: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  page: number;
  limit: number;
  rangeFrom?: number;
  rangeTo?: number;
  totalBatches?: number;
}

export interface WithdrawalFilterParams {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ALL" | string;
  search?: string;
  batchIndex?: number;
  batchSize?: number;
  rangeFrom?: number;
  rangeTo?: number;
  [key: string]: any;
}

export interface WithdrawalResponse {
  success: boolean;
  message?: string;
  data: WithdrawalRequest[];
  pagination?: WithdrawalMetaData;
}

export const withdrawalService = {
  getWithdrawalRequests: async (params: WithdrawalFilterParams = {}): Promise<WithdrawalResponse> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Handled in client context
      }

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/moderator/withdrawals?${searchParams.toString()}`,
        {
          headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
          credentials: "include",
          next: { tags: ["Withdrawals"] },
          cache: "no-store",
        }
      );

      const data = await res.json();
      return {
        success: data.success ?? res.ok,
        data: data.data || [],
        pagination: data.pagination,
        message: data.message,
      };
    } catch (_error) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch withdrawal requests",
      };
    }
  },
};
