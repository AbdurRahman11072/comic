import { seriesService } from "@/services/series.service";
import { AdminSeriesClient } from "@/components/dashboard/admin-series/AdminSeriesClient";

export const metadata = {
  title: "Series & Content Moderation | Dashboard",
  description: "Manage all platform series, monitor chapter counts, handle copyright/DMCA reports, and hide flagged content.",
};

export default async function AdminSeriesManagementPage() {
  const res = await seriesService.getAdminAllSeries({ page: 1, limit: 15, sort: "latest" });
  const seriesList = res.success && Array.isArray(res.data) ? res.data : [];
  const total = res.pagination?.total || res.meta?.total || 0;

  return <AdminSeriesClient initialSeries={seriesList} initialTotal={total} />;
}
