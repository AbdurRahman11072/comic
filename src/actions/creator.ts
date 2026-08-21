"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { CreatorProfile } from "@/services/creator.service";

export const CreateCreatorPostAction = async (payload: {
  title: string;
  content: string;
  imageUrl?: string;
  isPinned?: boolean;
}) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (data.data?.creatorId) {
        (revalidateTag as any)(`CreatorPosts-${data.data.creatorId}`);
        (revalidateTag as any)(`CreatorChannel-${data.data.creatorId}`);
      }
      return data;
    }
    return { success: false, message: data?.message || "Failed to create announcement" };
  } catch (_error) {
    return { success: false, message: "Failed to create announcement" };
  }
};

export const DeleteCreatorPostAction = async (id: string, creatorId?: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/posts/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const data = await res.json();
    if (res.ok && (data.success || data.statusCode === 200)) {
      if (creatorId) {
        (revalidateTag as any)(`CreatorPosts-${creatorId}`);
        (revalidateTag as any)(`CreatorChannel-${creatorId}`);
      }
      return { success: true, message: data?.message || "Announcement deleted successfully" };
    }
    return { success: false, message: data?.message || "Failed to delete announcement" };
  } catch (_error) {
    return { success: false, message: "Failed to delete announcement" };
  }
};

export const UpdateCreatorProfileAction = async (payload: Partial<CreatorProfile>) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("CreatorProfile");
      (revalidateTag as any)("UserProfile");
      (revalidateTag as any)("User");
      if (data.data?.id || data.data?.userId) {
        const id = data.data.userId || data.data.id;
        (revalidateTag as any)(`CreatorChannel-${id}`);
      }
      return data;
    }
    return { success: false, message: data?.message || "Failed to update creator profile" };
  } catch (_error) {
    return { success: false, message: "Failed to update creator profile" };
  }
};

export const RequestFeatureSeriesAction = async (payload: {
  seriesId: string;
  durationDays: number;
  notes?: string;
}) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/creators/feature-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("CreatorFeatureRequests");
      (revalidateTag as any)("FeaturedRequests");
      (revalidateTag as any)("UserPoints");
      return data;
    }
    return { success: false, message: data?.message || "Failed to submit feature request" };
  } catch (_error) {
    return { success: false, message: "Failed to submit feature request" };
  }
};

export const ReviewFeaturedRequestAction = async (
  id: string,
  payload: { status: "APPROVED" | "REJECTED"; notes?: string }
) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/v1/moderator/featured-requests/${id}/review`,
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
      (revalidateTag as any)("FeaturedRequests");
      (revalidateTag as any)("FeaturedSeries");
      (revalidateTag as any)("CreatorFeatureRequests");
      (revalidateTag as any)("UserPoints");
      return data;
    }
    return { success: false, message: data?.message || "Failed to review featured request" };
  } catch (_error) {
    return { success: false, message: "Failed to review featured request" };
  }
};
