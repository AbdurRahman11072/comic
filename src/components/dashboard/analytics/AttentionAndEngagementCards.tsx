"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Flame,
  Plus,
} from "lucide-react";

interface AttentionAndEngagementCardsProps {
  attentionList: any[];
  topSeries: any[];
  onSelectSeries: (id: string) => void;
}

export function AttentionAndEngagementCards({
  attentionList,
  topSeries,
  onSelectSeries,
}: AttentionAndEngagementCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Needs Attention Card */}
      <div className="glass rounded-3xl p-6 border border-red-500/20 bg-gradient-to-b from-red-500/[0.03] to-transparent">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Series Needing Attention (
            {attentionList.length})
          </h2>
          <span className="text-[10px] text-muted-foreground">Action Recommended</span>
        </div>

        {attentionList.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            Great job! All series have regular uploads and healthy chapter counts.
          </div>
        ) : (
          <div className="space-y-3">
            {attentionList.map((s: any) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-red-500/30 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-14 rounded-lg bg-white/5 border border-white/10 bg-center bg-cover shrink-0"
                    style={{ backgroundImage: s.coverUrl ? `url(${s.coverUrl})` : undefined }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white truncate max-w-[180px]">
                      {s.title}
                    </h3>
                    <p className="text-[11px] text-red-400 font-medium mt-0.5 line-clamp-1">
                      {s.attentionReason}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/chapters/add?seriesId=${s.id}`}
                    className="px-2.5 py-1.5 rounded-xl bg-primary text-xs font-bold hover:opacity-90 transition flex items-center gap-1 shadow-md shadow-primary/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Chapter
                  </Link>
                  <button
                    onClick={() => onSelectSeries(s.id)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition text-xs font-semibold cursor-pointer"
                    title="Inspect series"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* High Engagement & Top Earners */}
      <div className="glass rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.03] to-transparent">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <Flame className="w-4 h-4 text-amber-400" /> High Engagement & Growth
          </h2>
          <span className="text-[10px] text-muted-foreground">Top Performing</span>
        </div>

        <div className="space-y-3">
          {topSeries.slice(0, 3).map((s: any, idx) => (
            <div
              key={s.id}
              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <div
                  className="w-10 h-14 rounded-lg bg-white/5 border border-white/10 bg-center bg-cover shrink-0"
                  style={{ backgroundImage: s.coverUrl ? `url(${s.coverUrl})` : undefined }}
                />
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-[180px]">{s.title}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="text-amber-400 font-mono font-semibold">
                      {(s.totalViews ?? s.views ?? 0).toLocaleString()} views
                    </span>
                    <span>•</span>
                    <span className="text-pink-400 font-mono font-semibold">
                      {s._count?.bookmarks ?? s.likesCount ?? 0} saves
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-emerald-400 font-mono">
                  {(s.earnings ?? 0).toLocaleString()} P
                </p>
                <p className="text-[10px] text-muted-foreground">Earnings</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
