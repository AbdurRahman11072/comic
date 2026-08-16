import { siteService } from "@/services/site.service";
import { SettingsClient } from "@/components/dashboard/SettingsClient";

export default async function SiteSettingsPage() {
  const res = await siteService.getSiteConfig();
  const config = res?.data;

  return (
    <div className="w-full">
      <SettingsClient initialConfig={config} />
    </div>
  );
}
