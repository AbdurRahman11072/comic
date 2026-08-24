"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { AdBanner } from "@/components/ads/AdBanner";
import { CommentSection } from "@/components/series/CommentSection";

interface ReaderBottomNavProps {
  slug: string;
  chapter: any;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
}

export function ReaderBottomNav({
  slug,
  chapter,
  onNavigatePrev,
  onNavigateNext,
}: ReaderBottomNavProps) {
  return (
    <>
      {/* Bottom Navigation */}
      <div className="w-full max-w-[800px] mt-8 mb-20 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 glass rounded-2xl border border-white/5">
          <button
            disabled={!chapter.prevChapterNumber}
            onClick={onNavigatePrev}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass glass-hover text-white font-bold transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous Chapter
          </button>
          <div className="text-center">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">
              Finished Reading
            </p>
            <Link href={`/series/${slug}`} className="text-sm font-bold text-primary hover:underline">
              Back to series info
            </Link>
          </div>
          <button
            disabled={!chapter.nextChapterNumber}
            onClick={onNavigateNext}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            Next Chapter
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Creator Channel Spotlight Box */}
      {chapter.series?.creator && (
        <div className="w-full max-w-[800px] mb-8 px-4">
          <div className="p-5 glass rounded-2xl border border-white/10 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-primary/30 to-purple-500/30 border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
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
                  <span className="text-lg font-bold text-primary">
                    {(
                      chapter.series.creator.creatorProfile?.channelName ||
                      chapter.series.creator.name ||
                      "C"
                    ).charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white truncate">
                    {chapter.series.creator.creatorProfile?.channelName ||
                      chapter.series.creator.name}
                  </h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-primary/20 text-primary rounded-full border border-primary/30 shrink-0">
                    CREATOR
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {chapter.series.creator.creatorProfile?.description ||
                    "Read more series and creator announcements on this channel."}
                </p>
              </div>
            </div>

            <Link
              href={`/channel/${
                chapter.series.creator.creatorProfile?.id || chapter.series.creator.id
              }`}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span>Visit Channel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Reader Bottom Ad Banner */}
      <div className="w-full max-w-[800px] px-4">
        <AdBanner placement="reader_bottom" />
      </div>

      {/* Comment Section */}
      <CommentSection chapterId={chapter.id} />
    </>
  );
}
