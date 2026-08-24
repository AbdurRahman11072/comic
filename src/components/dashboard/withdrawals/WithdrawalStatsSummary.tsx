"use client";

import React from "react";
import { CheckCircle2, Clock, CreditCard, XCircle } from "lucide-react";
import { WithdrawalMetaData } from "@/services/withdrawal.service";

interface WithdrawalStatsSummaryProps {
  meta: WithdrawalMetaData | null;
}

export function WithdrawalStatsSummary({ meta }: WithdrawalStatsSummaryProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Withdrawal Requests</h1>
          <p className="text-sm text-muted-foreground">
            Review, process creator payouts, and inspect user transaction history
          </p>
        </div>
      </div>

      {/* Quick Queue Summary Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">
            {meta?.totalPending ?? 0} Pending
          </span>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">
            {meta?.totalApproved ?? 0} Approved
          </span>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-semibold text-rose-400">
            {meta?.totalRejected ?? 0} Rejected
          </span>
        </div>
      </div>
    </div>
  );
}
