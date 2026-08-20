"use client";

import { useEffect, useState } from "react";
import { Sparkles, Check, X, Loader2, AlertCircle, Plus, Coins, Calendar, FileText } from "lucide-react";
import api from "@/lib/api";
import { userService } from "@/services/user.service";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";

interface FeaturedRequest {
  id: string;
  seriesId: string;
  creatorId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes: string | null;
  createdAt: string;
  series: {
    id: string;
    title: string;
    coverUrl: string;
    slug: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Series {
  id: string;
  title: string;
  coverUrl: string;
}

export default function FeaturedRequestsPage() {
  const { data: session } = authClient.useSession();
  const [requests, setRequests] = useState<FeaturedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Creator-specific states
  const [showModal, setShowModal] = useState(false);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [durationDays, setDurationDays] = useState<number>(7);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fee, setFee] = useState(500);
  const [userPoints, setUserPoints] = useState(0);

  // Admin/Moderator states
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const userRole = (session?.user as any)?.role?.toLowerCase() || "user";
  const isCreator = userRole === "creator";
  const isModOrAdmin = userRole === "moderator" || userRole === "admin";

  const getMultiplier = (days: number) => {
    if (days >= 28) return 4;
    if (days >= 14) return 2;
    return 1;
  };
  const totalCost = fee * getMultiplier(durationDays);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isCreator) {
        // Fetch creator's requests
        const reqRes = await api.get("/creators/feature-requests");
        setRequests(reqRes.data.data || []);

        // Fetch creator's series
        const seriesRes = await api.get(`/series?creatorId=${session?.user?.id}&limit=100`);
        setSeriesList(seriesRes.data.data || []);

        // Fetch user points
        const userRes = await userService.getProfile();
        setUserPoints(userRes.data?.points || 0);

        // Fetch SiteConfig for the fee
        const configRes = await api.get("/site-config");
        if (configRes.data?.data?.featuredRequestFee) {
          setFee(configRes.data.data.featuredRequestFee);
        }
      } else if (isModOrAdmin) {
        // Fetch all requests
        const url = filterStatus === "ALL" 
          ? "/moderator/featured-requests" 
          : `/moderator/featured-requests?status=${filterStatus}`;
        const res = await api.get(url);
        setRequests(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error("Failed to load featured requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session, filterStatus]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeriesId) {
      toast.error("Please select a series");
      return;
    }
    if (userPoints < totalCost) {
      toast.error(`Insufficient points. You need ${totalCost} points.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/creators/feature-request", {
        seriesId: selectedSeriesId,
        durationDays,
        notes: notes.trim() || undefined,
      });

      if (res.data.success) {
        toast.success("Featured placement request submitted to admin!");
        setShowModal(false);
        setSelectedSeriesId("");
        setDurationDays(7);
        setNotes("");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    const notesText = reviewNotes[id]?.trim() || (status === "APPROVED" ? "Approved by staff" : "Rejected by staff");
    try {
      const res = await api.post(`/moderator/featured-requests/${id}/review`, {
        status,
        notes: notesText,
      });

      if (res.data.success) {
        toast.success(status === "APPROVED" ? "Request approved & series featured!" : "Request rejected & points refunded to creator.");
        setReviewNotes(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to review request");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" /> Featured Placement Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isCreator 
              ? "Request homepage featured banner placement for your series." 
              : "Review and approve featured series requests from platform creators."}
          </p>
        </div>

        {isCreator && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Request Featured Placement
          </button>
        )}

        {isModOrAdmin && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === status 
                    ? "bg-primary text-white" 
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Balance card for Creators */}
      {isCreator && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Your Balance</p>
              <h3 className="text-2xl font-black text-yellow-400 flex items-center gap-1.5 mt-1">
                <Coins className="w-6 h-6" /> {userPoints.toLocaleString()} Points
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Base Fee (1 Week)</p>
              <h4 className="text-lg font-bold text-white mt-1">
                {fee.toLocaleString()} Points
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-white/5">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-white">No requests found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isCreator ? "You haven't submitted any featured requests yet." : "There are no pending requests to review."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div key={req.id} className="glass p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-20 rounded-xl bg-white/10 bg-cover bg-center border border-white/10 shrink-0"
                  style={{ backgroundImage: `url(${req.series.coverUrl})` }}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{req.series.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === "APPROVED" 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                        : req.status === "REJECTED" 
                        ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  {req.creator && isModOrAdmin && (
                    <p className="text-xs text-muted-foreground">
                      Requested by: <span className="text-white font-medium">{req.creator.name}</span> ({req.creator.email})
                    </p>
                  )}
                  {req.notes && (
                    <p className="text-xs text-white/80 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 inline-block max-w-xl">
                      {req.notes}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5" /> Submitted: {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Admins / Moderators */}
              {isModOrAdmin && req.status === "PENDING" && (
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Staff review note..."
                    value={reviewNotes[req.id] || ""}
                    onChange={(e) => setReviewNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-primary/50 w-full md:w-48"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReview(req.id, "APPROVED")}
                      disabled={actionLoading === req.id}
                      className="flex-1 md:flex-none px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg transition text-xs font-bold flex items-center justify-center gap-1"
                    >
                      {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                    </button>
                    <button
                      onClick={() => handleReview(req.id, "REJECTED")}
                      disabled={actionLoading === req.id}
                      className="flex-1 md:flex-none px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition text-xs font-bold flex items-center justify-center gap-1"
                    >
                      {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Reject & Refund
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creator Feature Request */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => !submitting && setShowModal(false)} />
          <div className="relative glass border border-white/10 rounded-3xl w-full max-w-lg p-6 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-yellow-400" /> Request Featured Placement
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="p-1 hover:bg-white/10 rounded-full transition text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Select Series
                </label>
                <select
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white text-sm"
                >
                  <option value="" className="bg-neutral-900">Choose a series to feature...</option>
                  {seriesList.map((series) => (
                    <option key={series.id} value={series.id} className="bg-neutral-900 text-white">
                      {series.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Time Lap Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Featured Duration (Time Lap)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { days: 7, label: "1 Week", desc: "7 Days", multiplier: 1 },
                    { days: 14, label: "2 Weeks", desc: "14 Days", multiplier: 2 },
                    { days: 30, label: "1 Month", desc: "30 Days", multiplier: 4 },
                  ].map((tier) => {
                    const cost = fee * tier.multiplier;
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

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Pitch / Notes for Staff (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why this series should be featured or list promotion highlights..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white text-xs resize-none"
                />
              </div>

              {/* Point Warning Card */}
              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" /> {userPoints.toLocaleString()} Points
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold border-t border-yellow-500/20 pt-2">
                  <span className="text-amber-300">Total Placement Fee:</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-4 h-4" /> {totalCost.toLocaleString()} Points
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/80 pt-1">
                  💡 If staff rejects your request, the <strong className="text-white">{totalCost} Points</strong> fee is 100% refunded to your account.
                </p>
                {userPoints < totalCost && (
                  <div className="text-[11px] text-rose-400 flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Insufficient points. You need {totalCost - userPoints} more points.</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || userPoints < totalCost}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Submitting..." : "Pay & Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
