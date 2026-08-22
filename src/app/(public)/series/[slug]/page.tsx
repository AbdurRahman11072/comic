import type { Metadata } from "next";
import { SeriesDetailContent } from "@/components/series/SeriesDetailContent";
import { seriesService } from "@/services/series.service";
import { type Series } from "@/types";
import { constructMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await seriesService.getSeriesBySlug(slug);
    const series = res?.data as Series | null;
    if (series) {
      const genresList = series.genres?.map((g: any) => g.name) || [];
      return constructMetadata({
        title: `${series.title} — Read ${series.type?.toUpperCase()}`,
        description: series.description || `Read ${series.title} online for free. High quality translations updated regularly.`,
        image: series.coverUrl || undefined,
        keywords: [series.title, ...(series.altTitles ? series.altTitles.split(",") : []), ...genresList, series.type],
        type: "article",
      });
    }
  } catch (e) {
    // fallback
  }

  return constructMetadata({
    title: "Series Details",
    description: "Read popular manga, manhwa, and comics online.",
  });
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;
  const res = await seriesService.getSeriesBySlug(slug);
  const series = res?.data as Series | null;

  if (!series) {
    return (
      <div className="flex items-center justify-center py-32">
        <h1 className="text-2xl font-bold text-foreground/50">Series not found</h1>
      </div>
    );
  }

  // Map backend Series to SeriesDetailContent expected format if needed
  const mappedSeries = {
    ...series,
    id: series.id,
    isBookmarked: (series as any).isBookmarked,
    lastReadChapterNumber: (series as any).lastReadChapterNumber,
    favorites: (series._count as any)?.bookmarks || 0,
    chapterCount: (series._count as any)?.chapters || 0,
    lastUpdate: "Just now",
    genres: series.genres.map((g: any) => g.name),
    chapters: (series.chapters || []).map((c: any) => ({
      id: c.id,
      number: c.number,
      title: c.title || `Chapter ${c.number}`,
      date: new Date(c.createdAt).toLocaleDateString(),
      isLocked: c.isLocked,
      isPurchased: c.isPurchased,
      coinCost: c.coinCost,
    })).sort((a: any, b: any) => b.number - a.number),
  };

  return (
    <div className="relative w-full">
      <SeriesDetailContent series={mappedSeries as any} />
    </div>
  );
}
