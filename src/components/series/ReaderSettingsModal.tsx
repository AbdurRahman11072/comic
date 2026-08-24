"use client";

import React from "react";
import { X } from "lucide-react";

interface ReaderSettingsModalProps {
  open: boolean;
  readerMode: "scroll" | "page";
  readerTheme: "dark" | "light" | "sepia" | "amoled";
  imageWidth: number;
  onClose: () => void;
  onSetReaderMode: (mode: "scroll" | "page") => void;
  onSetReaderTheme: (theme: "dark" | "light" | "sepia" | "amoled") => void;
  onSetImageWidth: (width: number) => void;
}

export function ReaderSettingsModal({
  open,
  readerMode,
  readerTheme,
  imageWidth,
  onClose,
  onSetReaderMode,
  onSetReaderTheme,
  onSetImageWidth,
}: ReaderSettingsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[30] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Reader Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition text-white/50 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reading Mode */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
            Reading Mode
          </label>
          <div className="flex gap-2">
            {[
              { value: "scroll", label: "Webtoon (Scroll)" },
              { value: "page", label: "Paging (Click)" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSetReaderMode(opt.value as any)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  readerMode === opt.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Theme */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
            Color Theme
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: "dark", label: "Dark", bg: "bg-[#0a0a0a]", border: "border-white/10" },
              { value: "light", label: "Light", bg: "bg-white", border: "border-black/10" },
              { value: "sepia", label: "Sepia", bg: "bg-[#f4ecd8]", border: "border-[#e4dcb8]" },
              { value: "amoled", label: "AMOLED", bg: "bg-black", border: "border-white/10" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSetReaderTheme(opt.value as any)}
                className={`h-10 rounded-xl relative border flex items-center justify-center text-[10px] font-bold cursor-pointer ${
                  opt.bg
                } ${opt.border} ${readerTheme === opt.value ? "ring-2 ring-primary" : ""}`}
                style={{
                  color: opt.value === "light" || opt.value === "sepia" ? "#5c3a21" : "#fff",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image Width */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
              Image Width
            </label>
            <span className="text-xs font-bold text-primary">{imageWidth}%</span>
          </div>
          <div className="flex gap-2">
            {[50, 75, 100].map((width) => (
              <button
                key={width}
                onClick={() => onSetImageWidth(width)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  imageWidth === width
                    ? "bg-primary text-white border-primary"
                    : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                }`}
              >
                {width === 100 ? "Full" : `${width}%`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
