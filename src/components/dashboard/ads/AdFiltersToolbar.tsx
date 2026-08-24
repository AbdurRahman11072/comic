"use client";

import React from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdFiltersToolbarProps {
  search: string;
  providerFilter: string;
  statusFilter: string;
  onSearchChange: (val: string) => void;
  onProviderFilterChange: (val: string) => void;
  onStatusFilterChange: (val: string) => void;
  onOpenCreate: () => void;
}

export function AdFiltersToolbar({
  search,
  providerFilter,
  statusFilter,
  onSearchChange,
  onProviderFilterChange,
  onStatusFilterChange,
  onOpenCreate,
}: AdFiltersToolbarProps) {
  return (
    <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between border border-white/5">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search by title, placement, or link..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        {/* Provider Filter */}
        <select
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
          value={providerFilter}
          onChange={(e) => onProviderFilterChange(e.target.value)}
        >
          <option value="ALL" className="bg-neutral-900">
            All Providers
          </option>
          <option value="CUSTOM" className="bg-neutral-900">
            Custom Direct
          </option>
          <option value="ADSENSE" className="bg-neutral-900">
            Google AdSense
          </option>
          <option value="ADMOB" className="bg-neutral-900">
            Google AdMob
          </option>
        </select>

        {/* Status Filter */}
        <select
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="ALL" className="bg-neutral-900">
            All Status
          </option>
          <option value="ACTIVE" className="bg-neutral-900">
            Active Only
          </option>
          <option value="PAUSED" className="bg-neutral-900">
            Paused Only
          </option>
        </select>

        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Ad Unit
        </button>
      </div>
    </div>
  );
}
