"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Archive, Download, FileImage, Layers, Trash2 } from "lucide-react";
import { ChapterPageItem, ChapterPageItemData } from "./ChapterPageItem";

interface ChapterPageGridProps {
  pages: ChapterPageItemData[];
  draggedItemIdx: number | null;
  isBusy: boolean;
  onDownloadZip: () => void;
  onClearAll: () => void;
  onDragStart: (idx: number) => void;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDrop: (idx: number) => void;
  onDragEnd: () => void;
  onRemovePage: (idx: number) => void;
}

export function ChapterPageGrid({
  pages,
  draggedItemIdx,
  isBusy,
  onDownloadZip,
  onClearAll,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemovePage,
}: ChapterPageGridProps) {
  return (
    <div className="space-y-4 pt-2">
      {/* Workspace Header Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Chapter Pages
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-primary/15 text-primary border border-primary/30 shadow-sm">
            {pages.length} {pages.length === 1 ? "Page" : "Pages"}
          </span>
        </div>

        {pages.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={onDownloadZip}
              className="text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary h-8 px-3 rounded-xl flex items-center gap-1.5 font-bold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download ZIP
            </Button>
            <button
              type="button"
              onClick={onClearAll}
              disabled={isBusy}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 h-8 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Pages Grid Display */}
      {pages.length === 0 ? (
        <div className="text-center py-16 px-4 text-muted-foreground text-xs border-2 border-dashed border-white/10 rounded-3xl bg-black/20 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
            <FileImage className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-white text-sm">No Pages Loaded</p>
            <p className="text-zinc-400 max-w-sm">
              Use the upload area above to add images, extract a ZIP archive, or scrape from a URL.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 max-h-[560px] overflow-y-auto pr-1.5 custom-scrollbar p-1">
            {pages.map((img, idx) => (
              <ChapterPageItem
                key={img.id}
                img={img}
                index={idx}
                isDragging={draggedItemIdx === idx}
                isBusy={isBusy}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
                onRemove={onRemovePage}
              />
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {pages.length} pages arranged in continuous webtoon/manga reading order.
            </span>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Drag tiles to reorder sequence
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
