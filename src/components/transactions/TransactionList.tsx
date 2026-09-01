"use client";

import React, { useState, useEffect } from "react";
import { History, Loader2 } from "lucide-react";
import { PointTransactionItem } from "@/services/points.service";
import { PaginationFooter } from "@/components/dashboard/PaginationFooter";

interface TransactionListProps {
  transactions: PointTransactionItem[];
  loading: boolean;
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Reset page when transactions filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
      {/* Desktop View: Full Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs">Loading transactions...</p>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-muted-foreground/50">
                    <History className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-white/80">No transactions found in this category.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Your earnings, rewards, and unlock activities will appear here.</p>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                          tx.type === "WITHDRAWAL"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : isPositive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/90 font-medium">{tx.description}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-mono font-black ${
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

      {/* Mobile View: Card-based items */}
      <div className="md:hidden divide-y divide-white/5">
        {loading ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-xs">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-muted-foreground/50">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-white/80">No transactions found in this category.</p>
            <p className="text-xs text-muted-foreground mt-0.5">Your earnings and rewards will appear here.</p>
          </div>
        ) : (
          paginatedTransactions.map((tx) => {
            const isPositive = tx.amount > 0;
            return (
              <div key={tx.id} className="p-4 space-y-2 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                      tx.type === "WITHDRAWAL"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : isPositive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {tx.type}
                  </span>
                  <span
                    className={`text-sm font-mono font-black ${
                      isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isPositive ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} pts
                  </span>
                </div>
                <p className="text-xs text-white/90 font-medium leading-snug">{tx.description}</p>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {new Date(tx.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && transactions.length > itemsPerPage && (
        <div className="border-t border-white/5 px-4 bg-white/[0.01]">
          <PaginationFooter
            page={currentPage}
            totalPages={totalPages}
            totalItems={transactions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
