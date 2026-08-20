"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export const CreateChapterAction = async (payload: any) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/chapters`, {
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
      (revalidateTag as any)("AllSeries");
      return data;
    }
    return { success: false, message: data?.message || "Failed to create chapter" };
  } catch (_error) {
    return { success: false, message: "Failed to create chapter" };
  }
};

export const UpdateChapterAction = async (id: string, payload: any) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/chapters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("AllChapters");
      (revalidateTag as any)("AllSeries");
      return data;
    }
    return { success: false, message: data?.message || "Failed to update chapter" };
  } catch (_error) {
    return { success: false, message: "Failed to update chapter" };
  }
};

export const DeleteChapterAction = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/chapters/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const data = await res.json();
    if (res.ok && (data.success || data.statusCode === 200)) {
      (revalidateTag as any)("AllChapters");
      (revalidateTag as any)("AllSeries");
      return { success: true, message: data?.message || "Chapter deleted successfully" };
    }
    return { success: false, message: data?.message || "Failed to delete chapter" };
  } catch (_error) {
    return { success: false, message: "Failed to delete chapter" };
  }
};

