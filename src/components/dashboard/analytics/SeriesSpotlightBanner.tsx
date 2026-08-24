"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Flame, Lightbulb } from "lucide-react";

interface SeriesSpotlightBannerProps {
  selectedSeries: any;
}

export function SeriesSpotlightBanner({ selectedSeries }: SeriesSpotlightBannerProps) {
  if (!selectedSeries) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent border border-primary/20 p-6 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-22 rounded-xl bg-white/10 border border-white/10 bg-center bg-cover shrink-0 shadow-xl"
            style={{
              backgroundImage: selectedSeries.coverUrl
                ? `url(${selectedSeries.coverUrl})`
                : undefined,
            }}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-white">
                {selectedSeries.type || "MANHWA"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">
                {selectedSeries.status}
              </span>
              {selectedSeries.attentionStatus === "NEEDS_ATTENTION" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Needs Attention
                </span>
              ) : selectedSeries.attentionStatus === "TRENDING" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Flame className="w-3 h-3" /> High Engagement
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Stable Performance
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{selectedSeries.title}</h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span>Updated {selectedSeries.daysSinceUpdate ?? 1} days ago</span>
              <span>•</span>
              <span>
                {selectedSeries._count?.chapters ?? selectedSeries.chaptersCount ?? 0} Chapters
                published
              </span>
            </p>
          </div>
        </div>

        {/* Diagnostic Note Box */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-md w-full">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white mb-0.5">Diagnostic Insight</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedSeries.attentionReason ||
                  "Performance is consistent with expected readership trends."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
