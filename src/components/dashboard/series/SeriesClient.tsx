"use client";

import { RequestFeatureSeriesAction } from "@/actions/creator";
import { AdminHideSeriesAction, DeleteSeriesAction, ToggleFeaturedAction } from "@/actions/series";
import { authClient } from "@/lib/auth-client";
import { seriesService } from "@/services/series.service";
import { siteService } from "@/services/site.service";
import { userService } from "@/services/user.service";
import { BookOpen, Loader2, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { SeriesStatsOverview } from "./SeriesStatsOverview";
import { SeriesFiltersToolbar } from "./SeriesFiltersToolbar";
import { SeriesRowItem } from "./SeriesRowItem";
import { AdminHideSeriesModal } from "./AdminHideSeriesModal";
import { RequestFeatureModal } from "./RequestFeatureModal";
import { DeleteSeriesDialog } from "./DeleteSeriesDialog";

export interface UnifiedSeriesItem {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  type: string;
  status: string;
  totalViews: number;
  rating: number;
  isHidden?: boolean;
  hiddenReason?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name?: string;
    channelName?: string;
    email?: string;
    image?: string | null;
    profileImage?: string | null;
  } | null;
  genres: { id: string; name: string }[];
  featured?: { id: string } | null;
  _count?: {
    chapters: number;
    reports?: number;
    bookmarks?: number;
  };
}

interface SeriesClientProps {
  initialSeries: UnifiedSeriesItem[];
  initialTotal?: number;
  userRole?: string;
  creatorId?: string;
}

export function SeriesClient({
  initialSeries = [],
  initialTotal = 0,
  userRole = "creator",
  creatorId,
}: SeriesClientProps) {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const initialSearchParam = searchParams.get("search") || "";

  const [seriesList, setSeriesList] = useState<UnifiedSeriesItem[]>(initialSeries);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialSearchParam);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearchParam);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [hiddenFilter, setHiddenFilter] = useState("all");
  const [sort, setSort] = useState("latest");
  const [_total, setTotal] = useState(initialTotal || initialSeries.length);

  // Sync URL search param changes
  useEffect(() => {
    const query = searchParams.get("search");
    if (query !== null && query !== search) {
      setSearch(query);
      setDebouncedSearch(query);
    }
  }, [searchParams]);

  const role = userRole?.toLowerCase() || (session?.user as any)?.role?.toLowerCase() || "creator";
  const isModOrAdmin = ["admin", "moderator"].includes(role);
  const canCreate = ["creator", "admin"].includes(role);

  // Modal States
  const [requestModalSeries, setRequestModalSeries] = useState<UnifiedSeriesItem | null>(null);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [pitchNotes, setPitchNotes] = useState<string>("");
  const [submittingRequest, setSubmittingRequest] = useState<boolean>(false);
  const [userPoints, setUserPoints] = useState<number>((session?.user as any)?.points || 0);
  const [baseFee, setBaseFee] = useState<number>(500);

  const [selectedSeriesForHide, setSelectedSeriesForHide] = useState<UnifiedSeriesItem | null>(null);
  const [hideReason, setHideReason] = useState("");
  const [updatingHide, setUpdatingHide] = useState(false);

  const [seriesToDelete, setSeriesToDelete] = useState<UnifiedSeriesItem | null>(null);
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
      if (isModOrAdmin) {
        const params: any = { page: 1, limit: 100, sort };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (statusFilter !== "ALL") params.status = statusFilter;
        if (typeFilter !== "ALL") params.type = typeFilter;
        if (hiddenFilter !== "all") params.isHidden = hiddenFilter;

        const data = await seriesService.getAdminAllSeries(params);
        if (data.success && Array.isArray(data.data)) {
          setSeriesList(data.data);
          setTotal(data.pagination?.total || data.meta?.total || data.data.length);
        } else {
          toast.error(data.message || "Failed to load series catalog.");
        }
      } else {
        const fetchParams: any = { limit: 100 };
        if (creatorId) fetchParams.creatorId = creatorId;
        if (statusFilter !== "ALL") fetchParams.status = statusFilter;
        if (typeFilter !== "ALL") fetchParams.type = typeFilter;
        if (sort) fetchParams.sort = sort;
        if (debouncedSearch.trim()) fetchParams.search = debouncedSearch.trim();

        const res = await seriesService.getAllSeries(fetchParams);
        if (res.success && Array.isArray(res.data)) {
          setSeriesList(res.data);
          setTotal(res.pagination?.total || res.meta?.total || res.data.length);
        } else {
          toast.error(res.message || "Failed to refresh series list.");
        }
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
    const hiddenCount = seriesList.filter((s) => s.isHidden).length;
    return { totalSeries, totalChapters, totalViews, ongoingCount, hiddenCount };
  }, [seriesList]);

  // Filtered & sorted series for view
  const filteredSeries = useMemo(() => {
    return seriesList
      .filter((item) => {
        const matchesSearch =
          debouncedSearch === "" ||
          item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.slug.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.genres?.some((g) => g.name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (isModOrAdmin &&
            (item.creator?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              item.creator?.email?.toLowerCase().includes(debouncedSearch.toLowerCase())));

        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
        const matchesType = typeFilter === "ALL" || item.type === typeFilter;
        const matchesHidden = hiddenFilter === "all" || String(!!item.isHidden) === hiddenFilter;

        return matchesSearch && matchesStatus && matchesType && matchesHidden;
      })
      .sort((a, b) => {
        if (sort === "popular") return (b.totalViews || 0) - (a.totalViews || 0);
        if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
  }, [seriesList, debouncedSearch, statusFilter, typeFilter, hiddenFilter, sort, isModOrAdmin]);

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

  // Staff Featured Toggle (1-click)
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

  // Staff Hide / Restore Action
  const handleToggleHide = async () => {
    if (!selectedSeriesForHide) return;
    setUpdatingHide(true);
    const newHiddenState = !selectedSeriesForHide.isHidden;
    const reason = newHiddenState ? hideReason.trim() || "Hidden by administration" : null;

    try {
      const data = await AdminHideSeriesAction(selectedSeriesForHide.id, newHiddenState, reason);
      if (data.success) {
        toast.success(newHiddenState ? "Series hidden from public" : "Series restored to public");
        setSeriesList((prev) =>
          prev.map((s) =>
            s.id === selectedSeriesForHide.id
              ? { ...s, isHidden: newHiddenState, hiddenReason: data.data?.hiddenReason || reason }
              : s
          )
        );
        setSelectedSeriesForHide(null);
        setHideReason("");
      } else {
        toast.error(data.message || "Failed to update series visibility.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update series visibility.");
    } finally {
      setUpdatingHide(false);
    }
  };

  // Creator Feature Request Submission
  const handleSubmitFeatureRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalSeries) return;

    const getMultiplier = (days: number) => (days >= 28 ? 4 : days >= 14 ? 2 : 1);
    const totalCost = baseFee * getMultiplier(durationDays);

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
            <BookOpen className="w-6 h-6 text-primary" />
            {isModOrAdmin ? "Series & Content Moderation" : "My Series & Studio Management"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isModOrAdmin
              ? "Manage all platform series, monitor chapter counts, handle copyright/DMCA reports, and moderate content."
              : "Publish, edit, upload chapters, and track engagement across your comic catalog."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSeries()}
            disabled={loading}
            className="p-2.5 rounded-xl glass glass-hover text-white/70 hover:text-white border border-white/10 cursor-pointer disabled:opacity-50"
            title="Refresh Series Catalog"
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
      <SeriesStatsOverview stats={stats} isModOrAdmin={isModOrAdmin} />

      {/* Filter & Search Bar */}
      <SeriesFiltersToolbar
        search={search}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        hiddenFilter={hiddenFilter}
        sort={sort}
        isModOrAdmin={isModOrAdmin}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
        onHiddenFilterChange={setHiddenFilter}
        onSortChange={setSort}
      />

      {/* Series Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading series catalog...</p>
          </div>
        ) : filteredSeries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Series</th>
                  {isModOrAdmin && <th className="px-4 py-3.5">Creator</th>}
                  <th className="px-4 py-3.5">Chapters</th>
                  <th className="px-4 py-3.5">Views & Rating</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Promotion</th>
                  {isModOrAdmin && <th className="px-4 py-3.5">Visibility</th>}
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSeries.map((item) => (
                  <SeriesRowItem
                    key={item.id}
                    item={item}
                    isModOrAdmin={isModOrAdmin}
                    onToggleFeatured={handleToggleFeatured}
                    onRequestFeature={setRequestModalSeries}
                    onOpenHideModal={(s) => {
                      setSelectedSeriesForHide(s);
                      setHideReason(s.hiddenReason || "");
                    }}
                    onOpenDeleteDialog={setSeriesToDelete}
                  />
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
                {search || statusFilter !== "ALL" || typeFilter !== "ALL" || hiddenFilter !== "all"
                  ? "No titles matched your active filter criteria."
                  : isModOrAdmin
                  ? "No series catalog entries exist on the platform yet."
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

      {/* Staff Hide / Moderation Modal */}
      <AdminHideSeriesModal
        series={selectedSeriesForHide}
        hideReason={hideReason}
        updatingHide={updatingHide}
        onHideReasonChange={setHideReason}
        onClose={() => setSelectedSeriesForHide(null)}
        onConfirm={handleToggleHide}
      />

      {/* Creator Request Feature Modal */}
      <RequestFeatureModal
        series={requestModalSeries}
        durationDays={durationDays}
        pitchNotes={pitchNotes}
        userPoints={userPoints}
        baseFee={baseFee}
        submittingRequest={submittingRequest}
        onDurationDaysChange={setDurationDays}
        onPitchNotesChange={setPitchNotes}
        onClose={() => setRequestModalSeries(null)}
        onSubmit={handleSubmitFeatureRequest}
      />

      {/* Delete Confirmation Modal */}
      <DeleteSeriesDialog
        series={seriesToDelete}
        deleting={deleting}
        onClose={() => setSeriesToDelete(null)}
        onConfirm={handleDeleteSeries}
      />
    </div>
  );
}
