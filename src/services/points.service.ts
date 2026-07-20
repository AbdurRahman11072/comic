import { env } from "@/env";
import { cookies } from "next/headers";

export const pointsService = {
  getPoints: async () => {
    try {
      const cookieStore = await cookies();
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/points/balance`, {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      });
      const data = await res.json();
      return data.data;
    } catch (error) {
      return { points: 0 };
    }
  },

  getTransactions: async () => {
    try {
      const cookieStore = await cookies();
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/points/transactions`, {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      });
      const data = await res.json();
      return data.data;
    } catch (error) {
      return { balance: 0, transactions: [] };
    }
  },
  getAllTransactions: async (params: any = {}) => {
    try {
      const cookieStore = await cookies();
      const searchParams = new URLSearchParams(params);
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/user/admin/transactions?${searchParams.toString()}`, {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, data: [] };
    }
  }
};
