import { env } from "@/env";

export interface PointBalanceData {
  points: number;
  transactionsFrozen?: boolean;
  dailyAdViews?: number;
  dailyAdPointsEarned?: number;
}

export interface PointTransactionItem {
  id: string;
  userId?: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  user?: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
}

export interface TransactionsData {
  balance: number;
  transactionsFrozen?: boolean;
  enableCashOut?: boolean;
  pointToFiatRate?: number;
  minWithdrawalPoints?: number;
  payoutMethods?: string[];
  transactions: PointTransactionItem[];
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

export const pointsService = {
  getPointsBalance: async (): Promise<ServiceResponse<PointBalanceData | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Client context fallback
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/points/balance`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["Points", "User"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          data: null,
          statusCode: res.status,
          message: data?.message || "Failed to fetch points balance",
        };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return {
        success: false,
        data: null,
        statusCode: 500,
        message: "Failed to fetch points balance",
      };
    }
  },

  getTransactions: async (): Promise<ServiceResponse<TransactionsData | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Client context fallback
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/points/transactions`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["Transactions", "Points"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          data: null,
          statusCode: res.status,
          message: data?.message || "Failed to fetch transactions",
        };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return {
        success: false,
        data: null,
        statusCode: 500,
        message: "Failed to fetch transactions",
      };
    }
  },

  getAllTransactions: async (
    params: { page?: number; limit?: number; [key: string]: any } = {}
  ): Promise<ServiceResponse<PointTransactionItem[]>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Client context fallback
      }

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";

      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/user/admin/transactions${queryStr}`,
        {
          headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
          credentials: "include",
          next: { tags: ["Transactions", "Admin"] },
          cache: "no-store",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          data: [],
          statusCode: res.status,
          message: data?.message || "Failed to fetch admin transactions",
        };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return {
        success: false,
        data: [],
        statusCode: 500,
        message: "Failed to fetch admin transactions",
      };
    }
  },
};
