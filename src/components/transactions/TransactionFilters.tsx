"use client";

import React from "react";
import { Coins, TrendingDown, TrendingUp, Wallet } from "lucide-react";

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
  const FILTERS = [
    {
      id: "ALL" as TransactionFilterType,
      label: "All Activity",
      icon: Coins,
      count: totalCount,
      activeCls: "bg-primary text-white font-bold shadow-lg shadow-primary/20",
    },
    {
      id: "EARNED" as TransactionFilterType,
      label: "Earned Points",
      icon: TrendingUp,
      activeCls: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold shadow-lg shadow-emerald-500/10",
    },
    {
      id: "SPENT" as TransactionFilterType,
      label: "Point Spending",
      icon: TrendingDown,
      activeCls: "bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold shadow-lg shadow-rose-500/10",
    },
    {
      id: "WITHDRAWALS" as TransactionFilterType,
      label: "Withdrawals",
      icon: Wallet,
      activeCls: "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shadow-lg shadow-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-900/70 border border-white/5 backdrop-blur-md w-full sm:w-fit">
      {FILTERS.map((item) => {
        const Icon = item.icon;
        const isSelected = filter === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onFilterChange(item.id)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 cursor-pointer ${
              isSelected
                ? item.activeCls
                : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.count !== undefined && item.id === "ALL" && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isSelected ? "bg-white/20 text-white font-bold" : "bg-white/10 text-muted-foreground"
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
