"use client";

import React from "react";
import { format } from "date-fns";
import { DistributionRunItem } from "@/services/adRevenue.service";
import { History, RotateCcw } from "lucide-react";

interface DistributionHistoryTableProps {
  history: DistributionRunItem[];
  onInspectRun: (runId: string) => void;
  onOpenRevertModal: (run: DistributionRunItem) => void;
}

export function DistributionHistoryTable({
  history,
  onInspectRun,
  onOpenRevertModal,
}: DistributionHistoryTableProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Distribution Runs History & Audit Trail
          </h2>
          <p className="text-xs text-foreground/60 mt-0.5">
            Permanent audit ledger of all completed and reverted revenue distributions
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
        {history.length === 0 ? (
          <div className="py-12 text-center text-foreground/40 text-sm">
            No revenue distributions executed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-foreground/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Gross Input</th>
                  <th className="py-3 px-4">Distributed Pool</th>
                  <th className="py-3 px-4 text-center">Creators</th>
                  <th className="py-3 px-4">Executed By</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Date Executed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {history.map((run) => (
                  <tr key={run.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {format(new Date(run.periodStart), "MMM d, yyyy")} –{" "}
                      {format(new Date(run.periodEnd), "MMM d, yyyy")}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-foreground/80">
                      {run.currency === "USD"
                        ? `$${run.grossAmountEntered.toFixed(2)}`
                        : `${run.grossAmountEntered.toLocaleString()} pts`}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {run.distributablePool.toLocaleString()} pts
                    </td>
                    <td className="py-3.5 px-4 text-center text-foreground/70">
                      {run.totalCreatorsCount}
                    </td>
                    <td className="py-3.5 px-4 text-foreground/60">
                      {run.admin?.name || "Admin"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          run.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-foreground/40 font-mono">
                      {format(new Date(run.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => onInspectRun(run.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition cursor-pointer"
                      >
                        Inspect
                      </button>
                      {run.status === "COMPLETED" && (
                        <button
                          onClick={() => onOpenRevertModal(run)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Revert
                        </button>
                      )}
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
