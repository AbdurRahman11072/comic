"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationFooterProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function PaginationFooter({
  page,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
}: PaginationFooterProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= (itemsPerPage || 10))) {
    return null;
  }

  const startItem = totalItems !== undefined && itemsPerPage ? (page - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems !== undefined && itemsPerPage ? Math.min(page * itemsPerPage, totalItems) : null;

  // Generate pagination range with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs text-muted-foreground ${className}`}
    >
      {/* Item Range Display */}
      <div>
        {totalItems !== undefined && startItem !== null && endItem !== null ? (
          <span>
            Showing <strong className="text-white font-semibold">{startItem}</strong> to{" "}
            <strong className="text-white font-semibold">{endItem}</strong> of{" "}
            <strong className="text-white font-semibold">{totalItems}</strong> items
          </span>
        ) : (
          <span>
            Page <strong className="text-white font-semibold">{page}</strong> of{" "}
            <strong className="text-white font-semibold">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer font-medium"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Page Pills */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-muted-foreground">
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === page;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25 border border-primary/40"
                    : "border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer font-medium"
          title="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
