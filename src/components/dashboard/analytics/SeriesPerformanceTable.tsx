"use client";

import React from "react";
import Link from "next/link";

interface SeriesPerformanceTableProps {
  series: any[];
  selectedSeriesId: string;
  onSelectSeries: (id: string) => void;
}

export function SeriesPerformanceTable({
  series,
  selectedSeriesId,
  onSelectSeries,
}: SeriesPerformanceTableProps) {
  return (
    <div className="glass rounded-3xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold">Comprehensive Series Performance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any series row to inspect detailed metrics and retention rates.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider border-b border-white/5">
              <th className="pb-3 pr-4">Series Title</th>
              <th className="pb-3 px-4 text-center">Status</th>
              <th className="pb-3 px-4 text-center">Chapters</th>
              <th className="pb-3 px-4 text-center">Views</th>
              <th className="pb-3 px-4 text-center">Bookmarks</th>
              <th className="pb-3 px-4 text-center">Save Rate</th>
              <th className="pb-3 px-4 text-center">Earnings</th>
              <th className="pb-3 px-4 text-center">Health Status</th>
              <th className="pb-3 pl-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {series.map((s: any) => (
              <tr
                key={s.id}
                className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${
                  selectedSeriesId === s.id ? "bg-primary/5 border-primary/20" : ""
                }`}
              >
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-14 rounded-lg bg-white/5 border border-white/10 bg-center bg-cover shrink-0"
                      style={{ backgroundImage: s.coverUrl ? `url(${s.coverUrl})` : undefined }}
                    />
                    <div>
                      <Link
                        href={`/series/${s.slug}`}
                        className="font-semibold hover:text-primary transition truncate block max-w-[180px]"
                      >
                        {s.title}
                      </Link>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {s.type || "MANHWA"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-muted-foreground">
                    {s.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-center font-mono font-semibold">
                  {s._count?.chapters ?? s.chaptersCount ?? 0}
                </td>
                <td className="py-4 px-4 text-center font-mono font-semibold text-amber-400">
                  {(s.totalViews ?? s.views ?? 0).toLocaleString()}
                </td>
                <td className="py-4 px-4 text-center font-mono font-semibold text-pink-400">
                  {s._count?.bookmarks ?? s.likesCount ?? 0}
                </td>
                <td className="py-4 px-4 text-center font-mono font-semibold text-cyan-400">
                  {s.bookmarkRate ?? 0}%
                </td>
                <td className="py-4 px-4 text-center font-mono font-extrabold text-emerald-400">
                  {(s.earnings ?? 0).toLocaleString()} P
                </td>
                <td className="py-4 px-4 text-center">
                  {s.attentionStatus === "NEEDS_ATTENTION" ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      Needs Attention
                    </span>
                  ) : s.attentionStatus === "TRENDING" ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Trending 🔥
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Steady
                    </span>
                  )}
                </td>
                <td className="py-4 pl-4 text-right">
                  <button
                    onClick={() => onSelectSeries(s.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition border border-white/10 cursor-pointer"
                  >
                    Diagnose
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
