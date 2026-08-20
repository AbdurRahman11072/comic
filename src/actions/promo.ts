"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export interface CreatePromoPayload {
  code: string;
  pointsReward?: number;
  discountPercent?: number;
  maxUses?: number;
  expiresAt?: string | null;
  seriesId?: string | null;
  creatorId?: string;
}

export interface RedeemPromoResponse {
  code: string;
  pointsAwarded: number;
  discountPercent: number;
  newBalance: number;
}

export const CreatePromoCodeAction = async (payload: CreatePromoPayload) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/promo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("PromoCodes");
      (revalidateTag as any)("SiteConfig");
      return data;
    }
    return { success: false, message: data?.message || "Failed to create promo code" };
  } catch (_error) {
    return { success: false, message: "Failed to create promo code" };
  }
};

export const DeletePromoCodeAction = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/promo/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const data = await res.json();
    if (res.ok && (data.success || data.statusCode === 200)) {
      (revalidateTag as any)("PromoCodes");
      (revalidateTag as any)("SiteConfig");
      return { success: true, message: data?.message || "Promo code deleted successfully" };
    }
    return { success: false, message: data?.message || "Failed to delete promo code" };
  } catch (_error) {
    return { success: false, message: "Failed to delete promo code" };
  }
};

export const RedeemPromoCodeAction = async (payload: { code: string }) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/promo/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("Points");
      (revalidateTag as any)("Transactions");
      (revalidateTag as any)("User");
      (revalidateTag as any)("UserPoints");
      (revalidateTag as any)("PromoCodes");
      return data;
    }
    return {
      success: false,
      message: data?.message || "Invalid or expired promo code",
    };
  } catch (_error) {
    return { success: false, message: "Failed to redeem promo code" };
  }
};
