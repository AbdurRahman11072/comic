"use client";

import React from "react";
import { BookOpen, Layers } from "lucide-react";

interface ContentFormatGenreDistributionProps {
  contentFormatDistribution: Array<{
    name: string;
    count: number;
    views: number;
    color: string;
  }>;
  genreDistribution: Array<{
    name: string;
    seriesCount: number;
  }>;
}

export function ContentFormatGenreDistribution({
  contentFormatDistribution,
  genreDistribution,
}: ContentFormatGenreDistributionProps) {
  const totalFormatCount = contentFormatDistribution.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Content Formats */}
      <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5 text-purple-400" /> Series Format Distribution
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Breakdown of active titles and overall volume by comic medium.
          </p>
        </div>

        <div className="space-y-3">
          {contentFormatDistribution.map((item) => {
            const pct = totalFormatCount > 0 ? ((item.count / totalFormatCount) * 100).toFixed(0) : "0";
            return (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-white">{item.name}</span>
                  </div>
                  <div className="text-muted-foreground font-mono">
                    <span className="text-white font-semibold">{item.count} titles</span> ({item.views.toLocaleString()} views)
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Genres */}
      <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <Layers className="w-5 h-5 text-primary" /> Popular Genre Distribution
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Highest concentration of published titles across platform categories.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {genreDistribution.map((g) => (
            <div
              key={g.name}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center group hover:border-primary/30 transition"
            >
              <p className="text-xs font-bold text-white group-hover:text-primary transition truncate">
                {g.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                <span className="text-primary font-mono font-bold">{g.seriesCount}</span> series
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
