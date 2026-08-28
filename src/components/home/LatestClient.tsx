"use client";

import { useEffect, useState } from "react";
import { PosterCard } from "@/components/home/PosterCard";
import { type Series } from "@/types";
import { seriesService } from "@/services/series.service";
import { useLanguage } from "@/providers/LanguageProvider";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function LatestClient() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { language, setLanguage, languages } = useLanguage();
  const limit = 12;

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const res = await seriesService.getAllSeries({ sort: "latest", page, limit });
        setSeries(res.data || []);
        setTotal(res.meta?.total || res.pagination?.total || 0);
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
    <div className="relative overflow-hidden w-full">
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                Latest Series
                <span className="text-sm font-normal px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Updates
                </span>
              </h1>
              <p className="text-muted-foreground">Keep up with the most recent chapter releases.</p>
            </div>

            {/* Language Switcher Bar */}
            <div className="flex items-center gap-1 bg-neutral-900/60 p-1 rounded-full border border-white/10 backdrop-blur-md self-start md:self-auto flex-wrap">
              {languages.map((l) => {
                const isSelected = language.toLowerCase() === l.code.toLowerCase();
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white shadow-md shadow-primary/20 font-bold"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <FlagIcon code={l.code} className="w-3.5 h-2.5 rounded-[1px]" />
                    <span>{l.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-44 rounded-xl bg-white/5 animate-pulse" />
              ))
            ) : series.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground text-lg">
                No recent releases found.
              </div>
            ) : (
              series.map((s) => <PosterCard key={s.id} series={s} />)
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground px-3 font-mono">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}