import { env } from "@/env";

export interface ReferredUser {
  id: string;
  name: string;
  image?: string | null;
  joinedAt: string;
  isActive: boolean;
}

export interface ReferralStatsData {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalPointsEarned: number;
  referralBonusPercent: number;
  referralActiveMonths: number;
  referralSignupBonus: number;
  recentReferrals: ReferredUser[];
}

export interface ReferralValidationData {
  valid: boolean;
  referrerName: string;
  referrerAvatar?: string | null;
  referralCode: string;
  signupBonusPoints: number;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  statusCode?: number;
  message?: string;
}

export const referralService = {
  getReferralStats: async (): Promise<ServiceResponse<ReferralStatsData | null>> => {
    try {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore.toString();
      } catch (_e) {
        // Ignored when called in client context
      }

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/referrals/stats`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        credentials: "include",
        next: { tags: ["Referrals", "Points", "User"] },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          data: null,
          statusCode: res.status,
          message: data?.message || "Failed to fetch referral stats",
        };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return { success: false, data: null, statusCode: 500, message: "Failed to fetch referral stats" };
    }
  },

  validateReferralCode: async (
    code: string
  ): Promise<ServiceResponse<ReferralValidationData | null>> => {
    try {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/referrals/validate/${encodeURIComponent(code)}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          data: null,
          statusCode: res.status,
          message: data?.message || "Invalid referral code",
        };
      }
      return { ...data, statusCode: res.status };
    } catch (_error) {
      return {
        success: false,
        data: null,
        statusCode: 500,
        message: "Failed to validate referral code",
      };
    }
  },
};
