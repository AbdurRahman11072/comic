"use client";

import React from "react";
import { X } from "lucide-react";

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
  return (
    <div
      draggable={!isBusy}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
      className={`relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 group bg-black/40 cursor-grab active:cursor-grabbing transition-all duration-200 shadow-md ${
        isDragging
          ? "opacity-50 scale-95 ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "opacity-100 hover:ring-2 hover:ring-white/20 hover:scale-[1.02]"
      }`}
    >
      <img src={img.previewUrl} alt={`Page ${img.order}`} className="object-cover w-full h-full" />
      <div className="absolute top-1.5 left-1.5 bg-black/85 backdrop-blur-sm text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-md border border-white/10">
        #{img.order}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        disabled={isBusy}
        className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-lg disabled:hidden cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
