"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export const EarnFromAdAction = async (amount: number = 10) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/points/earn-ad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
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
    if (data.success) {
      (revalidateTag as any)("AllChapters");
    }
    return data;
  } catch (error) {
    return { success: false, message: "Failed to buy chapter" };
  }
};
