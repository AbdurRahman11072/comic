import { SeriesClient } from "@/components/dashboard/series/SeriesClient";
import { seriesService } from "@/services/series.service";
import { userService } from "@/services/user.service";

export const metadata = {
  title: "Series & Content Management | Dashboard",
  description: "Publish, manage, moderate, and track engagement across the comic catalog.",
};

export default async function SeriesManagementPage() {
  const session = await userService.getUserSession();
  const role = (session?.user as any)?.role?.toLowerCase() ?? "creator";
  const isModOrAdmin = ["admin", "moderator"].includes(role);

  let series: any[] = [];
  let total = 0;

  if (isModOrAdmin) {
    const res = await seriesService.getAdminAllSeries({ page: 1, limit: 100, sort: "latest" });
    if (res?.success && Array.isArray(res.data)) {
      series = res.data;
      total = res.pagination?.total || res.meta?.total || series.length;
    }
  } else {
    const fetchParams: any = { limit: 100 };
    if (session?.user?.id) {
      fetchParams.creatorId = session.user.id;
    }
    const res = await seriesService.getAllSeries(fetchParams);
    if (res?.success && Array.isArray(res.data)) {
      series = res.data;
      total = res.pagination?.total || res.meta?.total || series.length;
    }
  }

  return (
    <SeriesClient
      initialSeries={series}
      initialTotal={total}
      userRole={role}
      creatorId={session?.user?.id}
    />
  );
}


