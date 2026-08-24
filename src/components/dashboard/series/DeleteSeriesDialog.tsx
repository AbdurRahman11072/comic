"use client";

import React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { UnifiedSeriesItem } from "./SeriesClient";

interface DeleteSeriesDialogProps {
  series: UnifiedSeriesItem | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteSeriesDialog({
  series,
  deleting,
  onClose,
  onConfirm,
}: DeleteSeriesDialogProps) {
  if (!series) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-[#13161c] border border-red-500/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
          <Trash2 className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">Delete Series Permanently?</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Are you sure you want to delete <span className="text-white font-semibold">"{series.title}"</span>? All published chapters, pages, comments, and stats will be irreversibly removed.
          </p>
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
            disabled={deleting}
            className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 disabled:opacity-50 transition shadow-lg shadow-red-500/20 flex items-center gap-2 cursor-pointer"
          >
            {deleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" /> Delete Series
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
