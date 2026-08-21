import { creatorService } from "@/services/creator.service";
import { SeriesAnalyticsClient } from "@/components/dashboard/series/SeriesAnalyticsClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Series Analytics & Diagnostics | Dashboard",
  description: "Detailed engagement, chapter retention, and monetization diagnostics for this series.",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SeriesAnalyticsPage({ params }: Props) {
  const { id } = await params;
  const res = await creatorService.getSingleSeriesAnalytics(id);
  const data = res.success ? res.data : null;

  return (
    <Suspense
      fallback={
        <div className="py-32 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SeriesAnalyticsClient initialData={data} seriesId={id} />
    </Suspense>
  );
}
