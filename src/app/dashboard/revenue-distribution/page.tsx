import { adRevenueService } from "@/services/adRevenue.service";
import { siteService } from "@/services/site.service";
import { RevenueDistributionClient } from "@/components/dashboard/revenue/RevenueDistributionClient";

export const metadata = {
  title: "Reader Quality Revenue Distribution | Admin Dashboard",
  description:
    "Calculate, preview, and execute ad revenue points distributions based on Reader Quality Scores",
};

export default async function RevenueDistributionPage() {
  const [historyRes, siteConfigRes] = await Promise.all([
    adRevenueService.getHistory(1, 20),
    siteService.getSiteConfig(),
  ]);

  return (
    <RevenueDistributionClient
      initialHistory={historyRes.data || []}
      initialPagination={historyRes.meta || null}
      pointRate={siteConfigRes.data?.pointToFiatRate ?? 0.01}
    />
  );
}
