"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Archive, Download, Trash2 } from "lucide-react";
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
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Chapter Pages</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-primary/20 text-primary border border-primary/30">
            {pages.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pages.length > 0 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={onDownloadZip}
                className="text-xs text-primary hover:text-primary/80 hover:bg-primary/10 h-8 px-3 rounded-xl flex items-center gap-1.5 font-semibold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download ZIP
              </Button>
              <button
                type="button"
                onClick={onClearAll}
                disabled={isBusy}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition disabled:opacity-50 h-8 px-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pages Grid Display */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[440px] overflow-y-auto pr-1.5 custom-scrollbar">
        {pages.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground text-xs border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2.5">
            <Archive className="w-8 h-8 text-white/20" />
            <span className="font-medium">No pages added yet. Select an ingestion mode above.</span>
          </div>
        ) : (
          pages.map((img, idx) => (
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
          ))
        )}
      </div>

      {pages.length > 0 && (
        <div className="text-[11px] text-center text-muted-foreground flex items-center justify-between px-1 pt-1">
          <span>{pages.length} pages in reading order.</span>
          <span className="text-white/40">Drag page thumbnails to adjust sequence</span>
        </div>
      )}
    </div>
  );
}
