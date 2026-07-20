"use client";

import { useEffect, useState } from "react";
import { Sparkles, Check, X, Loader2, AlertCircle, Plus, Coins, Calendar, FileText } from "lucide-react";
import api from "@/lib/api";
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
        const userRes = await api.get("/user/profile");
        setUserPoints(userRes.data.data?.points || 0);

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
    if (userPoints < fee) {
      toast.error(`Insufficient points. You need ${fee} points.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/creators/feature-request", {
        seriesId: selectedSeriesId,
        notes: notes.trim() || undefined,
      });

      if (res.data.success) {
        toast.success("Featured request submitted successfully!");
        setShowModal(false);
        setSelectedSeriesId("");
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
        toast.success(`Request ${status.toLowerCase()} successfully!`);
        // Clear notes for this request
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
            <Sparkles className="w-6 h-6 text-yellow-400" /> Featured Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isCreator 
              ? "Request to feature your series on the home page." 
              : "Review and approve featured series requests from creators."}
          </p>
        </div>

        {isCreator && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Request Featured Status
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
              <p className="text-xs text-muted-foreground">Request Fee</p>
              <h3 className="text-lg font-bold text-white mt-1">
                {fee.toLocaleString()} Points
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Request List */}
      {requests.length === 0 ? (
        <div className="glass rounded-2xl border border-white/5 p-12 text-center text-muted-foreground">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-semibold text-white">No requests found</p>
          <p className="text-xs mt-1">
            {isCreator 
              ? "You haven't made any featured requests yet." 
              : "There are no pending featured requests in this status."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="glass rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex gap-4 items-center flex-1">
                <div 
                  className="w-12 h-16 bg-white/5 border border-white/10 rounded-lg overflow-hidden bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${req.series?.coverUrl || ""})` }}
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-lg leading-tight truncate">{req.series?.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    {req.creator && (
                      <>
                        <span>By: <strong className="text-white">{req.creator.name}</strong></span>
                        <span>•</span>
                      </>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(req.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === "PENDING" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                      req.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>{req.status}</span>
                  </div>
                  {req.notes && (
                    <p className="text-xs text-muted-foreground mt-2 bg-white/5 border border-white/5 p-2 rounded-lg italic">
                      Notes: {req.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Review section for admins/moderators */}
              {isModOrAdmin && req.status === "PENDING" && (
                <div className="w-full md:w-auto flex flex-col gap-2 mt-4 md:mt-0">
                  <input
                    type="text"
                    placeholder="Review notes (optional)"
                    value={reviewNotes[req.id] || ""}
                    onChange={(e) => setReviewNotes({ ...reviewNotes, [req.id]: e.target.value })}
                    className="w-full md:w-64 px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white placeholder:text-muted-foreground transition"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleReview(req.id, "APPROVED")}
                      disabled={actionLoading === req.id}
                      className="flex-1 md:flex-none px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition text-xs font-bold flex items-center justify-center gap-1"
                    >
                      {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                    </button>
                    <button
                      onClick={() => handleReview(req.id, "REJECTED")}
                      disabled={actionLoading === req.id}
                      className="flex-1 md:flex-none px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition text-xs font-bold flex items-center justify-center gap-1"
                    >
                      {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Reject
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
                <Sparkles className="w-5 h-5 text-yellow-400" /> Request Featured Status
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">Select Series</label>
                <select
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white"
                >
                  <option value="" className="bg-neutral-900">Choose a series...</option>
                  {seriesList.map((series) => (
                    <option key={series.id} value={series.id} className="bg-neutral-900 text-white">
                      {series.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Notes for Staff (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why this series should be featured or list highlights..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white resize-none"
                />
              </div>

              {/* Point Warning */}
              <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-200/80 leading-relaxed">
                  <p className="font-bold text-yellow-400">Point Deduction Warning</p>
                  <p className="mt-1">
                    Submitting this request will immediately deduct <strong className="text-white font-semibold">{fee.toLocaleString()} Points</strong> from your account. The fee is non-refundable regardless of the decision.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || userPoints < fee}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
