"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export interface ReviewWithdrawalPayload {
  status: "APPROVED" | "REJECTED";
  notes?: string;
}

export interface RequestWithdrawalPayload {
  pointsRequested: number;
  bankDetails: string;
}

export const RequestWithdrawalAction = async (payload: RequestWithdrawalPayload) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/withdrawals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("Withdrawals");
      (revalidateTag as any)("Points");
      (revalidateTag as any)("Transactions");
      (revalidateTag as any)("User");
      (revalidateTag as any)("UserPoints");
      return data;
    }
    return {
      success: false,
      message: data?.message || "Failed to submit withdrawal request",
    };
  } catch (_error) {
    return {
      success: false,
      message: "Failed to submit withdrawal request",
    };
  }
};

export const ReviewWithdrawalAction = async (
  id: string,
  payload: ReviewWithdrawalPayload
) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/v1/moderator/withdrawals/${id}/review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("Withdrawals");
      (revalidateTag as any)("Points");
      (revalidateTag as any)("Transactions");
      (revalidateTag as any)("User");
      (revalidateTag as any)("UserPoints");
      (revalidateTag as any)("AllUsers");
      return data;
    }
    return {
      success: false,
      message: data?.message || "Failed to review withdrawal request",
    };
  } catch (_error) {
    return {
      success: false,
      message: "Failed to review withdrawal request",
    };
  }
};
