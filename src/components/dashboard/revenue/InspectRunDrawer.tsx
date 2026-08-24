"use client";

import React from "react";
import { format } from "date-fns";
import { DistributionRunItem } from "@/services/adRevenue.service";
import { RotateCcw, ShieldCheck } from "lucide-react";

interface InspectRunDrawerProps {
  inspectRun: DistributionRunItem | null;
  onClose: () => void;
  onOpenRevertModal: (run: DistributionRunItem) => void;
}

export function InspectRunDrawer({
  inspectRun,
  onClose,
  onOpenRevertModal,
}: InspectRunDrawerProps) {
  if (!inspectRun) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-[#121215] border border-white/10 p-6 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Distribution Run Breakdown #{inspectRun.id}
            </h3>
            <p className="text-xs text-foreground/60 mt-0.5">
              Period: {format(new Date(inspectRun.periodStart), "MMM d, yyyy")} –{" "}
              {format(new Date(inspectRun.periodEnd), "MMM d, yyyy")} • Executed by{" "}
              {inspectRun.admin?.name || "Admin"} on{" "}
              {format(new Date(inspectRun.createdAt), "MMM d, yyyy HH:mm")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {inspectRun.status === "COMPLETED" && (
              <button
                onClick={() => onOpenRevertModal(inspectRun)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Revert Run
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/70 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Run Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-foreground/50">Total Pool:</span>
            <p className="text-sm font-bold text-primary mt-0.5">
              {inspectRun.distributablePool.toLocaleString()} pts
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-foreground/50">Total Quality Score:</span>
            <p className="text-sm font-bold text-white mt-0.5">
              {inspectRun.totalQualityScore.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-foreground/50">Creators Paid:</span>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">
              {inspectRun.totalCreatorsCount}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-foreground/50">Status:</span>
            <p className="text-sm font-bold text-white mt-0.5">{inspectRun.status}</p>
          </div>
        </div>

        {/* Itemized Payout Table */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#18181c] border-b border-white/10 text-foreground/60 uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">Creator</th>
                <th className="py-2.5 px-3 text-center">Qualified</th>
                <th className="py-2.5 px-3 text-center">Engaged</th>
                <th className="py-2.5 px-3 text-center">Completed</th>
                <th className="py-2.5 px-3 text-right">Score</th>
                <th className="py-2.5 px-3 text-right">Share %</th>
                <th className="py-2.5 px-3 text-right">Points Credited</th>
                {inspectRun.status === "REVERTED" && (
                  <>
                    <th className="py-2.5 px-3 text-right text-yellow-400">Clawed Back</th>
                    <th className="py-2.5 px-3 text-right text-red-400">Shortfall</th>
                  </>
                )}
                <th className="py-2.5 px-3 text-right">USD Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(inspectRun.creatorPayouts || []).map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-bold text-white">
                    {p.creator?.channelName || "Creator"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-foreground/70">
                    {p.qualifiedReadsCount}
                  </td>
                  <td className="py-2.5 px-3 text-center text-foreground/70">
                    {p.engagedReadsCount}
                  </td>
                  <td className="py-2.5 px-3 text-center text-foreground/70">
                    {p.completedReadsCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                    {p.qualityScore.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-foreground/80">
                    {p.scorePercentage.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                    +{p.pointsAwarded.toLocaleString()} pts
                  </td>
                  {inspectRun.status === "REVERTED" && (
                    <>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-yellow-400">
                        -{p.revertedPoints?.toLocaleString() ?? 0} pts
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-red-400">
                        {p.shortfallPoints ? `${p.shortfallPoints.toLocaleString()} pts` : "0"}
                      </td>
                    </>
                  )}
                  <td className="py-2.5 px-3 text-right font-mono text-foreground/60">
                    ${p.fiatEquivalent.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
