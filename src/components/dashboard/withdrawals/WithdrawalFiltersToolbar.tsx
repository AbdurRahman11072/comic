"use client";

import React from "react";
import { CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { WithdrawalMetaData } from "@/services/withdrawal.service";

export type WithdrawalTabType = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

interface WithdrawalFiltersToolbarProps {
  activeTab: WithdrawalTabType;
  searchQuery: string;
  meta: WithdrawalMetaData | null;
  onTabChange: (tab: WithdrawalTabType) => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function WithdrawalFiltersToolbar({
  activeTab,
  searchQuery,
  meta,
  onTabChange,
  onSearchChange,
  onSearchSubmit,
}: WithdrawalFiltersToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
        <button
          onClick={() => onTabChange("PENDING")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === "PENDING"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending ({meta?.totalPending ?? 0})
        </button>
        <button
          onClick={() => onTabChange("APPROVED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === "APPROVED"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved ({meta?.totalApproved ?? 0})
        </button>
        <button
          onClick={() => onTabChange("REJECTED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === "REJECTED"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Rejected ({meta?.totalRejected ?? 0})
        </button>
        <button
          onClick={() => onTabChange("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
            activeTab === "ALL"
              ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Requests
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={onSearchSubmit} className="relative min-w-[260px]">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search user, email, bank..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
        />
      </form>
    </div>
  );
}
