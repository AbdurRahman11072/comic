"use client";

import React from "react";
import { Calendar, Check, Coins, Loader2, Sparkles } from "lucide-react";
import { UnifiedSeriesItem } from "./SeriesClient";

interface RequestFeatureModalProps {
  series: UnifiedSeriesItem | null;
  durationDays: number;
  pitchNotes: string;
  userPoints: number;
  baseFee: number;
  submittingRequest: boolean;
  onDurationDaysChange: (days: number) => void;
  onPitchNotesChange: (notes: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function RequestFeatureModal({
  series,
  durationDays,
  pitchNotes,
  userPoints,
  baseFee,
  submittingRequest,
  onDurationDaysChange,
  onPitchNotesChange,
  onClose,
  onSubmit,
}: RequestFeatureModalProps) {
  if (!series) return null;

  const getMultiplier = (days: number) => {
    if (days >= 28) return 4;
    if (days >= 14) return 2;
    return 1;
  };
  const totalCost = baseFee * getMultiplier(durationDays);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-[#13161c] border border-yellow-500/30 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30 shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Request Featured Placement</h3>
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

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Duration Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Promotion Duration
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { days: 7, label: "7 Days", sub: "1x Fee" },
                { days: 14, label: "14 Days", sub: "2x Fee" },
                { days: 30, label: "30 Days", sub: "4x Fee" },
              ].map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => onDurationDaysChange(option.days)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    durationDays === option.days
                      ? "bg-yellow-400/20 border-yellow-400 text-yellow-300 shadow-md"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="text-sm font-bold">{option.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{option.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pitch Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80">
              Pitch Notes for Moderators <span className="text-white/40 font-normal">(Optional)</span>
            </label>
            <textarea
              value={pitchNotes}
              onChange={(e) => onPitchNotesChange(e.target.value)}
              placeholder="Explain why this series should be featured on the hero placement..."
              rows={3}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400/50 resize-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Points Summary */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-white">Cost: {totalCost} Points</div>
                <div className="text-[10px] text-muted-foreground">Your Balance: {userPoints} Points</div>
              </div>
            </div>
            {userPoints < totalCost ? (
              <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                Insufficient Points
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                <Check className="w-3 h-3" /> Ready
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRequest || userPoints < totalCost}
              className="px-5 py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-xs hover:bg-yellow-300 disabled:opacity-50 transition shadow-lg shadow-yellow-400/20 flex items-center gap-2 cursor-pointer"
            >
              {submittingRequest ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Submit Request (-{totalCost} pts)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
