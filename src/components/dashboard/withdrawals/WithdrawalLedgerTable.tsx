"use client";

import React from "react";
import type { FinancialHistoryData } from "./WithdrawalUtils";

interface WithdrawalLedgerTableProps {
  historyData: FinancialHistoryData | null;
}

export function WithdrawalLedgerTable({ historyData }: WithdrawalLedgerTableProps) {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden max-h-60 overflow-y-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-white/5 text-[10px] uppercase font-bold text-muted-foreground sticky top-0 backdrop-blur-md">
          <tr>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Description</th>
            <th className="px-4 py-2.5">Date</th>
            <th className="px-4 py-2.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {!historyData?.transactions || historyData.transactions.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-muted-foreground text-xs">
                No point transactions found for this user.
              </td>
            </tr>
          ) : (
            historyData.transactions.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.type === "EARN_AD"
                        ? "bg-green-500/10 text-green-400"
                        : t.type === "WITHDRAWAL"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-purple-500/10 text-purple-400"
                    }`}
                  >
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground max-w-xs truncate">
                  {t.description}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                  {new Date(t.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-bold font-mono ${
                    t.amount > 0 ? "text-green-400" : "text-rose-400"
                  }`}
                >
                  {t.amount > 0 ? `+${t.amount}` : t.amount}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
