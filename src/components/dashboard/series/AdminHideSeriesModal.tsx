"use client";

import React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { UnifiedSeriesItem } from "./SeriesClient";

interface AdminHideSeriesModalProps {
  series: UnifiedSeriesItem | null;
  hideReason: string;
  updatingHide: boolean;
  onHideReasonChange: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminHideSeriesModal({
  series,
  hideReason,
  updatingHide,
  onHideReasonChange,
  onClose,
  onConfirm,
}: AdminHideSeriesModalProps) {
  if (!series) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-[#13161c] border border-red-500/30 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              {series.isHidden ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {series.isHidden ? "Restore Series Visibility" : "Hide Series From Platform"}
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                {series.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {series.isHidden
              ? "Restoring this series will make it immediately visible to all public readers across the catalog and search."
              : "Hiding this series will immediately unpublish it from public catalog, latest feeds, and search results."}
          </p>

          {!series.isHidden && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80">
                Moderation / Takedown Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={hideReason}
                onChange={(e) => onHideReasonChange(e.target.value)}
                placeholder="e.g. DMCA notice received, copyright violation, broken chapters..."
                rows={3}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-red-500/50 resize-none placeholder:text-muted-foreground/50"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={updatingHide}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-lg flex items-center gap-2 cursor-pointer ${
              series.isHidden
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
            }`}
          >
            {updatingHide ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
              </>
            ) : series.isHidden ? (
              <>
                <Eye className="w-3.5 h-3.5" /> Restore Series
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" /> Hide Series
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
