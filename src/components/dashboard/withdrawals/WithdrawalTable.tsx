"use client";

import React from "react";
import {
  Check,
  Coins,
  Copy,
  CreditCard,
  Eye,
  Loader2,
  Smartphone,
  X,
} from "lucide-react";
import { WithdrawalRequest } from "@/services/withdrawal.service";
import {
  getPlatformBadgeStyle,
  parsePayoutDetails,
} from "./WithdrawalHistoryModal";

interface WithdrawalTableProps {
  requests: WithdrawalRequest[];
  loading: boolean;
  activeTab: string;
  actionLoading: string | null;
  onOpenHistoryModal: (req: WithdrawalRequest) => void;
  onReview: (id: string, status: "APPROVED" | "REJECTED") => void;
  onCopy: (text: string, label: string) => void;
}

export function WithdrawalTable({
  requests,
  loading,
  activeTab,
  actionLoading,
  onOpenHistoryModal,
  onReview,
  onCopy,
}: WithdrawalTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 glass rounded-3xl border border-white/10">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-xs text-muted-foreground font-medium">Loading withdrawal queue...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-20 glass rounded-3xl border border-white/10 text-muted-foreground">
        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-semibold">No withdrawal requests found</p>
        <p className="text-xs mt-1 opacity-70">
          {activeTab === "PENDING"
            ? "All pending withdrawal tasks in this partition have been resolved!"
            : "No matching records found for this filter."}
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl overflow-hidden border border-white/10 bg-white/[0.01]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
              <th className="px-4 py-4 w-12 text-center">#</th>
              <th className="px-5 py-4">User / Creator</th>
              <th className="px-5 py-4">Payout Amount</th>
              <th className="px-5 py-4">Platform & Method</th>
              <th className="px-5 py-4">Account / Phone Details</th>
              <th className="px-5 py-4">Ad Activity (Today / Total)</th>
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                {/* Queue # Badge */}
                <td className="px-4 py-4 text-center font-mono font-bold text-muted-foreground text-xs">
                  #{req.queueIndex ?? req.id.slice(0, 4)}
                </td>

                {/* User info */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/30 to-purple-500/30 border border-white/10 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                      {req.user.image ? (
                        <img
                          src={req.user.image}
                          alt={req.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        req.user.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground truncate max-w-[140px]">
                          {req.user.name}
                        </span>
                        {req.user.transactionsFrozen && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold">
                            FROZEN
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded bg-white/5 text-muted-foreground text-[10px] uppercase">
                          {req.user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                        {req.user.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Payout Amount */}
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-emerald-400">
                      ${req.fiatAmount.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400 inline" />
                      {req.pointsRequested.toLocaleString()} pts
                    </span>
                  </div>
                </td>

                {/* Platform & Method */}
                <td className="px-5 py-4 whitespace-nowrap">
                  {(() => {
                    const parsed = parsePayoutDetails(req.bankDetails);
                    return (
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-sm ${getPlatformBadgeStyle(
                            parsed.platform
                          )}`}
                        >
                          <Smartphone className="w-3.5 h-3.5 shrink-0" />
                          <span>{parsed.platform}</span>
                        </span>
                        {parsed.accountType && (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {parsed.accountType}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </td>

                {/* Phone / Account Destination */}
                <td className="px-5 py-4 min-w-[180px] max-w-[260px]">
                  {(() => {
                    const parsed = parsePayoutDetails(req.bankDetails);
                    return (
                      <div className="flex flex-col gap-0.5 group/copy">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground truncate">
                            {parsed.destination}
                          </span>
                          <button
                            onClick={() => onCopy(parsed.destination, "Account Number")}
                            title="Copy account details"
                            className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground opacity-0 group-hover/copy:opacity-100 transition cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {parsed.holderName && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            Name:{" "}
                            <span className="text-foreground/90 font-medium">
                              {parsed.holderName}
                            </span>
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </td>

                {/* Ad Metrics (Today & Total) */}
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-muted-foreground">Today:</span>
                      <span className="font-semibold text-foreground">
                        {req.user.dailyAdViews} views
                      </span>
                      <span className="text-amber-400 font-mono">
                        ({req.user.dailyAdPointsEarned} pts)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span>Total:</span>
                      <span className="font-medium text-foreground/80">
                        {req.user.totalAdViews ?? 0} views
                      </span>
                      <span className="text-amber-400/80 font-mono">
                        ({(req.user.totalAdPoints ?? 0).toLocaleString()} pts)
                      </span>
                    </div>
                  </div>
                </td>

                {/* Submitted At */}
                <td className="px-4 py-4 text-muted-foreground text-[11px] whitespace-nowrap">
                  {new Date(req.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                {/* Status Badge */}
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                      req.status === "PENDING"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : req.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Details & History button */}
                    <button
                      onClick={() => onOpenHistoryModal(req)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="View user transaction history and review details"
                    >
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      View
                    </button>

                    {/* Quick Approve / Reject for PENDING */}
                    {req.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => onReview(req.id, "APPROVED")}
                          disabled={actionLoading === req.id}
                          className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
                          title="Approve Payout"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReview(req.id, "REJECTED")}
                          disabled={actionLoading === req.id}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition disabled:opacity-50 cursor-pointer"
                          title="Reject and refund points"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
