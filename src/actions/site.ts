"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

import { SiteConfigData } from "@/services/site.service";

export const UpdateSiteConfigAction = async (payload: Partial<SiteConfigData>) => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/site-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      (revalidateTag as any)("SiteConfig");
      return data;
    }
    return { success: false, message: data?.message || "Failed to update site config" };
  } catch (_error) {
    return { success: false, message: "Failed to update site config" };
  }
};

export const SendContactMessageAction = async (payload: {
  name: string;
  email: string;
  category?: string;
  subject?: string;
  message: string;
}) => {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/site-config/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (_error) {
    return { success: false, message: "Failed to send contact message" };
  }
};
