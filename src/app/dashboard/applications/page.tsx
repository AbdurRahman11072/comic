import { applicationService } from "@/services/application.service";
import { SeriesApplicationsClient } from "@/components/dashboard/applications/SeriesApplicationsClient";

export const metadata = {
  title: "Series Applications | Dashboard",
  description: "Review and approve creator series publication applications.",
};

export default async function ApplicationsPage() {
  const res = await applicationService.getSeriesApplications();
  const applications = res.success && Array.isArray(res.data) ? res.data : [];

  return <SeriesApplicationsClient initialApplications={applications} />;
}
