"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export interface EarnFromAdPayload {
  amount?: number;
  adsCount?: number;
}

export const EarnFromAdAction = async (payload: EarnFromAdPayload | number = 10) => {
  try {
    const body = typeof payload === "number" ? { amount: payload } : payload;
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/points/earn-ad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("Points");
      (revalidateTag as any)("Transactions");
      (revalidateTag as any)("User");
      (revalidateTag as any)("UserPoints");
      return data;
    }
    return { success: false, message: data?.message || "Failed to earn points" };
  } catch (_error) {
    return { success: false, message: "Failed to earn points" };
  }
};

export const BuyChapterAction = async (chapterId: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/points/buy-chapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify({ chapterId }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("AllChapters");
      (revalidateTag as any)("Chapters");
      (revalidateTag as any)(`Chapter-${chapterId}`);
      (revalidateTag as any)("Points");
      (revalidateTag as any)("Transactions");
      (revalidateTag as any)("User");
      (revalidateTag as any)("UserPoints");
      (revalidateTag as any)("History");
      return data;
    }
    return { success: false, message: data?.message || "Failed to buy chapter" };
  } catch (_error) {
    return { success: false, message: "Failed to buy chapter" };
  }
};

export interface BuyBulkChaptersPayload {
  chapterIds: string[];
  promoCode?: string;
}

export const BuyBulkChaptersAction = async (payload: BuyBulkChaptersPayload) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/points/buy-bulk-chapters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("AllChapters");
      (revalidateTag as any)("Chapters");
      if (Array.isArray(payload.chapterIds)) {
        for (const id of payload.chapterIds) {
          (revalidateTag as any)(`Chapter-${id}`);
        }
      }
      (revalidateTag as any)("Points");
      (revalidateTag as any)("Transactions");
      (revalidateTag as any)("User");
      (revalidateTag as any)("UserPoints");
      (revalidateTag as any)("History");
      return data;
    }
    return { success: false, message: data?.message || "Failed to bulk unlock chapters" };
  } catch (_error) {
    return { success: false, message: "Failed to bulk unlock chapters" };
  }
};
