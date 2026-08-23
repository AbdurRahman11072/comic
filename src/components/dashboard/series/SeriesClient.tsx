"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { seriesService } from "@/services/series.service";
import { userService } from "@/services/user.service";
import { siteService } from "@/services/site.service";
import { DeleteSeriesAction, ToggleFeaturedAction } from "@/actions/series";
import { RequestFeatureSeriesAction } from "@/actions/creator";
import { authClient } from "@/lib/auth-client";
import {
  BookOpen, Search, Filter, Star,
  ExternalLink, Edit2, Loader2,
  RefreshCw, Trash2, BarChart3, Layers, Plus,
  Sparkles, Eye, Coins, Calendar, Check,
  TrendingUp, Library
} from "lucide-react";
import { toast } from "react-hot-toast";

export interface CreatorSeriesItem {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  type: string;
  status: string;
  totalViews: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  genres: { id: string; name: string }[];
  featured?: { id: string } | null;
  _count?: {
    chapters: number;
    bookmarks?: number;
  };
}

interface SeriesClientProps {
  initialSeries: CreatorSeriesItem[];
  userRole?: string;
  creatorId?: string;
}

export function SeriesClient({
  initialSeries = [],
  userRole = "creator",
  creatorId,
}: SeriesClientProps) {
  const { data: session } = authClient.useSession();
  const [seriesList, setSeriesList] = useState<CreatorSeriesItem[]>(initialSeries);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sort, setSort] = useState("latest");

  const role = userRole?.toLowerCase() || (session?.user as any)?.role?.toLowerCase() || "creator";
  const isModOrAdmin = ["admin", "moderator"].includes(role);
  const canCreate = ["creator", "admin"].includes(role);

  // Request Feature Modal State for Creators
  const [requestModalSeries, setRequestModalSeries] = useState<CreatorSeriesItem | null>(null);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [pitchNotes, setPitchNotes] = useState<string>("");
  const [submittingRequest, setSubmittingRequest] = useState<boolean>(false);
  const [userPoints, setUserPoints] = useState<number>((session?.user as any)?.points || 0);
  const [baseFee, setBaseFee] = useState<number>(500);

  // Delete Modal State
  const [seriesToDelete, setSeriesToDelete] = useState<CreatorSeriesItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch creator points & featured request base fee
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [userRes, configRes] = await Promise.all([
          userService.getProfile().catch(() => null),
          siteService.getSiteConfig().catch(() => null),
        ]);
        if (userRes?.data?.points !== undefined) {
          setUserPoints(userRes.data.points);
        } else if ((session?.user as any)?.points !== undefined) {
          setUserPoints((session?.user as any).points);
        }
        if (configRes?.data?.featuredRequestFee) {
          setBaseFee(configRes.data.featuredRequestFee);
        }
      } catch (_e) {
        if ((session?.user as any)?.points !== undefined) {
          setUserPoints((session?.user as any).points);
        }
      }
    };

    loadUserData();
  }, [session, requestModalSeries]);

  // Client-side fetch on refresh or query updates
  const fetchSeries = async () => {
    setLoading(true);
    try {
      const fetchParams: any = { limit: 100 };
      if (creatorId) {
        fetchParams.creatorId = creatorId;
      }
      if (statusFilter !== "ALL") fetchParams.status = statusFilter;
      if (typeFilter !== "ALL") fetchParams.type = typeFilter;
      if (sort) fetchParams.sort = sort;
      if (debouncedSearch.trim()) fetchParams.search = debouncedSearch.trim();

      const res = await seriesService.getAllSeries(fetchParams);
      if (res.success && Array.isArray(res.data)) {
        setSeriesList(res.data);
      } else {
        toast.error(res.message || "Failed to refresh series list.");
      }
    } catch (_err) {
      toast.error("Failed to load series catalog.");
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalSeries = seriesList.length;
    const totalChapters = seriesList.reduce((acc, s) => acc + (s._count?.chapters || 0), 0);
    const totalViews = seriesList.reduce((acc, s) => acc + (s.totalViews || 0), 0);
    const ongoingCount = seriesList.filter((s) => s.status === "ONGOING").length;
    return { totalSeries, totalChapters, totalViews, ongoingCount };
  }, [seriesList]);

  // Filtered & sorted series for view
  const filteredSeries = useMemo(() => {
    return seriesList.filter((item) => {
      const matchesSearch =
        debouncedSearch === "" ||
        item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.slug.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.genres?.some((g) => g.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesType = typeFilter === "ALL" || item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      if (sort === "popular") return (b.totalViews || 0) - (a.totalViews || 0);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  }, [seriesList, debouncedSearch, statusFilter, typeFilter, sort]);

  // Delete Action
  const handleDeleteSeries = async () => {
    if (!seriesToDelete) return;
    setDeleting(true);
    try {
      const data = await DeleteSeriesAction(seriesToDelete.id);
      if (data.success) {
        toast.success(`Series "${seriesToDelete.title}" deleted successfully.`);
        setSeriesList((prev) => prev.filter((s) => s.id !== seriesToDelete.id));
        setSeriesToDelete(null);
      } else {
        toast.error(data.message || "Failed to delete series.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete series.");
    } finally {
      setDeleting(false);
    }
  };

  // Staff Featured Toggle
  const handleToggleFeatured = async (id: string) => {
    try {
      const data = await ToggleFeaturedAction(id);
      if (data.success) {
        toast.success(data.data?.featured ? "Series featured on homepage!" : "Series removed from featured.");
        setSeriesList((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, featured: data.data?.featured ? { id: "featured" } : null } : s
          )
        );
      } else {
        toast.error(data.message || "Failed to update featured status.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to toggle featured status.");
    }
  };

  // Calculate dynamic point cost based on duration
  const getMultiplier = (days: number) => {
    if (days >= 28) return 4;
    if (days >= 14) return 2;
    return 1;
  };
  const totalCost = baseFee * getMultiplier(durationDays);

  // Submit Feature Request Action
  const handleSubmitFeatureRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalSeries) return;

    if (userPoints < totalCost) {
      toast.error(`Insufficient points. You have ${userPoints} points but need ${totalCost} points.`);
      return;
    }

    setSubmittingRequest(true);
    try {
      const res = await RequestFeatureSeriesAction({
        seriesId: requestModalSeries.id,
        durationDays,
        notes: pitchNotes.trim() || undefined,
      });

      if (res.success) {
        toast.success("Featured placement request submitted to administration!");
        setUserPoints((prev) => Math.max(0, prev - totalCost));
        setRequestModalSeries(null);
        setPitchNotes("");
        setDurationDays(7);
      } else {
        toast.error(res.message || "Failed to submit request.");
      }
    } catch (_err) {
      toast.error("Failed to submit featured request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <BookOpen className="w-6 h-6 text-primary" /> Series & Studio Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish, edit, upload chapters, and track engagement across your comic catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSeries()}
            disabled={loading}
            className="p-2.5 rounded-xl glass glass-hover text-white/70 hover:text-white border border-white/10 cursor-pointer disabled:opacity-50"
            title="Refresh Series"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
          {canCreate && (
            <Link
              href="/dashboard/series/add"
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add New Series
            </Link>
          )}
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Series</p>
            <p className="text-xl font-bold text-white tracking-tight">{stats.totalSeries}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Published Chapters</p>
            <p className="text-xl font-bold text-white tracking-tight">{stats.totalChapters}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Views</p>
            <p className="text-xl font-bold text-white tracking-tight">{stats.totalViews.toLocaleString()}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Active / Ongoing</p>
            <p className="text-xl font-bold text-white tracking-tight">{stats.ongoingCount}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by series title, slug, or genre..."
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            onChange={(e) => setTypeFilter(e.target.value)}
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
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none ml-auto cursor-pointer"
          >
            <option value="latest" className="bg-neutral-900">Recently Updated</option>
            <option value="popular" className="bg-neutral-900">Most Views</option>
            <option value="rating" className="bg-neutral-900">Highest Rating</option>
            <option value="oldest" className="bg-neutral-900">Oldest Created</option>
          </select>
        </div>
      </div>

      {/* Series Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your series catalog...</p>
          </div>
        ) : filteredSeries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Series</th>
                  <th className="px-4 py-3.5">Chapters</th>
                  <th className="px-4 py-3.5">Views & Rating</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Promotion</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSeries.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition group">
                    {/* Series Title & Cover */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 max-w-xs">
                        <div className="w-10 h-14 rounded-lg bg-white/10 overflow-hidden shrink-0 border border-white/10 shadow-sm relative group-hover:border-primary/40 transition-colors">
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30">📖</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">/{item.slug}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-semibold uppercase">
                              {item.type}
                            </span>
                            {item.genres?.slice(0, 2).map((g) => (
                              <span key={g.id} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                {g.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Chapters */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-white text-sm">{item._count?.chapters || 0}</span>
                      <span className="text-[10px] text-muted-foreground block">chapters</span>
                    </td>

                    {/* Views & Rating */}
                    <td className="px-4 py-3.5">
                      <p className="text-white font-medium flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" /> {(item.totalViews || 0).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {(item.rating || 0).toFixed(1)}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === "ONGOING"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : item.status === "COMPLETED"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Promotion / Featured Column */}
                    <td className="px-4 py-3.5">
                      {isModOrAdmin ? (
                        <button
                          onClick={() => handleToggleFeatured(item.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            item.featured
                              ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/30 shadow-sm"
                              : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/10"
                          }`}
                          title={item.featured ? "Click to unfeature from homepage" : "Click to directly feature on homepage"}
                        >
                          <Star className={`w-3.5 h-3.5 ${item.featured ? "fill-current text-yellow-400" : ""}`} />
                          <span>{item.featured ? "Featured" : "Not Featured"}</span>
                        </button>
                      ) : item.featured ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 shadow-sm"
                          title="This series is currently featured on the homepage"
                        >
                          <Star className="w-3.5 h-3.5 fill-current text-yellow-400" /> Featured
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRequestModalSeries(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-muted-foreground bg-white/5 hover:bg-yellow-400/10 hover:text-yellow-400 border border-white/10 hover:border-yellow-400/30 transition-all group/btn cursor-pointer"
                          title="Request featured placement on homepage for author points"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-400/70 group-hover/btn:text-yellow-400" />
                          <span>Request Feature</span>
                        </button>
                      )}
                    </td>

                    {/* Actions Toolbar */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/chapters/add?seriesId=${item.id}`}
                          className="p-2 rounded-lg glass glass-hover text-emerald-400/80 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                          title="Add New Chapter"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/dashboard/series/${item.id}/analytics`}
                          className="p-2 rounded-lg glass glass-hover text-cyan-400/80 hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                          title="View Series Analytics & Diagnostics"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/dashboard/series/${item.id}`}
                          className="p-2 rounded-lg glass glass-hover text-purple-400/80 hover:text-purple-400 hover:bg-purple-500/10 transition"
                          title="Manage Series & Chapters"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/dashboard/series/edit/${item.id}`}
                          className="p-2 rounded-lg glass glass-hover text-primary/80 hover:text-primary hover:bg-primary/10 transition"
                          title="Edit Series Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/series/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg glass glass-hover text-white/50 hover:text-white transition"
                          title="Open Public Reader View"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => setSeriesToDelete(item)}
                          className="p-2 rounded-lg glass glass-hover text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                          title="Delete Series"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
              <BookOpen className="w-8 h-8 opacity-40" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Series Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {search || statusFilter !== "ALL" || typeFilter !== "ALL"
                  ? "No titles matched your active filter criteria."
                  : "You haven't published any series yet. Create your first series to get started!"}
              </p>
            </div>
            {canCreate && (
              <Link
                href="/dashboard/series/add"
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create First Series
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Creator Request Feature Modal */}
      {requestModalSeries && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-[#13161c] border border-yellow-500/30 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30 shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Request Featured Placement</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                    {requestModalSeries.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRequestModalSeries(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFeatureRequest} className="space-y-5">
              {/* Duration Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Promotion Duration
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { days: 7, label: "7 Days", sub: "1x Fee" },
                    { days: 14, label: "14 Days", sub: "2x Fee" },
                    { days: 30, label: "30 Days", sub: "4x Fee" },
                  ].map((option) => (
                    <button
                      key={option.days}
                      type="button"
                      onClick={() => setDurationDays(option.days)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        durationDays === option.days
                          ? "bg-yellow-400/20 border-yellow-400 text-yellow-300 shadow-md"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="text-sm font-bold">{option.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{option.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pitch Notes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80">
                  Pitch Notes for Moderators <span className="text-white/40 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={pitchNotes}
                  onChange={(e) => setPitchNotes(e.target.value)}
                  placeholder="Explain why this series should be featured on the hero placement..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400/50 resize-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Points Summary */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Cost: {totalCost} Points</div>
                    <div className="text-[10px] text-muted-foreground">Your Balance: {userPoints} Points</div>
                  </div>
                </div>
                {userPoints < totalCost ? (
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                    Insufficient Points
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestModalSeries(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest || userPoints < totalCost}
                  className="px-5 py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-xs hover:bg-yellow-300 disabled:opacity-50 transition shadow-lg shadow-yellow-400/20 flex items-center gap-2 cursor-pointer"
                >
                  {submittingRequest ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Submit Request (-{totalCost} pts)
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {seriesToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-[#13161c] border border-red-500/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete Series Permanently?</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Are you sure you want to delete <span className="text-white font-semibold">"{seriesToDelete.title}"</span>? All published chapters, pages, comments, and stats will be irreversibly removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSeriesToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSeries}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 disabled:opacity-50 transition shadow-lg shadow-red-500/20 flex items-center gap-2 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Delete Series
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
