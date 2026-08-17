"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/input";
import { Series } from "@/types";
import {
  Edit2, Eye, Filter, Search, Star, Trash2, Plus,
  Sparkles, Coins, Calendar, X, Loader2, AlertCircle, Check
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DeleteSeriesAction, ToggleFeaturedAction } from "@/actions/series";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { authClient } from "@/lib/auth-client";

interface SeriesTableProps {
  initialSeries: Series[];
  userRole?: string;
}

export function SeriesTable({ initialSeries, userRole }: SeriesTableProps) {
  const { data: session } = authClient.useSession();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const router = useRouter();

  const role = userRole?.toLowerCase() || (session?.user as any)?.role?.toLowerCase() || "";
  const isModOrAdmin = ["admin", "moderator"].includes(role);
  const isCreator = role === "creator";
  const canModify = ["creator", "admin", "moderator"].includes(role);

  // Request Feature Modal State for Creators
  const [requestModalSeries, setRequestModalSeries] = useState<Series | null>(null);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [pitchNotes, setPitchNotes] = useState<string>("");
  const [submittingRequest, setSubmittingRequest] = useState<boolean>(false);
  const [userPoints, setUserPoints] = useState<number>((session?.user as any)?.points || 0);
  const [baseFee, setBaseFee] = useState<number>(500);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch creator points and base fee on mount and when modal opens
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, configRes] = await Promise.all([
          api.get("/api/v1/user/profile").catch(() => null),
          api.get("/api/v1/site-config").catch(() => null),
        ]);
        if (userRes?.data?.data?.points !== undefined) {
          setUserPoints(userRes.data.data.points);
        } else if ((session?.user as any)?.points !== undefined) {
          setUserPoints((session?.user as any).points);
        }
        if (configRes?.data?.data?.featuredRequestFee) {
          setBaseFee(configRes.data.data.featuredRequestFee);
        }
      } catch (e) {
        console.error("Failed to load fee or points", e);
        if ((session?.user as any)?.points !== undefined) {
          setUserPoints((session?.user as any).points);
        }
      }
    };

    loadData();
  }, [requestModalSeries, session]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this series? All chapters will be deleted too.")) return;
    try {
      const res = await DeleteSeriesAction(id);
      if (res.success) {
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete series.");
      }
    } catch (error) {
      console.error("Failed to delete series:", error);
      toast.error("Failed to delete series. Please try again.");
    }
  };

  const handleAdminToggleFeatured = async (id: string) => {
    try {
      const res = await ToggleFeaturedAction(id);
      if (res.success) {
        toast.success(res.data?.featured ? "Series added to featured homepage!" : "Series removed from featured.");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update featured status.");
      }
    } catch (error) {
      console.error("Failed to toggle featured status:", error);
      toast.error("Failed to update featured status.");
    }
  };

  // Calculate dynamic point cost based on duration
  const getMultiplier = (days: number) => {
    if (days >= 28) return 4;
    if (days >= 14) return 2;
    return 1;
  };
  const totalCost = baseFee * getMultiplier(durationDays);

  const handleSubmitFeatureRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalSeries) return;

    if (userPoints < totalCost) {
      toast.error(`Insufficient points. You have ${userPoints} points but need ${totalCost} points.`);
      return;
    }

    setSubmittingRequest(true);
    try {
      const res = await api.post("/api/v1/creators/feature-request", {
        seriesId: requestModalSeries.id,
        durationDays,
        notes: pitchNotes.trim() || undefined,
      });

      if (res.data?.success) {
        toast.success("Featured placement request submitted to admin!");
        setRequestModalSeries(null);
        setPitchNotes("");
        setDurationDays(7);
        router.refresh();
      } else {
        toast.error(res.data?.message || "Failed to submit request.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit featured request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const filteredSeries = initialSeries.filter(s => 
    s.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search series..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <button className="p-2.5 glass rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <DataTable 
        data={filteredSeries}
        columns={[
          { 
            header: "Series", 
            accessor: (item: Series) => (
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-14 bg-white/5 border border-white/10 rounded overflow-hidden bg-center bg-cover"
                  style={{ backgroundImage: `url(${item.coverUrl})` }}
                />
                <div className="font-bold truncate max-w-[200px]">{item.title}</div>
              </div>
            )
          },
          { 
            header: "Featured", 
            accessor: (item: Series) => {
              if (isModOrAdmin) {
                return (
                  <button 
                    onClick={() => handleAdminToggleFeatured(item.id)}
                    className={`p-2 rounded-lg transition-all ${
                      item.featured 
                        ? "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-yellow-400"
                    }`}
                    title={item.featured ? "Click to remove from featured homepage" : "Click to directly feature on homepage"}
                  >
                    <Star className={`w-4 h-4 ${item.featured ? "fill-current" : ""}`} />
                  </button>
                );
              }

              if (item.featured) {
                return (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 shadow-sm"
                    title="This series is currently featured on the homepage"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" /> Featured
                  </span>
                );
              }

              return (
                <button
                  type="button"
                  onClick={() => setRequestModalSeries(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-muted-foreground bg-white/5 hover:bg-yellow-400/10 hover:text-yellow-400 border border-white/10 hover:border-yellow-400/30 transition-all group"
                  title="Request featured placement for coins"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400/70 group-hover:text-yellow-400" />
                  <span>Request Feature</span>
                </button>
              );
            }
          },
          { header: "Type", accessor: "type", className: "text-muted-foreground uppercase text-xs" },
          { 
            header: "Status", 
            accessor: (item: Series) => (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                item.status === "ONGOING" ? "text-blue-400 bg-blue-400/10" : "text-green-400 bg-green-400/10"
              }`}>
                {item.status}
              </span>
            )
          },
          { header: "Chapters", accessor: (item: Series) => item._count?.chapters || 0 },
          { 
            header: "Actions", 
            accessor: (item: Series) => (
              <div className="flex items-center justify-end gap-1">
                {canModify && (
                  <Link href={`/dashboard/chapters/add?seriesId=${item.id}`} className="p-2 hover:bg-green-500/10 hover:text-green-500 rounded-lg transition-colors" title="Add Chapter">
                    <Plus className="w-4 h-4" />
                  </Link>
                )}
                <Link href={`/series/${item.slug}`} className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors" title="View Series">
                  <Eye className="w-4 h-4" />
                </Link>
                {canModify && (
                  <>
                    <Link href={`/dashboard/series/edit/${item.id}`} className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors" title="Edit Series">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete Series"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ),
            className: "text-right"
          }
        ]}
      />

      {/* Creator Request Feature Modal */}
      {requestModalSeries && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-yellow-500/30 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Request Featured Placement</h3>
                  <p className="text-xs text-muted-foreground">Get your series promoted on the homepage top banner</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalSeries(null)}
                className="p-1 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Series Target Info */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
              <div
                className="w-12 h-16 rounded-xl bg-white/10 bg-cover bg-center shrink-0 border border-white/10"
                style={{ backgroundImage: `url(${requestModalSeries.coverUrl})` }}
              />
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{requestModalSeries.title}</h4>
                <p className="text-xs text-muted-foreground uppercase">{requestModalSeries.type} · {requestModalSeries.status}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitFeatureRequest} className="space-y-5">
              {/* Duration Time Lap Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Select Featured Duration (Time Lap)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { days: 7, label: "1 Week", desc: "7 Days", multiplier: 1 },
                    { days: 14, label: "2 Weeks", desc: "14 Days", multiplier: 2 },
                    { days: 30, label: "1 Month", desc: "30 Days", multiplier: 4 },
                  ].map((tier) => {
                    const cost = baseFee * tier.multiplier;
                    const isSelected = durationDays === tier.days;
                    return (
                      <button
                        key={tier.days}
                        type="button"
                        onClick={() => setDurationDays(tier.days)}
                        className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                          isSelected
                            ? "bg-yellow-500/20 border-yellow-400/80 text-white shadow-lg shadow-yellow-500/10"
                            : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="font-bold text-sm">{tier.label}</span>
                        <span className="text-[10px] text-muted-foreground">{tier.desc}</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400 mt-1">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{cost} Pts</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pitch Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Pitch / Notes for Admin (Optional)
                </label>
                <textarea
                  rows={3}
                  value={pitchNotes}
                  onChange={(e) => setPitchNotes(e.target.value)}
                  placeholder="Explain why your series is ready to be featured (e.g., new season launch, regular update schedule)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-500/50 resize-none"
                />
              </div>

              {/* Points Balance & Cost Summary Card */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" /> {userPoints.toLocaleString()} Points
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold border-t border-amber-500/20 pt-2">
                  <span className="text-amber-300">Total Placement Cost:</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-4 h-4" /> {totalCost.toLocaleString()} Points
                  </span>
                </div>
                {userPoints < totalCost && (
                  <div className="text-[11px] text-rose-400 flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Insufficient points. You need {totalCost - userPoints} more points.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestModalSeries(null)}
                  disabled={submittingRequest}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white/70 hover:text-white glass"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest || userPoints < totalCost}
                  className="px-6 py-2.5 bg-yellow-500 text-black rounded-xl text-xs font-bold hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingRequest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Pay & Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
