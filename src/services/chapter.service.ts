import { env } from "@/env";
import { cookies } from "next/headers";

export const chapterService = {
  getAllChapters: async (params: any = {}) => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const url = `${env.NEXT_PUBLIC_API_URL}/api/v1/chapters?${searchParams.toString()}`;
      const res = await fetch(url, {
        next: { tags: ["AllChapters"] },
        cache: "no-store",
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, data: [] };
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: "Something went wrong",
        data: [],
      };
    }
  },

  getChapterByNumber: async (slug: string, number: number) => {
    try {
      const cookieStore = await cookies();
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/chapters/${slug}/${number}`, {
        headers: {
          Cookie: cookieStore.toString(),
        },
        next: { tags: [`Chapter-${slug}-${number}`] },
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: "Failed to fetch chapter details" };
    }
  },
  getChapterById: async (id: string) => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/chapters/${id}`);
      const data = await res.json();
      if (!res.ok) return { success: false, data: null };
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, data: null };
    }
  }
};
