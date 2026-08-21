"use server";

import { env } from "@/env";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

export async function ReviewSeriesApplicationAction(
  id: string,
  payload: { status: "APPROVED" | "REJECTED"; notes?: string }
) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/v1/moderator/series-applications/${id}/review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Failed to review series application",
        statusCode: res.status,
      };
    }

    revalidateTag("SeriesApplications", "max");
    revalidateTag("AllUsers", "max");
    revalidateTag("CreatorProfile", "max");
    revalidateTag("DashboardStats", "max");

    return {
      success: true,
      message: data.message || "Application reviewed successfully",
      data: data.data,
      statusCode: res.status,
    };
  } catch (_error) {
    return {
      success: false,
      message: "An unexpected error occurred while reviewing application",
      statusCode: 500,
    };
  }
}
