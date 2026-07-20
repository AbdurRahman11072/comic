"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache"; 
import { cookies } from "next/headers";

export const CreateSeriesAction = async (payload: any) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      (revalidateTag as any)("AllSeries");
    }
    return data;
  } catch (error) {
    return { success: false, message: "Failed to create series" };
  }
};

export const UpdateSeriesAction = async (id: string, payload: any) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      (revalidateTag as any)("AllSeries");
      if (data.data?.slug) {
        (revalidateTag as any)(`Series-${data.data.slug}`);
      }
    }
    return data;
  } catch (error) {
    return { success: false, message: "Failed to update series" };
  }
};

export const DeleteSeriesAction = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const data = await res.json();
    if (res.ok) {
      (revalidateTag as any)("AllSeries");
      return { success: true };
    }
    return data;
  } catch (error) {
    return { success: false, message: "Failed to delete series" };
  }
};

export const ToggleFeaturedAction = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/series/${id}/toggle-featured`, {
      method: "POST",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const data = await res.json();
    if (data.success) {
      (revalidateTag as any)("FeaturedSeries");
      (revalidateTag as any)("AllSeries");
    }
    return data;
  } catch (error) {
    return { success: false, message: "Failed to toggle featured status" };
  }
};
