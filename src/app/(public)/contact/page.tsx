import { siteService } from "@/services/site.service";
import { ContactClient } from "@/components/contact/ContactClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const configRes = await siteService.getSiteConfig();
  const appName = configRes?.data?.appName || "Comic BD";
  return {
    title: `Contact Us & Customer Support — ${appName}`,
    description: `Get in touch with the ${appName} team for reader support, creator serializations, business partnerships, or DMCA inquiries.`,
  };
}

export default async function ContactPage() {
  const configRes = await siteService.getSiteConfig();
  const config = configRes?.data || {};

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-12 space-y-12">
      <ContactClient config={config} />
    </div>
  );
}
