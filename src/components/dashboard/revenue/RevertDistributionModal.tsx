"use client";

import React from "react";
import { format } from "date-fns";
import { DistributionRunItem } from "@/services/adRevenue.service";
import { Loader2, RotateCcw, ShieldAlert } from "lucide-react";

interface RevertDistributionModalProps {
  open: boolean;
  run: DistributionRunItem | null;
  revertReason: string;
  revertConfirmText: string;
  reverting: boolean;
  onReasonChange: (val: string) => void;
  onConfirmTextChange: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function RevertDistributionModal({
  open,
  run,
  revertReason,
  revertConfirmText,
  reverting,
  onReasonChange,
  onConfirmTextChange,
  onClose,
  onConfirm,
}: RevertDistributionModalProps) {
  if (!open || !run) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#141215] border border-red-500/30 p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Revert Revenue Distribution</h3>
            <p className="text-xs text-foreground/60">
              Run #{run.id} • {format(new Date(run.periodStart), "MMM d, yyyy")} –{" "}
              {format(new Date(run.periodEnd), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs space-y-2">
          <p className="font-bold text-red-200">⚠️ Irreversible Accounting Action & Clawback Rules:</p>
          <ul className="list-disc pl-4 space-y-1 text-foreground/80">
            <li>
              <strong className="text-white">Auto-cancels PENDING withdrawals:</strong> Any pending cashout
              requests for affected creators will be rejected with an explanation note and refunded to their live balance.
            </li>
            <li>
              <strong className="text-white">Claws back points:</strong> Deducts up to each creator&apos;s current live
              balance (points cannot go negative).
            </li>
            <li>
              <strong className="text-white">Shortfall tracking:</strong> If a creator has already withdrawn funds (approved withdrawals are untouched), the deficit is recorded as an unresolved shortfall on the audit ledger.
            </li>
          </ul>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-foreground/60">Total Points Awarded to Reclaim:</span>
            <span className="font-bold text-white">{run.distributablePool.toLocaleString()} Points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Affected Creators Count:</span>
            <span className="font-bold text-white">{run.totalCreatorsCount} Creators</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
            Reason for Reversal (Audit Trail)
          </label>
          <textarea
            rows={2}
            value={revertReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="e.g. Discovered fraud cluster in period reads / calculation correction"
            className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-foreground/30 focus:outline-none focus:border-red-500/50 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-red-300 mb-1.5">
            Type <strong className="text-white underline">REVERT</strong> below to confirm:
          </label>
          <input
            type="text"
            value={revertConfirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
            placeholder="Type REVERT"
            className="w-full px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono font-bold text-white focus:outline-none focus:border-red-500 transition"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={reverting}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={reverting || revertConfirmText.trim().toUpperCase() !== "REVERT"}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {reverting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Reverting & Clawing Back...
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Confirm Revert & Clawback Points
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
