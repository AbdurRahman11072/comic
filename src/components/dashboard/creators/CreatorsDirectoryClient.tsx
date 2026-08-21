"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Palette,
  Search,
  ExternalLink,
  BookOpen,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { creatorService, CreatorItem } from "@/services/creator.service";

interface CreatorsDirectoryClientProps {
  initialCreators?: CreatorItem[];
}

export function CreatorsDirectoryClient({
  initialCreators = [],
}: CreatorsDirectoryClientProps) {
  const [creators, setCreators] = useState<CreatorItem[]>(initialCreators);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCreators = async (searchQuery = search) => {
    setLoading(true);
    try {
      const res = await creatorService.getAllCreators(
        searchQuery.trim() ? { search: searchQuery.trim() } : {}
      );
      if (res.success && res.data) {
        setCreators(res.data);
      } else {
        toast.error(res.message || "Failed to load creators list.");
      }
    } catch (_err) {
      toast.error("Failed to load creators list.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCreators();
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Palette className="w-6 h-6 text-primary" /> Creator Studios & Channels
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Directory of all registered creators, public channel profiles, publication statistics, and earnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCreators()}
            disabled={loading}
            className="p-2.5 rounded-xl glass glass-hover text-white/70 hover:text-white border border-white/10 disabled:opacity-50 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass p-4 rounded-2xl border border-white/5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by creator name, channel name, or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary/50 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition w-full sm:w-auto cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Creators Grid / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading creators directory...</p>
        </div>
      ) : creators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((c) => (
            <div
              key={c.id}
              className="glass rounded-3xl border border-white/5 overflow-hidden flex flex-col justify-between hover:border-primary/30 transition-all duration-300 group"
            >
              {/* Channel Banner & Profile Header */}
              <div>
                <div className="h-28 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 relative overflow-hidden">
                  {c.channelBanner && (
                    <img
                      src={c.channelBanner}
                      alt="Banner"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                <div className="px-6 pt-0 pb-4 relative">
                  {/* Avatar */}
                  <div className="-mt-10 mb-3 flex items-end justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-900 border-2 border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow-xl">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-lg text-primary">{c.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {c.role}
                    </span>
                  </div>

                  {/* Channel Title & Description */}
                  <h3 className="font-bold text-base text-white truncate">{c.channelName}</h3>
                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                  {c.channelDescription && (
                    <p className="text-xs text-white/70 mt-2 line-clamp-2 leading-relaxed">
                      {c.channelDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Creator Metric Badges */}
              <div className="px-6 pb-6 pt-2 space-y-4">
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Series</span>
                    <span className="font-bold text-sm text-white font-mono">{c.seriesCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Chapters</span>
                    <span className="font-bold text-sm text-purple-400 font-mono">{c.totalChapters}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Views</span>
                    <span className="font-bold text-sm text-amber-400 font-mono">{c.totalViews.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-muted-foreground">Points Balance</span>
                  <span className="font-mono font-bold text-emerald-400">{c.points.toLocaleString()} P</span>
                </div>

                {/* Navigation CTA */}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/channel/${c.channelId}`}
                    target="_blank"
                    className="flex-1 py-2.5 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>View Channel Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/dashboard/admin-series?search=${encodeURIComponent(c.name)}`}
                    className="px-3.5 py-2.5 glass glass-hover text-white/70 hover:text-white rounded-xl text-xs font-bold transition"
                    title="View all series by this creator"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-16 rounded-3xl border border-white/5 text-center text-muted-foreground text-sm">
          No creators found matching your search query.
        </div>
      )}
    </div>
  );
}
