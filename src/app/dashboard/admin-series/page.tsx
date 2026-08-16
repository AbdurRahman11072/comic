"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  BookOpen, Search, Filter, EyeOff, Eye, Star,
  ExternalLink, Edit, AlertTriangle, Loader2, CheckCircle2,
  RefreshCw, ShieldAlert, Trash2
} from "lucide-react";
import { toast } from "react-hot-toast";

interface SeriesItem {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  type: string;
  status: string;
  totalViews: number;
  rating: number;
  isHidden: boolean;
  hiddenReason: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  genres: { id: string; name: string }[];
  _count: {
    chapters: number;
    reports: number;
    bookmarks: number;
  };
}

export default function AdminSeriesManagementPage() {
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [hiddenFilter, setHiddenFilter] = useState("all");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Hide Modal State
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);
  const [hideReason, setHideReason] = useState("");
  const [updatingHide, setUpdatingHide] = useState(false);

  // Delete Modal State
  const [seriesToDelete, setSeriesToDelete] = useState<SeriesItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15, sort };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (typeFilter !== "ALL") params.type = typeFilter;
      if (hiddenFilter !== "all") params.isHidden = hiddenFilter;

      const { data } = await api.get("/api/v1/series/admin/all", { params });
      if (data.success) {
        setSeriesList(data.data);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      toast.error("Failed to load series catalog.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeries = async () => {
    if (!seriesToDelete) return;
    setDeleting(true);
    try {
      const { data } = await api.delete(`/api/v1/series/${seriesToDelete.id}`);
      if (data.success) {
        toast.success(`Series "${seriesToDelete.title}" deleted successfully.`);
        setSeriesList((prev) => prev.filter((s) => s.id !== seriesToDelete.id));
        setSeriesToDelete(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete series.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [page, statusFilter, typeFilter, hiddenFilter, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSeries();
  };

  const handleToggleHide = async () => {
    if (!selectedSeries) return;
    setUpdatingHide(true);
    const newHiddenState = !selectedSeries.isHidden;

    try {
      const { data } = await api.put(`/api/v1/series/admin/${selectedSeries.id}/hide`, {
        isHidden: newHiddenState,
        hiddenReason: newHiddenState ? (hideReason.trim() || "Hidden by administration") : null,
      });

      if (data.success) {
        toast.success(newHiddenState ? "Series hidden from public" : "Series restored to public");
        setSeriesList((prev) =>
          prev.map((s) => (s.id === selectedSeries.id ? { ...s, isHidden: newHiddenState, hiddenReason: data.data.hiddenReason } : s))
        );
        setSelectedSeries(null);
        setHideReason("");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update series visibility.");
    } finally {
      setUpdatingHide(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <BookOpen className="w-6 h-6 text-primary" /> Series & Content Moderation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all platform series, monitor chapter counts, handle copyright/DMCA reports, and hide flagged content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSeries()}
            disabled={loading}
            className="p-2.5 rounded-xl glass glass-hover text-white/70 hover:text-white border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/dashboard/series/add"
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20"
          >
            + Create New Series
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass p-4 rounded-2xl border border-white/5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by series title, alternative titles, or creator name/email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary/50 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition w-full sm:w-auto"
          >
            Search
          </button>
        </form>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Visibility Filter */}
          <select
            value={hiddenFilter}
            onChange={(e) => { setHiddenFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
          >
            <option value="all" className="bg-neutral-900">All Visibility</option>
            <option value="false" className="bg-neutral-900">Visible Only</option>
            <option value="true" className="bg-neutral-900">Hidden / Flagged Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
          >
            <option value="ALL" className="bg-neutral-900">All Statuses</option>
            <option value="ONGOING" className="bg-neutral-900">Ongoing</option>
            <option value="COMPLETED" className="bg-neutral-900">Completed</option>
            <option value="HIATUS" className="bg-neutral-900">Hiatus</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
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
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white outline-none ml-auto"
          >
            <option value="latest" className="bg-neutral-900">Recently Updated</option>
            <option value="popular" className="bg-neutral-900">Most Views</option>
            <option value="rating" className="bg-neutral-900">Highest Rating</option>
            <option value="oldest" className="bg-neutral-900">Oldest Created</option>
          </select>
        </div>
      </div>

      {/* Series Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading catalog...</p>
          </div>
        ) : seriesList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Series</th>
                  <th className="px-4 py-3.5">Creator</th>
                  <th className="px-4 py-3.5">Chapters</th>
                  <th className="px-4 py-3.5">Views / Rating</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Visibility</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {seriesList.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    {/* Series Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 max-w-xs">
                        <div className="w-10 h-14 rounded-lg bg-white/10 overflow-hidden shrink-0 border border-white/10">
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30">📖</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{item.title}</p>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">/{item.slug}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">{item.type}</span>
                            {item.genres.slice(0, 2).map((g) => (
                              <span key={g.id} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{g.name}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Creator */}
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {item.creator ? (
                        <div>
                          <p className="font-semibold text-white/90">{item.creator.name}</p>
                          <p className="text-[10px] text-white/50">{item.creator.email}</p>
                        </div>
                      ) : (
                        <span className="text-white/40 italic">Platform / Official</span>
                      )}
                    </td>

                    {/* Chapters */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-white text-sm">{item._count.chapters}</span>
                      <span className="text-[10px] text-muted-foreground block">chapters</span>
                    </td>

                    {/* Views & Rating */}
                    <td className="px-4 py-3.5">
                      <p className="text-white font-medium">{item.totalViews.toLocaleString()} views</p>
                      <p className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {item.rating.toFixed(1)}
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

                    {/* Visibility */}
                    <td className="px-4 py-3.5">
                      {item.isHidden ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            <EyeOff className="w-3 h-3" /> HIDDEN
                          </span>
                          {item.hiddenReason && (
                            <p className="text-[10px] text-red-300/80 line-clamp-1 max-w-[150px]" title={item.hiddenReason}>
                              {item.hiddenReason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Eye className="w-3 h-3" /> Visible
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedSeries(item);
                            setHideReason(item.hiddenReason || "");
                          }}
                          className={`p-2 rounded-lg transition ${
                            item.isHidden
                              ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                              : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                          }`}
                          title={item.isHidden ? "Restore / Unhide series" : "Hide series from public"}
                        >
                          {item.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <Link
                          href={`/series/${item.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg glass glass-hover text-white/70 hover:text-white"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/dashboard/series/edit/${item.id}`}
                          className="p-2 rounded-lg glass glass-hover text-white/70 hover:text-white"
                          title="Edit Series Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => setSeriesToDelete(item)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
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
          <div className="py-20 text-center text-muted-foreground text-sm">
            No series matching your filters were found.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {seriesToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-500/20 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Permanently Delete Series</h3>
                <p className="text-xs text-muted-foreground">{seriesToDelete.title}</p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{seriesToDelete.title}"</strong>? 
              All associated chapters, bookmarks, user purchases, and comments will be permanently removed. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSeriesToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white glass"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSeries}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition flex items-center gap-1.5 shadow-lg shadow-red-500/20"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Confirm Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide / Unhide Confirmation Modal */}
      {selectedSeries && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${selectedSeries.isHidden ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                {selectedSeries.isHidden ? <Eye className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {selectedSeries.isHidden ? "Restore Public Visibility" : "Hide Series from Public"}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedSeries.title}</p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              {selectedSeries.isHidden
                ? "This will make the series publicly visible again on the home page, search, and reader views."
                : "Hiding this series will immediately remove it from all public listings and search results. Readers visiting its URL will see a copyright/takedown notice."}
            </p>

            {!selectedSeries.isHidden && (
              <div>
                <label className="text-[11px] font-bold text-white/80 uppercase block mb-1.5">
                  Reason for Hiding (Shown to staff & creator)
                </label>
                <textarea
                  rows={3}
                  value={hideReason}
                  onChange={(e) => setHideReason(e.target.value)}
                  placeholder="e.g. Copyright Claim / DMCA Takedown Notice / Reported by Community"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-primary/50"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedSeries(null)}
                disabled={updatingHide}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white glass"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleHide}
                disabled={updatingHide}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 ${
                  selectedSeries.isHidden
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                }`}
              >
                {updatingHide ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {selectedSeries.isHidden ? "Confirm Restore" : "Confirm Hide"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
