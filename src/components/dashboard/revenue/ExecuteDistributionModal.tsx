"use client";

import React from "react";
import { format } from "date-fns";
import { DistributionPreviewData } from "@/services/adRevenue.service";
import { AlertCircle, CheckCircle2, Coins, Loader2, ShieldCheck, Wallet, Zap } from "lucide-react";

interface ExecuteDistributionModalProps {
  open: boolean;
  previewData: DistributionPreviewData | null;
  notes: string;
  executing: boolean;
  onNotesChange: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExecuteDistributionModal({
  open,
  previewData,
  notes,
  executing,
  onNotesChange,
  onClose,
  onConfirm,
}: ExecuteDistributionModalProps) {
  if (!open || !previewData) return null;

  const grossPool =
    previewData.grossDistributablePool ??
    Math.floor(
      previewData.currency === "USD"
        ? previewData.grossAmountEntered / previewData.pointRate
        : previewData.grossAmountEntered
    );
  const walletReserve = previewData.creatorWalletReserve ?? 0;
  const netPool = previewData.netDistributablePool ?? previewData.distributablePool;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#121215] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Confirm Revenue Distribution</h3>
            <p className="text-xs text-foreground/60">
              {format(new Date(previewData.periodStart), "MMM d, yyyy")} –{" "}
              {format(new Date(previewData.periodEnd), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* 3-Step Summary in Modal */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-foreground/60 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Gross Ad Revenue:
            </span>
            <span className="font-mono font-bold text-white">
              {grossPool.toLocaleString()} pts (${(grossPool * previewData.pointRate).toFixed(2)})
            </span>
          </div>

          <div className="flex justify-between items-center text-rose-300">
            <span className="text-rose-300/80 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-rose-400" /> Creator Wallet Reserve (Deducted):
            </span>
            <span className="font-mono font-bold text-rose-400">
              -{walletReserve.toLocaleString()} pts (-${(walletReserve * previewData.pointRate).toFixed(2)})
            </span>
          </div>

          <div className="border-t border-white/5 pt-2 flex justify-between items-center">
            <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Net Distributable Pool:
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              ={netPool.toLocaleString()} pts (${(netPool * previewData.pointRate).toFixed(2)})
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px] pt-1">
            <span className="text-foreground/50">Recipients Count:</span>
            <span className="font-bold text-white">{previewData.creators.length} Creators</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-foreground/50">Total Platform Score:</span>
            <span className="font-bold text-primary">
              {previewData.totalPlatformQualityScore.toLocaleString()} pts
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
            Audit Notes / Description (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="e.g. AdSense distribution batch"
            className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition"
          />
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <span>
            This will atomically credit each creator&apos;s point balance from the net surplus pool, update lifetime
            earnings, and generate audit trail records. Existing creator wallet points are protected.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={executing}
            className="px-4 py-2 text-xs font-semibold rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={executing}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {executing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Executing Batch...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Execute & Credit Points
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
