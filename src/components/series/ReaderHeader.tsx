"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, List, Settings } from "lucide-react";

interface ReaderHeaderProps {
  slug: string;
  chapter: any;
  showHeader: boolean;
  readerTheme: "dark" | "light" | "sepia" | "amoled";
  onOpenSettings: () => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateAll: () => void;
}

export function ReaderHeader({
  slug,
  chapter,
  showHeader,
  readerTheme,
  onOpenSettings,
  onNavigatePrev,
  onNavigateNext,
  onNavigateAll,
}: ReaderHeaderProps) {
  const headerThemeClasses = {
    dark: "bg-[#0a0a0a]/90 border-white/5 text-white",
    light: "bg-white/90 border-black/5 text-black",
    sepia: "bg-[#f4ecd8]/95 border-[#e4dcb8]/40 text-[#5c3a21]",
    amoled: "bg-black/90 border-white/5 text-white",
  };

  return (
    <div
      className={`sticky top-0 z-[100] backdrop-blur-md border-b px-4 py-3 transition-all duration-300 ease-in-out transform ${
        showHeader
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      } ${headerThemeClasses[readerTheme]}`}
    >
      <div className="max-w-[800px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <Link
              href={`/series/${slug}`}
              className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline truncate"
            >
              {chapter.series.title}
            </Link>
            <h1 className="text-sm font-bold truncate max-w-[160px] sm:max-w-[240px]">
              Chapter {chapter.number} {chapter.title && `- ${chapter.title}`}
            </h1>
          </div>

          {/* Channel Logo & Pill Link */}
          {chapter.series?.creator && (
            <Link
              href={`/channel/${
                chapter.series.creator.creatorProfile?.id || chapter.series.creator.id
              }`}
              className="flex items-center gap-2 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition group shrink-0"
              title={`Visit ${
                chapter.series.creator.creatorProfile?.channelName ||
                chapter.series.creator.name
              }'s Creator Channel`}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-primary/20 border border-white/10 shrink-0 flex items-center justify-center">
                {chapter.series.creator.creatorProfile?.profileImage ||
                chapter.series.creator.image ? (
                  <img
                    src={
                      (chapter.series.creator.creatorProfile?.profileImage ||
                        chapter.series.creator.image) as string
                    }
                    alt="Channel"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[9px] font-bold text-primary">
                    {(
                      chapter.series.creator.creatorProfile?.channelName ||
                      chapter.series.creator.name ||
                      "C"
                    ).charAt(0)}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-[11px] font-bold text-white group-hover:text-primary transition truncate max-w-[100px]">
                {chapter.series.creator.creatorProfile?.channelName ||
                  chapter.series.creator.name}
              </span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSettings}
            className="p-2 glass glass-hover rounded-lg hover:opacity-80 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-1" />
          <div className="flex items-center gap-1">
            <button
              disabled={!chapter.prevChapterNumber}
              onClick={onNavigatePrev}
              className="p-2 glass glass-hover rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNavigateAll}
              className="px-3 py-2 glass glass-hover rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <List className="w-4 h-4 opacity-70" />
              <span className="text-xs font-bold hidden sm:inline">All Chapters</span>
            </button>
            <button
              disabled={!chapter.nextChapterNumber}
              onClick={onNavigateNext}
              className="p-2 glass glass-hover rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
