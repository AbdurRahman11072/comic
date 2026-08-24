"use client";

import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface TransactionHistoryTabProps {
  pointTransactions?: any[];
}

export function TransactionHistoryTab({
  pointTransactions = [],
}: TransactionHistoryTabProps) {
  return (
    <div className="glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
      <h3 className="text-2xl font-bold mb-6">Transaction History</h3>
      <div className="space-y-4">
        {pointTransactions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No transactions yet.
          </div>
        ) : (
          pointTransactions.map((t: any) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-xl ${
                    t.amount > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {t.amount > 0 ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.description}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div
                className={`font-mono font-bold text-sm ${
                  t.amount > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {t.amount > 0 ? "+" : ""}
                {t.amount} P
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
