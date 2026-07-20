"use client";

import { useEffect, useState } from "react";
import { AnnounceBanner } from "@/components/home/AnnounceBanner";
import { FilterTabs } from "@/components/home/FilterTabs";
import { Footer } from "@/components/home/Footer";
import { GridCard } from "@/components/home/GridCard";
import { HeroSlider } from "@/components/home/HeroSlider";
import { HSlider } from "@/components/home/HSlider";
import { Navbar } from "@/components/home/Navbar";
import { PosterCard } from "@/components/home/PosterCard";
import { SectionHeader } from "@/components/home/SectionHeader";
import { SocialRow } from "@/components/home/SocialRow";
import { type Series } from "@/types";
import { seriesService } from "@/services/series.service";

// SVG icons for section headers
const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M12 2L9 9H2l5.5 4-2 7L12 16l6.5 4-2-7L22 9h-7L12 2z" />
  </svg>
);

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 14l-4-4 4-4M15 10l4 4-4 4M14 6l-4 12" />
  </svg>
);

export default function HomePage() {
  const [pinned, setPinned] = useState<Series[]>([]);
  const [discounted, setDiscounted] = useState<Series[]>([]);
  const [latest, setLatest] = useState<Series[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Series[]>([]);
  const [completed, setCompleted] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use allSettled so a single failing API doesn't crash the entire page
        const [pinnedRes, discountedRes, latestRes, recentRes, completedRes] = await Promise.allSettled([
          seriesService.getPinnedSeries(),
          seriesService.getDiscountedSeries(),
          seriesService.getAllSeries({ sort: 'latest', limit: 6 }),
          seriesService.getAllSeries({ limit: 12 }),
          seriesService.getAllSeries({ status: 'COMPLETED', limit: 6 })
        ]);

        // Safe extraction — fulfilled results use .value; rejected results fall back to []
        const safeData = (result: PromiseSettledResult<any>) =>
          result.status === 'fulfilled' ? (result.value?.data ?? []) : [];

        setPinned(safeData(pinnedRes));
        setDiscounted(safeData(discountedRes));
        setLatest(safeData(latestRes));
        setRecentlyAdded(safeData(recentRes));
        setCompleted(safeData(completedRes));
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-[72rem] w-full mx-auto px-4 pb-12 relative z-10">
        <HeroSlider />
        <AnnounceBanner />
        <SocialRow />

        {/* ── PINNED SERIES ── */}
        {pinned.length > 0 && (
          <section className="mt-8">
            <SectionHeader
              title="Pinned Series"
              icon={<StarIcon />}
              viewAllHref="/latest"
            />
            <HSlider>
              {pinned.map((s) => (
                <PosterCard
                  key={s.id}
                  series={s}
                  className="w-[320px] flex-shrink-0"
                />
              ))}
            </HSlider>
          </section>
        )}

        {/* ── BULK DISCOUNTED ── */}
        {discounted.length > 0 && (
          <section className="mt-8">
            <SectionHeader
              title="Bulk Discounted Series"
              icon={<CodeIcon />}
            />
            <HSlider>
              {discounted.map((s) => (
                <GridCard
                  key={s.id}
                  series={s}
                  className="w-[180px] flex-shrink-0"
                />
              ))}
            </HSlider>
          </section>
        )}

        {/* ── LATEST UPDATES ── */}
        <section className="mt-8" id="latest">
          <SectionHeader title="Latest Updates" viewAllHref="/latest" />
          <FilterTabs />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />
              ))
            ) : (
              latest.map((s) => (
                <PosterCard key={s.id} series={s} className="w-full" />
              ))
            )}
          </div>
        </section>

        {/* ── RECENTLY ADDED ── */}
        <section className="mt-8">
          <SectionHeader title="Recently Added" viewAllHref="/series" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[0.74/1] rounded-xl bg-white/5 animate-pulse" />
              ))
            ) : (
              recentlyAdded.map((s) => (
                <GridCard key={s.id} series={s} />
              ))
            )}
          </div>
        </section>

        {/* ── COMPLETED SERIES ── */}
        <section className="mt-8">
          <SectionHeader title="Completed Series" viewAllHref="/series" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[0.74/1] rounded-xl bg-white/5 animate-pulse" />
              ))
            ) : (
              completed.map((s) => (
                <GridCard key={s.id} series={s} />
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
