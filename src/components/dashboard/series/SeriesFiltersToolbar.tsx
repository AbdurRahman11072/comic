"use client";

import React from "react";
import { Filter, Search } from "lucide-react";

interface SeriesFiltersToolbarProps {
  search: string;
  statusFilter: string;
  typeFilter: string;
  hiddenFilter: string;
  sort: string;
  isModOrAdmin: boolean;
  onSearchChange: (val: string) => void;
  onStatusFilterChange: (val: string) => void;
  onTypeFilterChange: (val: string) => void;
  onHiddenFilterChange: (val: string) => void;
  onSortChange: (val: string) => void;
}

export function SeriesFiltersToolbar({
  search,
  statusFilter,
  typeFilter,
  hiddenFilter,
  sort,
  isModOrAdmin,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onHiddenFilterChange,
  onSortChange,
}: SeriesFiltersToolbarProps) {
  return (
    <div className="glass p-4 rounded-2xl border border-white/5 space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isModOrAdmin
                ? "Search by series title, slug, genre, or creator name/email..."
                : "Search by series title, slug, or genre..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary/50 outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Filter Select Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Visibility Filter for Staff */}
        {isModOrAdmin && (
          <select
            value={hiddenFilter}
            onChange={(e) => onHiddenFilterChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none cursor-pointer"
          >
            <option value="all" className="bg-neutral-900">All Visibility</option>
            <option value="false" className="bg-neutral-900">Visible Only</option>
            <option value="true" className="bg-neutral-900">Hidden / Flagged Only</option>
          </select>
        )}

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none cursor-pointer"
        >
          <option value="ALL" className="bg-neutral-900">All Statuses</option>
          <option value="ONGOING" className="bg-neutral-900">Ongoing</option>
          <option value="COMPLETED" className="bg-neutral-900">Completed</option>
          <option value="HIATUS" className="bg-neutral-900">Hiatus</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none cursor-pointer"
        >
          <option value="ALL" className="bg-neutral-900">All Types</option>
          <option value="MANHWA" className="bg-neutral-900">Manhwa</option>
          <option value="MANGA" className="bg-neutral-900">Manga</option>
          <option value="MANHUA" className="bg-neutral-900">Manhua</option>
          <option value="COMIC" className="bg-neutral-900">Comic</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none ml-auto cursor-pointer"
        >
          <option value="latest" className="bg-neutral-900">Recently Updated</option>
          <option value="popular" className="bg-neutral-900">Most Views</option>
          <option value="rating" className="bg-neutral-900">Highest Rating</option>
          <option value="oldest" className="bg-neutral-900">Oldest Created</option>
        </select>
      </div>
    </div>
  );
}
