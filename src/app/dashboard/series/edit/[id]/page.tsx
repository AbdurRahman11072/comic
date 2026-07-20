import { seriesService } from "@/services/series.service";
import { SeriesForm } from "@/components/series/SeriesForm";
import { type Series } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSeriesPage({ params }: Props) {
  const { id } = await params;
  const res = await seriesService.getSeriesById(id);
  const series = res?.data as Series | null;

  if (!series) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-bold text-red-500">Series Not Found</h2>
        <p className="text-muted-foreground">The series you're trying to edit does not exist.</p>
      </div>
    );
  }

  return <SeriesForm initialData={series} />;
}
