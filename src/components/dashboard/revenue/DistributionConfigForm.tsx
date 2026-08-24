"use client";

import React from "react";
import { Calendar, Info, Loader2, Zap } from "lucide-react";

interface DistributionConfigFormProps {
  periodStart: string;
  periodEnd: string;
  amount: string;
  currency: "USD" | "POINTS";
  todayStr: string;
  pointRate: number;
  previewLoading: boolean;
  onPeriodStartChange: (val: string) => void;
  onPeriodEndChange: (val: string) => void;
  onAmountChange: (val: string) => void;
  onCurrencyChange: (val: "USD" | "POINTS") => void;
  onApplyPreset: (type: "last_month" | "this_month" | "last_30" | "last_7") => void;
  onCalculatePreview: () => void;
}

export function DistributionConfigForm({
  periodStart,
  periodEnd,
  amount,
  currency,
  todayStr,
  pointRate,
  previewLoading,
  onPeriodStartChange,
  onPeriodEndChange,
  onAmountChange,
  onCurrencyChange,
  onApplyPreset,
  onCalculatePreview,
}: DistributionConfigFormProps) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          1. Select Distribution Period & Total Pool
        </h2>

        {/* Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-foreground/40 font-medium mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => onApplyPreset("last_month")}
            className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition cursor-pointer"
          >
            Previous Month
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset("this_month")}
            className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition cursor-pointer"
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset("last_30")}
            className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition cursor-pointer"
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
            Period Start Date
          </label>
          <input
            type="date"
            max={todayStr}
            value={periodStart}
            onChange={(e) => onPeriodStartChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
            Period End Date
          </label>
          <input
            type="date"
            max={todayStr}
            value={periodEnd}
            onChange={(e) => onPeriodEndChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
          />
        </div>

        {/* Revenue Amount */}
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
            Distributable Creator Pool
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="1000"
              className="w-full px-3.5 py-2.5 pr-20 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
            />
            <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center">
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as "USD" | "POINTS")}
                className="h-full px-2 rounded-lg bg-white/10 border border-white/10 text-xs font-bold text-white focus:outline-none"
              >
                <option value="USD" className="bg-[#18181b]">USD ($)</option>
                <option value="POINTS" className="bg-[#18181b]">Points</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            onClick={onCalculatePreview}
            disabled={previewLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 transition disabled:opacity-50 cursor-pointer"
          >
            {previewLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculating Scores...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Calculate Preview
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-foreground/50 pt-1 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>
            Conversion Rate: 1 Point = ${pointRate.toFixed(2)} USD • Entered pool is allocated 100%
            across verified creators based on Quality Scores.
          </span>
        </div>
        <div className="text-[11px] text-foreground/40 italic">
          Tip: Set Period End Date to a completed past day (e.g. yesterday or last month end) to ensure no active reads arrive mid-calculation.
        </div>
      </div>
    </div>
  );
}
