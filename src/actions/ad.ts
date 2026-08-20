"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { CustomAdItem } from "@/services/ad.service";

export const RecordAdImpressionAction = async (adId: string) => {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/ads/${adId}/impression`, {
      method: "POST",
    });
    const data = await res.json();
    return data;
  } catch (_error) {
    return { success: false };
  }
};

export const RecordAdClickAction = async (adId: string) => {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/ads/${adId}/click`, {
      method: "POST",
    });
    const data = await res.json();
    return data;
  } catch (_error) {
    return { success: false };
  }
};

export const CreateAdminAdAction = async (payload: Partial<CustomAdItem>) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/ads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("Ads");
      (revalidateTag as any)("AdStats");
      if (payload.placement) {
        (revalidateTag as any)(`Ad-${payload.placement}`);
      }
      return data;
    }
    return { success: false, message: data?.message || "Failed to create ad" };
  } catch (_error) {
    return { success: false, message: "Failed to create ad" };
  }
};

export const UpdateAdminAdAction = async (adId: string, payload: Partial<CustomAdItem>) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/ads/${adId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("Ads");
      (revalidateTag as any)("AdStats");
      if (payload.placement) {
        (revalidateTag as any)(`Ad-${payload.placement}`);
      }
      return data;
    }
    return { success: false, message: data?.message || "Failed to update ad" };
  } catch (_error) {
    return { success: false, message: "Failed to update ad" };
  }
};

export const DeleteAdminAdAction = async (adId: string, placement?: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/ads/${adId}`, {
      method: "DELETE",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const data = await res.json();
    if (res.ok && (data.success || data.statusCode === 200)) {
      (revalidateTag as any)("Ads");
      (revalidateTag as any)("AdStats");
      if (placement) {
        (revalidateTag as any)(`Ad-${placement}`);
      }
      return { success: true, message: data?.message || "Ad deleted successfully" };
    }
    return { success: false, message: data?.message || "Failed to delete ad" };
  } catch (_error) {
    return { success: false, message: "Failed to delete ad" };
  }
};
