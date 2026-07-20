"use client";

import { useEffect, useState, Suspense } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { GridCard } from "@/components/home/GridCard";
import { SeriesFilter } from "@/components/series/SeriesFilter";
import { type Series } from "@/types";
import { seriesService } from "@/services/series.service";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function SeriesContent() {
  const searchParams = useSearchParams();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 18;

  // Sync page state with URL if needed, or reset on filter change
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          searchTerm: searchParams.get("q") || undefined,
          type: searchParams.get("type") || undefined,
          status: searchParams.get("status") || undefined,
          genre: searchParams.get("genre") || undefined,
          sort: searchParams.get("sort") || "latest",
        };
        
        const res = await seriesService.getAllSeries(params);
        setSeries(res.data);
        setTotal(res.meta.total);
      } catch (error) {
        console.error("Failed to fetch series:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [page, searchParams]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Browse Series</h1>
        <p className="text-muted-foreground">Explore our vast library of manhwa, manga, and comics.</p>
      </div>

      {/* Filters */}
      <SeriesFilter />

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 min-h-[400px] relative">
        {loading && series.length === 0 ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[0.74/1] rounded-xl bg-white/5 animate-pulse" />
          ))
        ) : series.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="text-muted-foreground text-lg">No series found matching your filters.</div>
            <button 
              onClick={() => window.history.pushState(null, "", "/series")}
              className="text-primary hover:underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-xl">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {series.map((s) => (
              <GridCard key={s.id} series={s} />
            ))}
          </>
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
  );
}

export default function SeriesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
          <SeriesContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
