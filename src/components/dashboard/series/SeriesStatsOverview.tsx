"use client";

import React from "react";
import { Eye, Layers, Library, ShieldAlert, TrendingUp } from "lucide-react";

interface SeriesStatsOverviewProps {
  stats: {
    totalSeries: number;
    totalChapters: number;
    totalViews: number;
    ongoingCount: number;
    hiddenCount: number;
  };
  isModOrAdmin: boolean;
}

export function SeriesStatsOverview({ stats, isModOrAdmin }: SeriesStatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
          <Library className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Total Series</p>
          <p className="text-xl font-bold text-white tracking-tight">{stats.totalSeries}</p>
        </div>
      </div>

      <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Published Chapters</p>
          <p className="text-xl font-bold text-white tracking-tight">{stats.totalChapters}</p>
        </div>
      </div>

      <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Total Views</p>
          <p className="text-xl font-bold text-white tracking-tight">{stats.totalViews.toLocaleString()}</p>
        </div>
      </div>

      <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3.5">
        {isModOrAdmin ? (
          <>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Hidden / Flagged</p>
              <p className="text-xl font-bold text-white tracking-tight">{stats.hiddenCount}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active / Ongoing</p>
              <p className="text-xl font-bold text-white tracking-tight">{stats.ongoingCount}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
