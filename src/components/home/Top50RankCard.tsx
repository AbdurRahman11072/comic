"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Bookmark, Eye, Flame, Sparkles, Star, Trophy } from "lucide-react";
import { type Series } from "@/types";
import { useLanguage } from "@/providers/LanguageProvider";

interface Top50RankCardProps {
  series: Series & { rank?: number; periodViews?: number };
  periodLabel: string;
}

export function Top50RankCard({ series, periodLabel }: Top50RankCardProps) {
  const { language } = useLanguage();
  const rank = series.rank || 1;

  const latestChapter = useMemo(() => {
    const allChapters = series.chapters || [];
    if (!allChapters.length) return null;
    const matching = allChapters.filter(
      (c) => ((c as any).language || "en").toLowerCase() === language.toLowerCase()
    );
    return matching[0] || allChapters[0];
  }, [series.chapters, language]);

  const getRankBadgeStyle = (r: number) => {
    if (r === 1) {
      return {
        bg: "bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-lg shadow-amber-500/40",
        border: "border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
        icon: <Trophy className="w-3.5 h-3.5 fill-black" />,
        text: "text-amber-400",
      };
    }
    if (r === 2) {
      return {
        bg: "bg-gradient-to-br from-slate-200 to-slate-400 text-black shadow-lg shadow-slate-400/30",
        border: "border-slate-300/40 shadow-[0_0_15px_rgba(203,213,225,0.1)]",
        icon: <Sparkles className="w-3 h-3 text-black" />,
        text: "text-slate-200",
      };
    }
    if (r === 3) {
      return {
        bg: "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-700/30",
        border: "border-amber-700/40 shadow-[0_0_15px_rgba(180,83,9,0.1)]",
        icon: <Flame className="w-3 h-3 text-white" />,
        text: "text-amber-500",
      };
    }
    return {
      bg: "bg-black/60 backdrop-blur-md text-white/90 border border-white/20",
      border: "border-white/5",
      icon: null,
      text: "text-white/70",
    };
  };

  const style = getRankBadgeStyle(rank);

  return (
    <div
      className={`relative group rounded-2xl glass p-2.5 border ${style.border} transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 flex flex-col h-full overflow-hidden`}
    >
      {/* Cover Image Container */}
      <Link href={`/series/${series.slug}`} className="block relative aspect-[0.74/1] rounded-xl overflow-hidden bg-white/5">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${series.coverUrl || "/placeholder-cover.jpg"})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Rank Badge */}
        <div
          className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 z-10 ${style.bg}`}
        >
          {style.icon}
          <span>#{rank}</span>
        </div>

        {/* Format Tag */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white/90 border border-white/10 z-10">
          {series.type}
        </div>

        {/* Period Views Banner at Bottom of Cover */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white z-10">
          <span className="flex items-center gap-1 font-bold text-amber-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
            <Eye className="w-3 h-3 text-amber-400" />
            {(series.periodViews || series.totalViews || 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1 font-bold text-yellow-400 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
            <Star className="w-3 h-3 fill-yellow-400" />
            {(series.rating || 0).toFixed(1)}
          </span>
        </div>
      </Link>

      {/* Series Details */}
      <div className="pt-2.5 px-0.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <Link
            href={`/series/${series.slug}`}
            className="font-bold text-xs sm:text-sm text-white hover:text-primary transition line-clamp-1 block"
            title={series.title}
          >
            {series.title}
          </Link>
          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
            {series.genres?.map((g: any) => g.name || g).join(", ") || "General"}
          </p>
        </div>

        {/* Latest Chapter & Bookmark Count */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
          {latestChapter ? (
            <Link
              href={`/series/${series.slug}/${latestChapter.number}${(latestChapter as any).language ? `?lang=${(latestChapter as any).language}` : ""}`}
              className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-2 py-0.5 rounded-md transition"
            >
              Ch. {latestChapter.number}{(latestChapter as any).language && (latestChapter as any).language !== "en" ? ` (${(latestChapter as any).language.toUpperCase()})` : ""}
            </Link>
          ) : (
            <span className="text-[10px] text-muted-foreground">Ongoing</span>
          )}

          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
            <Bookmark className="w-2.5 h-2.5 text-pink-400" />
            {series._count?.bookmarks || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
