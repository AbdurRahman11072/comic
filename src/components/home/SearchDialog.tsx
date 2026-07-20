"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GridCard } from "./GridCard";
import { Search, X, Loader2 } from "lucide-react";
import { type Series } from "@/types";
import { seriesService } from "@/services/series.service";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/** SearchDialog — handles real-time search from the backend */
export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // auto-focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  // Handle search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await seriesService.getAllSeries({ title: query, limit: 12 });
        setResults(res.data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl w-full rounded-t-3xl sm:rounded-3xl overflow-hidden border-white/10 bg-popover flex flex-col max-h-[80vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Series</DialogTitle>
          <DialogDescription>Find your favourite manga or manhwa</DialogDescription>
        </DialogHeader>

        {/* Search bar */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/10">
          {loading ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
          ) : (
            <Search className="w-4 h-4 opacity-50 flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Series..."
            className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-muted-foreground"
          />
          <button
            onClick={() => onOpenChange(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results grid */}
        <div className="overflow-y-auto flex-1 p-4">
          {results.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5">
              {results.map((s) => (
                <GridCard key={s.id} series={s} />
              ))}
            </div>
          ) : query.trim() && !loading ? (
            <div className="py-20 text-center text-muted-foreground text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-20 text-center text-muted-foreground text-sm">
              Type to start searching...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
