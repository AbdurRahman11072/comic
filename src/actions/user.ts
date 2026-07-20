"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export const ToggleBookmarkAction = async (seriesId: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/user/bookmarks/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify({ seriesId }),
    });

    const data = await res.json();
    if (data.success) {
      // Revalidate profile or bookmarks if needed
    }
    return data;
  } catch (error) {
    return { success: false, message: "Failed to toggle bookmark" };
  }
};

export const UpdateHistoryAction = async (seriesId: string, chapterId: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/user/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify({ seriesId, chapterId }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: "Failed to update history" };
  }
};

export const DeleteUserAction = async (userId: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/user/${userId}`, {
      method: "DELETE",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const data = await res.json();
    if (data.success) {
      (revalidateTag as any)("AllUsers");
    }
    return data;
  } catch (error) {
    return { success: false, message: "Failed to delete user" };
  }
};

export const UpdateUserAction = async (userId: string, updateData: Record<string, any>) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(updateData),
    });

    const data = await res.json();
    if (data.success) {
      (revalidateTag as any)("AllUsers");
    }
    return data;
  } catch (error) {
    return { success: false, message: "Failed to update user" };
  }
};

