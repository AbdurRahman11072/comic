"use client";

import React from "react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

export type TransactionFilterType = "ALL" | "EARNED" | "SPENT" | "WITHDRAWALS";

interface TransactionFiltersProps {
  filter: TransactionFilterType;
  totalCount: number;
  onFilterChange: (filter: TransactionFilterType) => void;
}

export function TransactionFilters({
  filter,
  totalCount,
  onFilterChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onFilterChange("ALL")}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
          filter === "ALL"
            ? "bg-primary text-white"
            : "bg-white/5 text-muted-foreground hover:text-white"
        }`}
      >
        All Activity ({totalCount})
      </button>
      <button
        onClick={() => onFilterChange("EARNED")}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
          filter === "EARNED"
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-white/5 text-muted-foreground hover:text-white"
        }`}
      >
        <TrendingUp className="w-3.5 h-3.5" /> Earned Points
      </button>
      <button
        onClick={() => onFilterChange("SPENT")}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
          filter === "SPENT"
            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            : "bg-white/5 text-muted-foreground hover:text-white"
        }`}
      >
        <TrendingDown className="w-3.5 h-3.5" /> Point Spending
      </button>
      <button
        onClick={() => onFilterChange("WITHDRAWALS")}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
          filter === "WITHDRAWALS"
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            : "bg-white/5 text-muted-foreground hover:text-white"
        }`}
      >
        <Wallet className="w-3.5 h-3.5" /> Withdrawals
      </button>
    </div>
  );
}
