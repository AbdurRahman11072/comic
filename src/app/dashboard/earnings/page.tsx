import { userService } from "@/services/user.service";
import { siteService } from "@/services/site.service";
import { EarningsClient } from "@/components/dashboard/earnings/EarningsClient";

export const metadata = {
  title: "Earnings & Referrals | Dashboard",
  description: "Manage your points, withdrawals, and refer friends to earn more.",
};

export default async function EarningsPage() {
  const [profileRes, configRes] = await Promise.all([
    userService.getProfile(),
    siteService.getSiteConfig(),
  ]);

  const profile = profileRes.success ? profileRes.data : null;
  const config = configRes.success ? configRes.data : null;

  return <EarningsClient initialProfile={profile} siteConfig={config} />;
}
