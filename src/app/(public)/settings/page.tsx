import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { constructMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "App Settings & Preferences",
    description: "Manage your reading language, notification preferences, reader mode, and account security on Comic BD.",
    keywords: ["settings", "preferences", "language", "reading mode", "notifications"],
    noIndex: true,
  });
}

export default function SettingsPage() {
  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
      <SettingsClient />
    </div>
  );
}
