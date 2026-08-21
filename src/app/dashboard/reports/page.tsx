import { communityService } from "@/services/community.service";
import { ReportsClient } from "@/components/dashboard/reports/ReportsClient";

export const metadata = {
  title: "Moderation & Reports Queue | Dashboard",
  description: "Review reported comments, reviews, series, and take immediate moderation action.",
};

export default async function ReportsManagementPage() {
  const res = await communityService.getReports({ status: "PENDING" });
  const reports = res.success && Array.isArray(res.data) ? res.data : [];

  return <ReportsClient initialReports={reports} initialStatus="PENDING" />;
}
