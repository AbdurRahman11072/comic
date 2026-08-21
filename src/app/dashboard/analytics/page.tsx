import { creatorService } from "@/services/creator.service";
import { CreatorAnalyticsClient } from "@/components/dashboard/analytics/CreatorAnalyticsClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Series & Revenue Analytics | Dashboard",
  description: "Analyze engagement, reader retention, and actionable attention diagnostics.",
};

export default async function AnalyticsPage() {
  const res = await creatorService.getAnalytics();
  const data = res.success ? res.data : null;

  return (
    <Suspense
      fallback={
        <div className="py-32 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreatorAnalyticsClient initialData={data} />
    </Suspense>
  );
}
