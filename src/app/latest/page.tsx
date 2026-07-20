"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { PosterCard } from "@/components/home/PosterCard";
import { type Series } from "@/types";
import { seriesService } from "@/services/series.service";

export default function LatestSeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const res = await seriesService.getAllSeries({ sort: 'latest', page, limit });
        setSeries(res.data);
        setTotal(res.meta.total);
      } catch (error) {
        console.error("Failed to fetch latest updates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Atmosphere Blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                Latest Series
                <span className="text-sm font-normal px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Updates</span>
              </h1>
              <p className="text-muted-foreground">Keep up with the most recent chapter releases.</p>
            </div>
          </div>

          {/* Poster Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />
              ))
            ) : series.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                No updates found.
              </div>
            ) : (
              series.map((s) => (
                <PosterCard key={s.id} series={s} className="w-full" />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg glass glass-hover text-sm font-medium disabled:opacity-30 transition-opacity"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button 
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          page === p 
                            ? "bg-primary text-white font-bold" 
                            : "glass glass-hover text-sm"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-2 text-muted-foreground">...</span>}
                </div>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg glass glass-hover text-sm font-medium disabled:opacity-30 transition-opacity"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
