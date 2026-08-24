import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { userService } from "@/services/user.service";
import { adminAnalyticsService } from "@/services/adminAnalytics.service";
import { creatorService } from "@/services/creator.service";
import { AdminAnalyticsClient } from "@/components/dashboard/admin-analytics/AdminAnalyticsClient";
import { CreatorAnalyticsClient } from "@/components/dashboard/analytics/CreatorAnalyticsClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Platform & Creator Analytics | Dashboard",
  description: "Live system telemetry, financial cash flow, reader retention, and performance diagnostics.",
};

export default async function AnalyticsPage() {
  const sessionData = await userService.getUserSession();
  const user = sessionData?.user;

  if (!user) {
    redirect("/");
  }

  const role = (user as any).role || "user";

  if (role === "admin" || role === "moderator") {
    const res = await adminAnalyticsService.getAnalytics("30d");
    const data = res.success ? res.data : null;

    return (
      <Suspense
        fallback={
          <div className="py-32 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <AdminAnalyticsClient initialData={data} />
      </Suspense>
    );
  }

  if (role === "creator") {
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

  redirect("/dashboard");
}
