"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  FinancialHistoryData,
  parsePayoutDetails,
  getPlatformBadgeStyle,
} from "./WithdrawalUtils";

interface WithdrawalAccordionListProps {
  historyData: FinancialHistoryData | null;
  expandedWithdrawalId: string | null;
  onToggleExpand: (id: string | null) => void;
}

export function WithdrawalAccordionList({
  historyData,
  expandedWithdrawalId,
  onToggleExpand,
}: WithdrawalAccordionListProps) {
  return (
    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
      {!historyData?.withdrawals || historyData.withdrawals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-xs border border-white/5 rounded-2xl">
          No previous withdrawal requests found for this user.
        </div>
      ) : (
        historyData.withdrawals.map((w) => {
          const isExpanded = expandedWithdrawalId === w.id;
          const parsedW = parsePayoutDetails(w.bankDetails);
          return (
            <div
              key={w.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition"
            >
              {/* Accordion Header / Trigger */}
              <button
                onClick={() => onToggleExpand(isExpanded ? null : w.id)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      w.status === "PENDING"
                        ? "bg-amber-500/20 text-amber-400"
                        : w.status === "APPROVED"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {w.status}
                  </span>
                  <span className="font-bold text-foreground">
                    ${w.fiatAmount.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({w.pointsRequested.toLocaleString()} pts)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPlatformBadgeStyle(
                      parsedW.platform
                    )}`}
                  >
                    {parsedW.platform}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Accordion Content / Dropdown Details */}
              {isExpanded && (
                <div className="p-4 border-t border-white/5 bg-black/30 text-xs space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground block text-[11px]">
                        Platform:
                      </span>
                      <span
                        className={`inline-block mt-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${getPlatformBadgeStyle(
                          parsedW.platform
                        )}`}
                      >
                        {parsedW.platform} {parsedW.accountType ? `(${parsedW.accountType})` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block text-[11px]">
                        Phone / Account:
                      </span>
                      <span className="font-mono text-foreground font-bold mt-1 block">
                        {parsedW.destination}
                      </span>
                      {parsedW.holderName && (
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">
                          Holder: {parsedW.holderName}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block text-[11px]">
                        Updated:
                      </span>
                      <span className="mt-1 block">{new Date(w.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  {w.notes && (
                    <div className="pt-2 border-t border-white/5">
                      <span className="font-semibold text-foreground">Moderator Notes:</span>{" "}
                      <span className="italic text-muted-foreground">{w.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
