"use client";

import React from "react";
import { GripVertical, Trash2, X } from "lucide-react";

export interface ChapterPageItemData {
  id: string;
  file?: File;
  previewUrl: string;
  existingUrl?: string;
  order: number;
}

interface ChapterPageItemProps {
  img: ChapterPageItemData;
  index: number;
  isDragging: boolean;
  isBusy: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
  onRemove: (index: number) => void;
}

export function ChapterPageItem({
  img,
  index,
  isDragging,
  isBusy,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
}: ChapterPageItemProps) {
  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <div
      draggable={!isBusy}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
      className={`group relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 cursor-grab active:cursor-grabbing transition-all duration-300 shadow-lg ${
        isDragging
          ? "opacity-40 scale-95 ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "opacity-100 hover:ring-2 hover:ring-primary/50 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/10"
      }`}
    >
      {/* Page Image */}
      <img
        src={img.previewUrl}
        alt={`Page ${index + 1}`}
        className="object-cover w-full h-full select-none"
        loading="lazy"
      />

      {/* Ambient Gradient Overlays on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Top Left Sequence Badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-md text-white text-[11px] font-black px-2 py-0.5 rounded-lg border border-white/15 shadow-md">
        <span className="text-primary text-[10px]">#</span>
        <span>{formattedIndex}</span>
      </div>

      {/* Drag Indicator (Center/Top Right) */}
      <div className="absolute top-2 right-9 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 backdrop-blur-md p-1 rounded-md text-white/60">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Delete / Remove Action */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        disabled={isBusy}
        title="Remove this page"
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-white/70 hover:text-white border border-white/15 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md active:scale-90"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Bottom Order Bar */}
      <div className="absolute bottom-1.5 inset-x-2 flex items-center justify-between text-[10px] text-zinc-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="truncate max-w-[80px]">Page {index + 1}</span>
        <span className="text-zinc-400 font-mono text-[9px]">Drag to sort</span>
      </div>
    </div>
  );
}
