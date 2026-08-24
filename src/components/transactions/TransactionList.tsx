"use client";

import React from "react";
import { History, Loader2 } from "lucide-react";
import { PointTransactionItem } from "@/services/points.service";

interface TransactionListProps {
  transactions: PointTransactionItem[];
  loading: boolean;
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
  return (
    <div className="glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5 text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No transactions found in this category.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                          tx.type === "WITHDRAWAL"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : isPositive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/90 font-medium">{tx.description}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-mono font-bold ${
                        isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPositive ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
