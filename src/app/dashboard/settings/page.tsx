import { siteService } from "@/services/site.service";
import { SettingsClient } from "@/components/dashboard/SettingsClient";

export default async function SiteSettingsPage() {
  const res = await siteService.getSiteConfig();
  const config = res?.data;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Site Configuration</h1>
        <p className="text-sm text-muted-foreground">Manage global announcements and social media links.</p>
      </div>

      <SettingsClient initialConfig={config} />
    </div>
  );
}
