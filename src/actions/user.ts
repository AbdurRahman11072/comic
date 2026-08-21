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
    if (res.ok && data.success) {
      (revalidateTag as any)("AllUsers");
      return data;
    }
    return { success: false, message: data?.message || "Failed to update user" };
  } catch (_error) {
    return { success: false, message: "Failed to update user" };
  }
};

export const UpdateUserProfileAction = async (updateData: { name?: string; image?: string }) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(updateData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("UserProfile");
      return data;
    }
    return { success: false, message: data?.message || "Failed to update profile" };
  } catch (_error) {
    return { success: false, message: "Failed to update profile" };
  }
};

export const BanUserAction = async (userId: string, payload: { banned?: boolean; banReason?: string; banExpires?: string | Date } = {}) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/moderator/users/${userId}/ban`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("AllUsers");
      return data;
    }
    return { success: false, message: data?.message || "Failed to update ban status" };
  } catch (_error) {
    return { success: false, message: "Failed to update ban status" };
  }
};

export const FreezeUserAction = async (userId: string, payload: { frozen?: boolean } = {}) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/moderator/users/${userId}/freeze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("AllUsers");
      return data;
    }
    return { success: false, message: data?.message || "Failed to update transaction freeze" };
  } catch (_error) {
    return { success: false, message: "Failed to update transaction freeze" };
  }
};

export const MuteUserAction = async (userId: string, payload: { durationHours?: number; unmute?: boolean } = {}) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/moderator/users/${userId}/mute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("AllUsers");
      return data;
    }
    return { success: false, message: data?.message || "Failed to mute user" };
  } catch (_error) {
    return { success: false, message: "Failed to mute user" };
  }
};


