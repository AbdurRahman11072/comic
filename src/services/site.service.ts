import { env } from "@/env";

export const siteService = {
  getSiteConfig: async () => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/site-config`, {
        next: { tags: ["SiteConfig"] },
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, data: null };
    }
  },
};
