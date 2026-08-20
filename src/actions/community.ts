"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export const CreateCommentAction = async (payload: { chapterId: string; content: string }) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/community/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)(`Comments-${payload.chapterId}`);
      return data;
    }
    return { success: false, message: data?.message || "Failed to post comment" };
  } catch (_error) {
    return { success: false, message: "Failed to post comment" };
  }
};

export const DeleteCommentAction = async (commentId: string, chapterId?: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/community/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const data = await res.json();
    if (res.ok && (data.success || data.statusCode === 200)) {
      if (chapterId) {
        (revalidateTag as any)(`Comments-${chapterId}`);
      }
      return { success: true, message: data?.message || "Comment deleted successfully" };
    }
    return { success: false, message: data?.message || "Failed to delete comment" };
  } catch (_error) {
    return { success: false, message: "Failed to delete comment" };
  }
};

export const CreateReviewAction = async (payload: { seriesId: string; rating: number; content?: string }) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/community/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)(`Reviews-${payload.seriesId}`);
      (revalidateTag as any)(`Series-${payload.seriesId}`);
      (revalidateTag as any)("AllSeries");
      return data;
    }
    return { success: false, message: data?.message || "Failed to submit review" };
  } catch (_error) {
    return { success: false, message: "Failed to submit review" };
  }
};

export const DeleteReviewAction = async (reviewId: string, seriesId?: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/community/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const data = await res.json();
    if (res.ok && (data.success || data.statusCode === 200)) {
      if (seriesId) {
        (revalidateTag as any)(`Reviews-${seriesId}`);
        (revalidateTag as any)(`Series-${seriesId}`);
        (revalidateTag as any)("AllSeries");
      }
      return { success: true, message: data?.message || "Review deleted successfully" };
    }
    return { success: false, message: data?.message || "Failed to delete review" };
  } catch (_error) {
    return { success: false, message: "Failed to delete review" };
  }
};

export const SendChatMessageAction = async (payload: { content?: string; imageUrl?: string }) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/community/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("Chat");
      return data;
    }
    return { success: false, message: data?.message || "Failed to send chat message" };
  } catch (_error) {
    return { success: false, message: "Failed to send chat message" };
  }
};

export const DeleteChatMessageAction = async (messageId: string) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/community/chat/${messageId}`, {
      method: "DELETE",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const data = await res.json();
    if (res.ok && (data.success || data.statusCode === 200)) {
      (revalidateTag as any)("Chat");
      return { success: true, message: data?.message || "Chat message deleted successfully" };
    }
    return { success: false, message: data?.message || "Failed to delete chat message" };
  } catch (_error) {
    return { success: false, message: "Failed to delete chat message" };
  }
};

export const CreateReportAction = async (payload: {
  reason: string;
  targetType: "series" | "chapter" | "comment" | "review" | "user" | string;
  targetId: string;
}) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/community/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("Reports");
      return data;
    }
    return { success: false, message: data?.message || "Failed to submit report" };
  } catch (_error) {
    return { success: false, message: "Failed to submit report" };
  }
};

export const ResolveReportAction = async (
  reportId: string,
  payload: { status: "RESOLVED" | "DISMISSED" }
) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/v1/community/reports/${reportId}/resolve`,
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
      (revalidateTag as any)("Reports");
      return data;
    }
    return { success: false, message: data?.message || "Failed to resolve report" };
  } catch (_error) {
    return { success: false, message: "Failed to resolve report" };
  }
};



