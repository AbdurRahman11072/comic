import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { SeriesDetailContent } from "@/components/series/SeriesDetailContent";
import { seriesService } from "@/services/series.service";
import { type Series } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;
  const res = await seriesService.getSeriesBySlug(slug);
  const series = res?.data as Series | null;

  if (!series) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-foreground/50">Series not found</h1>
        </main>
        <Footer />
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
    lastUpdate: "Just now", // In a real app, this would be formatted from updatedAt
    genres: series.genres.map((g: any) => g.name),
    chapters: (series.chapters || []).map((c: any) => ({
        id: c.id,
        number: c.number,
        title: c.title || `Chapter ${c.number}`,
        date: new Date(c.createdAt).toLocaleDateString(),
        isLocked: c.isLocked,
        isPurchased: c.isPurchased,
        coinCost: c.coinCost
    })).sort((a: any, b: any) => b.number - a.number)
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 relative">
        <SeriesDetailContent series={mappedSeries as any} />
      </main>
      <Footer />
    </div>
  );
}
