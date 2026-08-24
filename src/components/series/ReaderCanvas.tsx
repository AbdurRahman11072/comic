"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Loader2, Lock } from "lucide-react";

interface ReaderCanvasProps {
  chapter: any;
  readerMode: "scroll" | "page";
  imageWidth: number;
  currentPage: number;
  buying: boolean;
  onPageChange: (page: number) => void;
  onBuyChapter: () => void;
}

export function ReaderCanvas({
  chapter,
  readerMode,
  imageWidth,
  currentPage,
  buying,
  onPageChange,
  onBuyChapter,
}: ReaderCanvasProps) {
  const images = chapter.images || [];

  return (
    <div className="max-w-[900px] w-full flex flex-col items-center px-4">
      {images.length > 0 ? (
        readerMode === "scroll" ? (
          images.map((img: any) => (
            <img
              key={img.id}
              src={img.url}
              alt={`Page ${img.order}`}
              className="h-auto object-contain select-none pointer-events-none transition-all duration-300"
              style={{ width: `${imageWidth}%` }}
              loading="lazy"
            />
          ))
        ) : (
          // Page Mode
          <div className="w-full flex flex-col items-center space-y-6">
            <div className="relative w-full flex items-center justify-center group min-h-[400px]">
              {/* Prev Overlay Button */}
              <button
                disabled={currentPage === 0}
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                className="absolute left-0 top-0 bottom-0 w-[15%] bg-gradient-to-r from-black/25 to-transparent flex items-center justify-start pl-4 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed z-10 cursor-pointer"
              >
                <ChevronLeft className="w-10 h-10 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
              </button>

              <img
                src={images[currentPage]?.url}
                alt={`Page ${currentPage + 1}`}
                className="h-auto object-contain select-none pointer-events-none transition-all duration-300"
                style={{ width: `${imageWidth}%` }}
              />

              {/* Next Overlay Button */}
              <button
                disabled={currentPage === images.length - 1}
                onClick={() => onPageChange(Math.min(images.length - 1, currentPage + 1))}
                className="absolute right-0 top-0 bottom-0 w-[15%] bg-gradient-to-l from-black/25 to-transparent flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed z-10 cursor-pointer"
              >
                <ChevronRight className="w-10 h-10 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
              </button>
            </div>

            {/* Page Counter UI */}
            <div className="flex items-center gap-4 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-xs font-bold shadow-lg">
              <button
                disabled={currentPage === 0}
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                className="hover:text-primary transition-colors disabled:opacity-30 cursor-pointer"
              >
                Prev
              </button>
              <span className="opacity-80">
                Page {currentPage + 1} of {images.length}
              </span>
              <button
                disabled={currentPage === images.length - 1}
                onClick={() => onPageChange(Math.min(images.length - 1, currentPage + 1))}
                className="hover:text-primary transition-colors disabled:opacity-30 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )
      ) : chapter.isLocked && !chapter.isPurchased ? (
        <div className="py-20 flex flex-col items-center text-center space-y-6 w-full">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
            <Lock className="w-10 h-10 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Chapter Locked</h2>
            <p className="text-white/60 max-w-md mx-auto">
              This chapter requires coins to unlock. Support the author by unlocking it now!
            </p>
          </div>
          <button
            onClick={onBuyChapter}
            disabled={buying}
            className="flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {buying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
            Unlock for {chapter.coinCost} Coins
          </button>
        </div>
      ) : (
        <div className="py-20 text-center text-white/30 space-y-4">
          <p>No images found for this chapter.</p>
        </div>
      )}
    </div>
  );
}
