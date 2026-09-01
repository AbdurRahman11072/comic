"use client";

import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
  "Harem", "Historical", "Horror", "Martial Arts", "Mecha", 
  "Mystery", "Psychological", "Romance", "Sci-fi", "Slice of Life", 
  "Sports", "Supernatural", "Tragedy"
];

export function SeriesFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [type, setType] = useState(() => searchParams.get("type") || "");
  const [status, setStatus] = useState(() => searchParams.get("status") || "");
  const [sort, setSort] = useState(() => searchParams.get("sort") || "latest");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() =>
    searchParams.get("genre") ? searchParams.get("genre")!.split(",") : []
  );

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const isInitialMount = useRef(true);

  // Auto-focus search input when navigated from Navbar Search Icon (?focus=search)
  useEffect(() => {
    if (searchParams.get("focus") === "search") {
      const timer = setTimeout(() => {
        const input = document.getElementById("series-search-input");
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Sync state when URL searchParams change externally (e.g. Navbar search or browser Back/Forward)
  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    const currentType = searchParams.get("type") || "";
    const currentStatus = searchParams.get("status") || "";
    const currentSort = searchParams.get("sort") || "latest";
    const currentGenreStr = searchParams.get("genre") || "";
    const currentGenres = currentGenreStr ? currentGenreStr.split(",") : [];

    if (currentQ !== query) {
      setQuery(currentQ);
      setDebouncedQuery(currentQ);
    }
    if (currentType !== type) setType(currentType);
    if (currentStatus !== status) setStatus(currentStatus);
    if (currentSort !== sort) setSort(currentSort);
    if (selectedGenres.join(",") !== currentGenreStr) {
      setSelectedGenres(currentGenres);
    }
  }, [searchParams]);

  // Debounce the search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Update URL only when filter states actually change and differ from current URL
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    if (sort && sort !== "latest") params.set("sort", sort);
    if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));

    const newQueryString = params.toString();
    const currentParams = new URLSearchParams(searchParams.toString());
    // Normalize current params for comparison (ignoring internal focus/rsc parameters)
    const normalizedCurrent = new URLSearchParams();
    if (currentParams.get("q")) normalizedCurrent.set("q", currentParams.get("q")!);
    if (currentParams.get("type")) normalizedCurrent.set("type", currentParams.get("type")!);
    if (currentParams.get("status")) normalizedCurrent.set("status", currentParams.get("status")!);
    if (currentParams.get("sort") && currentParams.get("sort") !== "latest") {
      normalizedCurrent.set("sort", currentParams.get("sort")!);
    }
    if (currentParams.get("genre")) normalizedCurrent.set("genre", currentParams.get("genre")!);

    if (newQueryString !== normalizedCurrent.toString()) {
      const targetUrl = newQueryString ? `${pathname}?${newQueryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    }
  }, [debouncedQuery, type, status, sort, selectedGenres, pathname]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setType("");
    setStatus("");
    setSort("latest");
    setSelectedGenres([]);
  };

  const hasActiveFilters =
    Boolean(query) ||
    Boolean(type) ||
    Boolean(status) ||
    sort !== "latest" ||
    selectedGenres.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center border border-white/5 shadow-xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            id="series-search-input"
            className="pl-10 w-full bg-background/50 border-white/10" 
            placeholder="Search series..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="flex-1 md:w-40 bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Types</option>
            <option value="manhwa">Manhwa</option>
            <option value="manga">Manga</option>
            <option value="manhua">Manhua</option>
          </select>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 md:w-40 bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Status</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="HIATUS">Hiatus</option>
          </select>
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            className="flex-1 md:w-40 bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
            <option value="rating">Top Rated</option>
          </select>

          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="p-2.5 glass rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Genre Grid */}
      <div className="glass p-6 rounded-2xl space-y-4 border border-white/5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-foreground">
            <Filter className="w-5 h-5 text-primary" />
            <span>Genres</span>
          </div>
          {selectedGenres.length > 0 && (
            <span className="text-xs text-muted-foreground">{selectedGenres.length} selected</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                selectedGenres.includes(genre)
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                  : "glass glass-hover border-white/5 text-muted-foreground hover:text-white"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
