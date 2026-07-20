import { SeriesTable } from "@/components/dashboard/SeriesTable";
import { seriesService } from "@/services/series.service";
import { userService } from "@/services/user.service";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function SeriesManagementPage() {
  const session = await userService.getUserSession();
  const role = (session?.user as any)?.role?.toLowerCase() ?? "";
  const canCreate = role === "creator";

  const fetchParams: any = { limit: 100 };
  if (role === "creator" && session?.user?.id) {
    fetchParams.creatorId = session.user.id;
  }

  const res = await seriesService.getAllSeries(fetchParams);
  const series = res?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Series Management</h1>
          <p className="text-sm text-muted-foreground">Catalog and manage all published content.</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/series/add">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Add New Series
            </button>
          </Link>
        )}
      </div>

      <SeriesTable initialSeries={series} userRole={role} />
    </div>
  );
}
