"use client";

import React from "react";
import { Filter, Layers, Sparkles, Users } from "lucide-react";
import { WithdrawalMetaData } from "@/services/withdrawal.service";

interface BatchItem {
  index: number;
  label: string;
  range: string;
}

interface WithdrawalBatchToolbarProps {
  isAdmin: boolean;
  selectedBatch: number | "all" | "custom";
  batchButtons: BatchItem[];
  customFrom: string;
  customTo: string;
  meta: WithdrawalMetaData | null;
  onSelectBatch: (batch: number | "all" | "custom") => void;
  onCustomFromChange: (val: string) => void;
  onCustomToChange: (val: string) => void;
  onApplyCustomRange: () => void;
}

export function WithdrawalBatchToolbar({
  isAdmin,
  selectedBatch,
  batchButtons,
  customFrom,
  customTo,
  meta,
  onSelectBatch,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustomRange,
}: WithdrawalBatchToolbarProps) {
  return (
    <div className="glass rounded-2xl p-4 border border-white/10 bg-white/[0.02]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
            <Layers className="w-4 h-4 text-primary" />
            <span>{isAdmin ? "Admin View / Work Split:" : "Moderator Queue Slice:"}</span>
          </div>

          {/* View All Option */}
          <button
            onClick={() => onSelectBatch("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              selectedBatch === "all"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            All Queue
          </button>

          {/* Batch Slices (1-20, 21-40, 41-60...) */}
          {batchButtons.map((b) => (
            <button
              key={b.index}
              onClick={() => onSelectBatch(b.index)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                selectedBatch === b.index
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                  : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/5"
              }`}
            >
              <span>{b.label}</span>
              <span className="opacity-75 font-mono text-[10px]">({b.range})</span>
            </button>
          ))}

          {/* Custom Range Option */}
          <button
            onClick={() => onSelectBatch("custom")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              selectedBatch === "custom"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/5"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Custom Range
          </button>
        </div>

        {/* Custom Range Inputs */}
        {selectedBatch === "custom" && (
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
            <span className="text-xs text-muted-foreground pl-2">From:</span>
            <input
              type="number"
              min="1"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-center focus:outline-none focus:border-primary"
            />
            <span className="text-xs text-muted-foreground">To:</span>
            <input
              type="number"
              min="1"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-center focus:outline-none focus:border-primary"
            />
            <button
              onClick={onApplyCustomRange}
              className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition cursor-pointer"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Informational Sub-banner for task isolation */}
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {selectedBatch === "all"
              ? `Showing all requests in chronological order`
              : typeof selectedBatch === "number"
              ? `Viewing Moderator Task Partition: Requests ${(selectedBatch - 1) * 20 + 1} to ${
                  selectedBatch * 20
                } (Prevents collision with other moderators)`
              : `Viewing Custom Task Range: ${customFrom} to ${customTo}`}
          </span>
        </div>
        {meta && meta.rangeFrom && (
          <span className="font-mono text-[11px] bg-white/5 px-2.5 py-0.5 rounded-md text-foreground">
            Queue Position: {meta.rangeFrom} - {meta.rangeTo} of {meta.total}
          </span>
        )}
      </div>
    </div>
  );
}
