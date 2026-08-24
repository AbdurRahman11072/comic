"use client";

import React from "react";
import { BarChart2, Eye, Layers, MousePointerClick } from "lucide-react";
import { AdStats } from "@/services/ad.service";

interface AdMetricsOverviewProps {
  stats: AdStats | null;
}

export function AdMetricsOverview({ stats }: AdMetricsOverviewProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="glass p-5 rounded-2xl border border-white/5 space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-primary" /> Total Placements
        </span>
        <div className="text-2xl font-bold text-white">
          {stats.activeAds}{" "}
          <span className="text-xs text-muted-foreground font-normal">
            / {stats.totalAds} active
          </span>
        </div>
      </div>

      <div className="glass p-5 rounded-2xl border border-white/5 space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-blue-400" /> Impressions
        </span>
        <div className="text-2xl font-bold text-white">
          {(stats.totalImpressions || 0).toLocaleString()}
        </div>
      </div>

      <div className="glass p-5 rounded-2xl border border-white/5 space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
          <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" /> Total Clicks
        </span>
        <div className="text-2xl font-bold text-white">
          {(stats.totalClicks || 0).toLocaleString()}
        </div>
      </div>

      <div className="glass p-5 rounded-2xl border border-white/5 space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5 text-amber-400" /> Avg. CTR
        </span>
        <div className="text-2xl font-bold text-amber-400">{stats.avgCtr || "0.00%"}</div>
      </div>
    </div>
  );
}
