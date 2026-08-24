"use client";

import React from "react";
import {
  Copy,
  CreditCard,
  Lock,
  Smartphone,
  Tv,
  Unlock,
} from "lucide-react";
import {
  FinancialHistoryData,
  parsePayoutDetails,
  getPlatformBadgeStyle,
} from "./WithdrawalUtils";
import { WithdrawalRequest } from "@/services/withdrawal.service";

interface WithdrawalSummaryHeaderProps {
  selectedRequest: WithdrawalRequest;
  historyData: FinancialHistoryData | null;
  copyToClipboard: (text: string, label: string) => void;
}

export function WithdrawalSummaryHeader({
  selectedRequest,
  historyData,
  copyToClipboard,
}: WithdrawalSummaryHeaderProps) {
  const parsed = parsePayoutDetails(selectedRequest.bankDetails);

  return (
    <>
      {/* Top Request Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-2xl p-4 border border-white/5 bg-white/[0.01]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Requested Points
          </span>
          <p className="text-xl font-extrabold text-amber-400 mt-1">
            {selectedRequest.pointsRequested.toLocaleString()}
          </p>
        </div>
        <div className="glass rounded-2xl p-4 border border-white/5 bg-white/[0.01]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Fiat Payout
          </span>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">
            ${selectedRequest.fiatAmount.toFixed(2)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4 border border-white/5 bg-white/[0.01]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Current Points Balance
          </span>
          <p className="text-xl font-extrabold text-primary mt-1">
            {historyData?.user?.points?.toLocaleString() ??
              selectedRequest.user.points.toLocaleString()}
          </p>
        </div>
        <div className="glass rounded-2xl p-4 border border-white/5 bg-white/[0.01]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Account Status
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            {historyData?.user?.transactionsFrozen ? (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Frozen
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5" /> Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Payment & Bank Details Box */}
      <div className="pt-4 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-primary" />
          Payout Destination & Platform Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Platform Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Transaction Platform
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-sm ${getPlatformBadgeStyle(
                  parsed.platform
                )}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{parsed.platform}</span>
              </span>
              {parsed.accountType && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-white/80 uppercase">
                  {parsed.accountType}
                </span>
              )}
            </div>
          </div>

          {/* Destination Details Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Phone / Account Number
              </span>
              <p className="text-sm font-mono font-bold text-foreground truncate mt-0.5">
                {parsed.destination}
              </p>
              {parsed.holderName && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Holder: <span className="text-white font-medium">{parsed.holderName}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => copyToClipboard(parsed.destination, "Account Number")}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Lifetime Metrics Overview */}
      <div className="pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Tv className="w-4 h-4 text-primary" />
          User Financial & Ad Intelligence
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-muted-foreground text-[10px]">Total Ads Viewed</p>
            <p className="font-bold text-sm mt-0.5">
              {historyData?.stats?.totalAdViews ?? selectedRequest.user.totalAdViews ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-muted-foreground text-[10px]">Total Ad Points Earned</p>
            <p className="font-bold text-sm text-amber-400 mt-0.5">
              {(
                historyData?.stats?.totalAdPointsEarned ??
                selectedRequest.user.totalAdPoints ??
                0
              ).toLocaleString()}{" "}
              pts
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-muted-foreground text-[10px]">Total Approved Payouts</p>
            <p className="font-bold text-sm text-emerald-400 mt-0.5">
              ${(historyData?.stats?.totalFiatWithdrawn ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-muted-foreground text-[10px]">Previous Withdrawals</p>
            <p className="font-bold text-sm mt-0.5">
              {historyData?.stats?.previousWithdrawalsCount ?? 0} requests
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
