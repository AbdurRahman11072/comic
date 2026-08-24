"use client";

import React from "react";
import { format } from "date-fns";
import { DistributionPreviewData } from "@/services/adRevenue.service";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Coins,
  DollarSign,
  Info,
  ShieldCheck,
  TrendingDown,
  Wallet,
  Zap,
} from "lucide-react";

interface DistributionPreviewSectionProps {
  previewData: DistributionPreviewData;
  onOpenConfirmModal: () => void;
}

export function DistributionPreviewSection({
  previewData,
  onOpenConfirmModal,
}: DistributionPreviewSectionProps) {
  const grossPool =
    previewData.grossDistributablePool ??
    Math.floor(
      previewData.currency === "USD"
        ? previewData.grossAmountEntered / previewData.pointRate
        : previewData.grossAmountEntered
    );
  const walletReserve = previewData.creatorWalletReserve ?? 0;
  const netPool = previewData.netDistributablePool ?? previewData.distributablePool;
  const grossFiat = (grossPool * previewData.pointRate).toFixed(2);
  const reserveFiat = (walletReserve * previewData.pointRate).toFixed(2);
  const netFiat = (netPool * previewData.pointRate).toFixed(2);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* ── 3-STEP POOL CALCULATION & WALLET RESERVE BREAKDOWN BANNER ── */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Solvency & Creator Wallet Reserve Calculation</h3>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Exchange Rate: 1 pt = ${previewData.pointRate} USD
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Gross Converted Ad Revenue */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                1. Gross Ad Revenue
              </span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-black text-white">{grossPool.toLocaleString()} pts</p>
            <p className="text-xs text-muted-foreground">≈ ${grossFiat} USD entered</p>
          </div>

          {/* Step 2: Creator Wallet Reserve (Deducted) */}
          <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">
                2. Wallet Reserve (Deducted)
              </span>
              <Wallet className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl font-black text-rose-400">-{walletReserve.toLocaleString()} pts</p>
            <p className="text-xs text-rose-300/70">
              ≈ -${reserveFiat} USD held in creator wallets
            </p>
          </div>

          {/* Step 3: Net Distributable Quality Pool */}
          <div className="p-4 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                3. Net Distributable Pool
              </span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-black text-emerald-400">={netPool.toLocaleString()} pts</p>
            <p className="text-xs text-emerald-300/80">≈ ${netFiat} USD surplus to share</p>
          </div>
        </div>

        {netPool === 0 && walletReserve > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Zero Surplus Pool Notice:</strong> Total points currently held across creator wallets ({walletReserve.toLocaleString()} pts) equal or exceed the entered ad revenue ({grossPool.toLocaleString()} pts). To protect cashout solvency, no additional points will be minted for this batch.
            </p>
          </div>
        )}
      </div>

      {/* Overlap Alert */}
      {previewData.overlappingRun && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-amber-200">
              Warning: Date Range Overlaps with an Existing Distribution
            </p>
            <p className="text-foreground/80">
              The selected period overlaps with completed distribution run{" "}
              <strong className="text-white">#{previewData.overlappingRun.id}</strong> (
              {format(new Date(previewData.overlappingRun.periodStart), "MMM d, yyyy")} to{" "}
              {format(new Date(previewData.overlappingRun.periodEnd), "MMM d, yyyy")}). You cannot
              execute a new run covering an overlapping period until that run is reverted.
            </p>
          </div>
        </div>
      )}

      {/* Zero Score Warning */}
      {previewData.totalPlatformQualityScore === 0 && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-blue-200">No Qualifying Reading Activity Found</p>
            <p className="text-foreground/80">
              There were 0 authenticated reads that met the minimum Quality Score criteria
              (Qualified, Engaged, or Completed) in this period. Distribution cannot be executed
              for 0 quality points.
            </p>
          </div>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
            Net Quality Pool
          </p>
          <p className="text-xl font-black text-primary mt-1">
            {netPool.toLocaleString()} pts
          </p>
          <p className="text-xs text-foreground/60 mt-0.5">
            ≈ ${(netPool * previewData.pointRate).toFixed(2)} USD
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
            Platform Quality Score
          </p>
          <p className="text-xl font-black text-white mt-1">
            {previewData.totalPlatformQualityScore.toLocaleString()}
          </p>
          <p className="text-xs text-foreground/60 mt-0.5">Total Engagement Pts</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
            Qualifying Readers
          </p>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {previewData.totalDeduplicatedReads.toLocaleString()}
          </p>
          <p className="text-xs text-foreground/60 mt-0.5">Deduplicated 1/user/ch</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
            Filtered Bots / Guests
          </p>
          <p className="text-xl font-black text-yellow-400 mt-1">
            {previewData.telemetry.totalBotEvents + previewData.telemetry.totalGuestEvents}
          </p>
          <p className="text-xs text-foreground/60 mt-0.5">
            {previewData.telemetry.totalBotEvents} bots • {previewData.telemetry.totalGuestEvents} guests
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
            Eligible Creators
          </p>
          <p className="text-xl font-black text-purple-400 mt-1">
            {previewData.creators.length}
          </p>
          <p className="text-xs text-foreground/60 mt-0.5">Receiving payouts</p>
        </div>
      </div>

      {/* Creators Itemized Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Creator Score Breakdown & Payout Allocation
            </h3>
            <p className="text-xs text-foreground/60 mt-0.5">
              Showing all {previewData.creators.length} creators with qualified reading engagement
              for {format(new Date(previewData.periodStart), "MMM d, yyyy")} –{" "}
              {format(new Date(previewData.periodEnd), "MMM d, yyyy")}
            </p>
          </div>

          {previewData.totalPlatformQualityScore > 0 && !previewData.overlappingRun && (
            <button
              onClick={onOpenConfirmModal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Distribute Points
            </button>
          )}
        </div>

        {previewData.creators.length === 0 ? (
          <div className="py-12 text-center text-foreground/40 text-sm">
            No creator reading data available for this date window.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 text-[11px] text-foreground/40 uppercase bg-white/[0.01]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Rank</th>
                  <th className="px-4 py-3 font-semibold">Creator Channel</th>
                  <th className="px-4 py-3 font-semibold text-right">Quality Score</th>
                  <th className="px-4 py-3 font-semibold text-right">Platform Share</th>
                  <th className="px-4 py-3 font-semibold text-right">Reads Breakdown</th>
                  <th className="px-4 py-3 font-semibold text-right">Points Allocated</th>
                  <th className="px-4 py-3 font-semibold text-right">Est. Fiat Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {previewData.creators.map((c, i) => (
                  <tr key={c.creatorId} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-foreground/40 font-mono">#{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">
                      <div className="flex items-center gap-2.5">
                        {c.profileImage ? (
                          <img
                            src={c.profileImage}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                            {c.channelName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white truncate max-w-[160px]">
                            {c.channelName}
                          </p>
                          <p className="text-[10px] text-foreground/40 truncate max-w-[160px]">
                            {c.ownerEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      {c.qualityScore.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground/70">
                      {c.scorePercentage.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right text-[11px] text-foreground/50 font-mono">
                      <span className="text-emerald-400 font-semibold">{c.completedReadsCount}c</span>{" "}
                      • <span className="text-blue-400 font-semibold">{c.engagedReadsCount}e</span> •{" "}
                      <span className="text-foreground/70">{c.qualifiedReadsCount}q</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      +{c.pointsAwarded.toLocaleString()} pts
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground/80">
                      ${c.fiatEquivalent.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
