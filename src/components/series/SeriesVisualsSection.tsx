"use client";

import React from "react";
import { Image as ImageIcon, Trash2, UploadCloud } from "lucide-react";

interface SeriesVisualsSectionProps {
  coverPreview: string;
  bgPreview: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, field: "coverUrl" | "bgUrl") => void;
  onRemoveCover: (e: React.MouseEvent) => void;
  onRemoveBg: (e: React.MouseEvent) => void;
}

export function SeriesVisualsSection({
  coverPreview,
  bgPreview,
  onFileSelect,
  onRemoveCover,
  onRemoveBg,
}: SeriesVisualsSectionProps) {
  return (
    <div className="md:col-span-5 space-y-6 glass p-6 sm:p-8 rounded-3xl border border-white/5">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-primary" /> Cover & Visuals
      </h2>

      {/* Cover Upload Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Cover Poster (3:4)
          </label>
          {coverPreview && (
            <button
              type="button"
              onClick={onRemoveCover}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}
        </div>

        <div
          onClick={() => document.getElementById("coverUpload")?.click()}
          className="relative w-full h-44 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col items-center justify-center group"
        >
          {coverPreview ? (
            <>
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-primary" /> Replace Poster
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-white transition-colors p-4 text-center">
              <UploadCloud className="w-7 h-7 text-primary" />
              <span className="text-xs font-semibold">Click to choose Poster Cover</span>
              <span className="text-[10px] text-white/40">Instant preview (Uploads on Publish)</span>
            </div>
          )}
          <input
            id="coverUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFileSelect(e, "coverUrl")}
          />
        </div>
      </div>

      {/* Background Banner Upload Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Header Banner (16:9)
          </label>
          {bgPreview && (
            <button
              type="button"
              onClick={onRemoveBg}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}
        </div>

        <div
          onClick={() => document.getElementById("bgUpload")?.click()}
          className="relative w-full h-28 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col items-center justify-center group"
        >
          {bgPreview ? (
            <>
              <img
                src={bgPreview}
                alt="Banner"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-primary" /> Replace Banner
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground group-hover:text-white transition-colors p-4 text-center">
              <UploadCloud className="w-6 h-6 text-primary" />
              <span className="text-xs font-semibold">Click to choose Wide Banner</span>
              <span className="text-[10px] text-white/40">Instant preview (Uploads on Publish)</span>
            </div>
          )}
          <input
            id="bgUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFileSelect(e, "bgUrl")}
          />
        </div>
      </div>
    </div>
  );
}
