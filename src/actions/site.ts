"use server";

import { env } from "@/env";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export const UpdateSiteConfigAction = async (payload: any) => {
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
    if (data.success) {
      (revalidateTag as any)("SiteConfig");
    }
    return data;
  } catch (error) {
    return { success: false, message: "Failed to update site config" };
  }
};
