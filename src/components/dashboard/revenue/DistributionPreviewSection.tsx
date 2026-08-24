"use client";

import React from "react";
import { format } from "date-fns";
import { DistributionPreviewData } from "@/services/adRevenue.service";
import { AlertTriangle, Award, CheckCircle2, Info } from "lucide-react";

interface DistributionPreviewSectionProps {
  previewData: DistributionPreviewData;
  onOpenConfirmModal: () => void;
}

export function DistributionPreviewSection({
  previewData,
  onOpenConfirmModal,
}: DistributionPreviewSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
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
            Distributable Pool
          </p>
          <p className="text-xl font-black text-primary mt-1">
            {previewData.distributablePool.toLocaleString()} pts
          </p>
          <p className="text-xs text-foreground/60 mt-0.5">
            ≈ ${(previewData.distributablePool * previewData.pointRate).toFixed(2)} USD
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
              <thead className="border-b border-white/10 bg-white/[0.02] text-foreground/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Creator / Channel</th>
                  <th className="py-3 px-4 text-center">Qualified (1.0)</th>
                  <th className="py-3 px-4 text-center">Engaged (2.5)</th>
                  <th className="py-3 px-4 text-center">Completed (4.0)</th>
                  <th className="py-3 px-4 text-right">Quality Score</th>
                  <th className="py-3 px-4 text-right">Share %</th>
                  <th className="py-3 px-4 text-right">Points to Credit</th>
                  <th className="py-3 px-4 text-right">USD Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {previewData.creators.map((c, index) => (
                  <tr key={c.creatorId} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 text-foreground/40 font-bold">
                      #{index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/20 border border-white/10 shrink-0 flex items-center justify-center">
                          {c.profileImage ? (
                            <img
                              src={c.profileImage}
                              alt={c.channelName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-primary">
                              {c.channelName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{c.channelName}</p>
                          <p className="text-[10px] text-foreground/40 truncate">
                            {c.ownerEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground/70">
                      {c.qualifiedReadsCount}
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground/70">
                      {c.engagedReadsCount}
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground/70">
                      {c.completedReadsCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-primary">
                      {c.qualityScore.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-foreground/80">
                      {c.scorePercentage.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                      +{c.pointsAwarded.toLocaleString()} pts
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-foreground/60">
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
