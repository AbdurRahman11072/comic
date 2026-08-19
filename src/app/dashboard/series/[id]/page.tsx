import { seriesService } from "@/services/series.service";
import { userService } from "@/services/user.service";
import { SeriesDetailsView } from "@/components/dashboard/SeriesDetailsView";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DashboardSeriesDetailsPage({ params }: Props) {
  const { id } = await params;
  const [session, res] = await Promise.all([
    userService.getUserSession(),
    seriesService.getSeriesById(id),
  ]);

  const role = (session?.user as any)?.role?.toLowerCase() ?? "user";
  const series = res?.data || null;

  if (!series) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Series Not Found</h2>
        <p className="text-sm text-muted-foreground">The series you requested does not exist or has been deleted.</p>
        <Link href="/dashboard/series">
          <Button variant="secondary" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Series Management
          </Button>
        </Link>
      </div>
    );
  }

  return <SeriesDetailsView series={series} userRole={role} />;
}
