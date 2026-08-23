import { SeriesClient } from "@/components/dashboard/series/SeriesClient";
import { seriesService } from "@/services/series.service";
import { userService } from "@/services/user.service";

export const metadata = {
  title: "Series & Studio Management | Dashboard",
  description: "Publish, edit, upload chapters, and track engagement across your comic catalog.",
};

export default async function SeriesManagementPage() {
  const session = await userService.getUserSession();
  const role = (session?.user as any)?.role?.toLowerCase() ?? "creator";

  const fetchParams: any = { limit: 100 };
  if (role === "creator" && session?.user?.id) {
    fetchParams.creatorId = session.user.id;
  }

  const res = await seriesService.getAllSeries(fetchParams);
  const series = (res?.success && Array.isArray(res.data)) ? res.data : [];

  return (
    <SeriesClient
      initialSeries={series}
      userRole={role}
      creatorId={session?.user?.id}
    />
  );
}

