"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  Check,
  X,
  Loader2,
  AlertCircle,
  Eye,
  Copy,
  Search,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Coins,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowUpDown,
  Filter,
  Tv,
  Layers,
  Sparkles,
  Lock,
  Unlock,
} from "lucide-react";
import api from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";

interface WithdrawalUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  points: number;
  dailyAdViews: number;
  dailyAdPointsEarned: number;
  totalAdViews?: number;
  totalAdPoints?: number;
  transactionsFrozen?: boolean;
  banned?: boolean;
  createdAt?: string;
}

interface WithdrawalRequest {
  id: string;
  queueIndex?: number;
  pointsRequested: number;
  fiatAmount: number;
  bankDetails: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes: string | null;
  createdAt: string;
  user: WithdrawalUser;
}

interface MetaData {
  total: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  page: number;
  limit: number;
  rangeFrom: number;
  rangeTo: number;
  totalBatches: number;
}

interface FinancialHistoryData {
  user: WithdrawalUser;
  stats: {
    totalAdViews: number;
    totalAdPointsEarned: number;
    totalChaptersPurchased: number;
    totalFiatWithdrawn: number;
    totalPointsWithdrawn: number;
    previousWithdrawalsCount: number;
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
  withdrawals: Array<{
    id: string;
    pointsRequested: number;
    fiatAmount: number;
    bankDetails: string;
    status: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

export default function WithdrawalsPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Status Filter Tab: "PENDING" | "APPROVED" | "REJECTED" | "ALL"
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  // Moderator Task Splitting / Batch Selection
  const [selectedBatch, setSelectedBatch] = useState<number | "all" | "custom">("all");
  const [customFrom, setCustomFrom] = useState("1");
  const [customTo, setCustomTo] = useState("20");

  // Review & Transaction History Modal State
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<FinancialHistoryData | null>(null);
  const [modalNotes, setModalNotes] = useState("");
  const [historyTab, setHistoryTab] = useState<"transactions" | "withdrawals">("transactions");
  const [expandedWithdrawalId, setExpandedWithdrawalId] = useState<string | null>(null);
  const [freezeLoading, setFreezeLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        status: activeTab,
        limit: 20,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // If user is Moderator and selecting a specific batch partition
      if (!isAdmin || selectedBatch !== "all") {
        if (typeof selectedBatch === "number") {
          params.batchIndex = selectedBatch;
          params.batchSize = 20;
        } else if (selectedBatch === "custom") {
          if (customFrom && customTo) {
            params.rangeFrom = parseInt(customFrom, 10);
            params.rangeTo = parseInt(customTo, 10);
          }
        }
      }

      const res = await api.get("/moderator/withdrawals", { params });
      setRequests(res.data.data || []);
      if (res.data.pagination) {
        setMeta(res.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch withdrawals", err);
      toast.error("Failed to load withdrawal requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, selectedBatch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED", notes?: string) => {
    setActionLoading(id);
    try {
      const payload: { status: "APPROVED" | "REJECTED"; notes: string } = {
        status,
        notes: notes || (status === "REJECTED" ? "Rejected by moderator" : "Approved and sent"),
      };
      await api.post(`/moderator/withdrawals/${id}/review`, payload);
      toast.success(`Withdrawal ${status.toLowerCase()} successfully`);
      
      // Close modal if reviewing from modal
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
      fetchRequests();
    } catch (err: any) {
      console.error("Failed to review withdrawal", err);
      toast.error(err?.response?.data?.message || "Failed to update withdrawal status");
    } finally {
      setActionLoading(null);
    }
  };

  const openHistoryModal = async (req: WithdrawalRequest) => {
    setSelectedRequest(req);
    setModalNotes(req.notes || "");
    setHistoryLoading(true);
    setHistoryData(null);
    setExpandedWithdrawalId(null);
    try {
      const res = await api.get(`/moderator/users/${req.user.id}/financial-history`);
      setHistoryData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch user financial history", err);
      toast.error("Failed to load user financial history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleFreezeUser = async (userId: string, currentFrozen: boolean) => {
    setFreezeLoading(true);
    try {
      await api.post(`/moderator/users/${userId}/freeze`, { frozen: !currentFrozen });
      toast.success(!currentFrozen ? "User transactions frozen" : "User transactions unfrozen");
      
      // Update local modal data
      if (historyData) {
        setHistoryData({
          ...historyData,
          user: { ...historyData.user, transactionsFrozen: !currentFrozen },
        });
      }
      // Update in requests table
      setRequests((prev) =>
        prev.map((r) =>
          r.user.id === userId
            ? { ...r, user: { ...r.user, transactionsFrozen: !currentFrozen } }
            : r
        )
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update freeze status");
    } finally {
      setFreezeLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Generate dynamic batch buttons based on pending count
  const batchButtons = useMemo(() => {
    const totalPending = meta?.totalPending || 0;
    const count = Math.max(1, Math.ceil(totalPending / 20));
    const list: Array<{ index: number; label: string; range: string }> = [];
    for (let i = 1; i <= Math.min(count, 8); i++) {
      const from = (i - 1) * 20 + 1;
      const to = Math.min(i * 20, totalPending || i * 20);
      list.push({
        index: i,
        label: `Batch #${i}`,
        range: `${from} - ${to}`,
      });
    }
    return list;
  }, [meta?.totalPending]);

  return (
    <div className="space-y-6">
      {/* Header & Overview Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Withdrawal Requests</h1>
              <p className="text-sm text-muted-foreground">
                Review, process creator payouts, and inspect user transaction history
              </p>
            </div>
          </div>
        </div>

        {/* Quick Queue Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">
              {meta?.totalPending ?? 0} Pending
            </span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">
              {meta?.totalApproved ?? 0} Approved
            </span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold text-rose-400">
              {meta?.totalRejected ?? 0} Rejected
            </span>
          </div>
        </div>
      </div>

      {/* 👥 Moderator Task Splitting / Batch Partitioning Toolbar */}
      <div className="glass rounded-2xl p-4 border border-white/10 bg-white/[0.02]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
              <Layers className="w-4 h-4 text-primary" />
              <span>{isAdmin ? "Admin View / Work Split:" : "Moderator Queue Slice:"}</span>
            </div>

            {/* View All Option */}
            <button
              onClick={() => setSelectedBatch("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedBatch === "all"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/5"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              All Queue
            </button>

            {/* Batch Slices (1-20, 21-40, 41-60...) */}
            {batchButtons.map((b) => (
              <button
                key={b.index}
                onClick={() => setSelectedBatch(b.index)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedBatch === b.index
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                    : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/5"
                }`}
              >
                <span>{b.label}</span>
                <span className="opacity-75 font-mono text-[10px]">({b.range})</span>
              </button>
            ))}

            {/* Custom Range Popover / Mode */}
            <button
              onClick={() => setSelectedBatch("custom")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedBatch === "custom"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/5"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Custom Range
            </button>
          </div>

          {/* Custom Range Inputs */}
          {selectedBatch === "custom" && (
            <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
              <span className="text-xs text-muted-foreground pl-2">From:</span>
              <input
                type="number"
                min="1"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-center focus:outline-none focus:border-primary"
              />
              <span className="text-xs text-muted-foreground">To:</span>
              <input
                type="number"
                min="1"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-center focus:outline-none focus:border-primary"
              />
              <button
                onClick={fetchRequests}
                className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Informational Sub-banner for task isolation */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {selectedBatch === "all"
                ? `Showing all requests in chronological order`
                : typeof selectedBatch === "number"
                ? `Viewing Moderator Task Partition: Requests ${(selectedBatch - 1) * 20 + 1} to ${selectedBatch * 20} (Prevents collision with other moderators)`
                : `Viewing Custom Task Range: ${customFrom} to ${customTo}`}
            </span>
          </div>
          {meta && meta.rangeFrom && (
            <span className="font-mono text-[11px] bg-white/5 px-2.5 py-0.5 rounded-md text-foreground">
              Queue Position: {meta.rangeFrom} - {meta.rangeTo} of {meta.total}
            </span>
          )}
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              activeTab === "PENDING"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending ({meta?.totalPending ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("APPROVED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              activeTab === "APPROVED"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved ({meta?.totalApproved ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("REJECTED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              activeTab === "REJECTED"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Rejected ({meta?.totalRejected ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              activeTab === "ALL"
                ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Requests
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search user, email, bank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
          />
        </form>
      </div>

      {/* 📊 Minimal Modern Table UI */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 glass rounded-3xl border border-white/10">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-xs text-muted-foreground font-medium">Loading withdrawal queue...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-white/10 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No withdrawal requests found</p>
          <p className="text-xs mt-1 opacity-70">
            {activeTab === "PENDING"
              ? "All pending withdrawal tasks in this partition have been resolved!"
              : "No matching records found for this filter."}
          </p>
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden border border-white/10 bg-white/[0.01]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                  <th className="px-4 py-4 w-12 text-center">#</th>
                  <th className="px-5 py-4">User / Creator</th>
                  <th className="px-5 py-4">Payout Amount</th>
                  <th className="px-5 py-4">Payment Method & Bank</th>
                  <th className="px-5 py-4">Ad Activity (Today / Total)</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Queue # Badge */}
                    <td className="px-4 py-4 text-center font-mono font-bold text-muted-foreground text-xs">
                      #{req.queueIndex ?? req.id.slice(0, 4)}
                    </td>

                    {/* User info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/30 to-purple-500/30 border border-white/10 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                          {req.user.image ? (
                            <img src={req.user.image} alt={req.user.name} className="w-full h-full object-cover" />
                          ) : (
                            req.user.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground truncate max-w-[140px]">
                              {req.user.name}
                            </span>
                            {req.user.transactionsFrozen && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold">
                                FROZEN
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded bg-white/5 text-muted-foreground text-[10px] uppercase">
                              {req.user.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                            {req.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Payout Amount */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-emerald-400">
                          ${req.fiatAmount.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-400 inline" />
                          {req.pointsRequested.toLocaleString()} pts
                        </span>
                      </div>
                    </td>

                    {/* Bank / Payout details */}
                    <td className="px-5 py-4 max-w-[200px]">
                      <div className="flex items-center gap-2 group/copy">
                        <span className="font-mono text-xs text-foreground/90 truncate">
                          {req.bankDetails}
                        </span>
                        <button
                          onClick={() => copyToClipboard(req.bankDetails, "Bank Details")}
                          title="Copy account details"
                          className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground opacity-0 group-hover/copy:opacity-100 transition"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Ad Metrics (Today & Total) */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-muted-foreground">Today:</span>
                          <span className="font-semibold text-foreground">{req.user.dailyAdViews} views</span>
                          <span className="text-amber-400 font-mono">({req.user.dailyAdPointsEarned} pts)</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span>Total:</span>
                          <span className="font-medium text-foreground/80">{req.user.totalAdViews ?? 0} views</span>
                          <span className="text-amber-400/80 font-mono">({(req.user.totalAdPoints ?? 0).toLocaleString()} pts)</span>
                        </div>
                      </div>
                    </td>

                    {/* Submitted At */}
                    <td className="px-4 py-4 text-muted-foreground text-[11px] whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                          req.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : req.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details & History button */}
                        <button
                          onClick={() => openHistoryModal(req)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
                          title="View user transaction history and review details"
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          View
                        </button>

                        {/* Quick Approve / Reject for PENDING */}
                        {req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleReview(req.id, "APPROVED")}
                              disabled={actionLoading === req.id}
                              className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition disabled:opacity-50"
                              title="Approve Payout"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReview(req.id, "REJECTED")}
                              disabled={actionLoading === req.id}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition disabled:opacity-50"
                              title="Reject and refund points"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🔍 Comprehensive Review & User Transaction History Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass rounded-[2rem] border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden bg-[#0d0f17]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-white/[0.02]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-lg font-bold uppercase overflow-hidden">
                  {selectedRequest.user.image ? (
                    <img
                      src={selectedRequest.user.image}
                      alt={selectedRequest.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedRequest.user.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{selectedRequest.user.name}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        selectedRequest.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : selectedRequest.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedRequest.user.email}</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-white/5">
              {/* Top Request Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass rounded-2xl p-4 border border-white/5 bg-white/[0.01]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Requested Points
                  </span>
                  <p className="text-xl font-extrabold text-amber-400 mt-1">
                    {selectedRequest.pointsRequested.toLocaleString()}
                  </p>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/5 bg-white/[0.01]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Fiat Payout
                  </span>
                  <p className="text-xl font-extrabold text-emerald-400 mt-1">
                    ${selectedRequest.fiatAmount.toFixed(2)}
                  </p>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/5 bg-white/[0.01]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Current Points Balance
                  </span>
                  <p className="text-xl font-extrabold text-primary mt-1">
                    {historyData?.user?.points?.toLocaleString() ?? selectedRequest.user.points.toLocaleString()}
                  </p>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/5 bg-white/[0.01]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Account Status
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {historyData?.user?.transactionsFrozen ? (
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Frozen
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Unlock className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment & Bank Details Box */}
              <div className="pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Payout Destination Details
                </h3>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {selectedRequest.bankDetails}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Submitted on {new Date(selectedRequest.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedRequest.bankDetails, "Bank Details")}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Lifetime Metrics Overview */}
              <div className="pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-primary" />
                  User Financial & Ad Intelligence
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-muted-foreground text-[10px]">Total Ads Viewed</p>
                    <p className="font-bold text-sm mt-0.5">
                      {historyData?.stats?.totalAdViews ?? selectedRequest.user.totalAdViews ?? 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-muted-foreground text-[10px]">Total Ad Points Earned</p>
                    <p className="font-bold text-sm text-amber-400 mt-0.5">
                      {(historyData?.stats?.totalAdPointsEarned ?? selectedRequest.user.totalAdPoints ?? 0).toLocaleString()} pts
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-muted-foreground text-[10px]">Total Approved Payouts</p>
                    <p className="font-bold text-sm text-emerald-400 mt-0.5">
                      ${(historyData?.stats?.totalFiatWithdrawn ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-muted-foreground text-[10px]">Previous Withdrawals</p>
                    <p className="font-bold text-sm mt-0.5">
                      {historyData?.stats?.previousWithdrawalsCount ?? 0} requests
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial History Tabs: Ledger vs. Previous Withdrawals */}
              <div className="pt-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setHistoryTab("transactions")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        historyTab === "transactions"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Point Ledger ({historyData?.transactions?.length ?? 0})
                    </button>
                    <button
                      onClick={() => setHistoryTab("withdrawals")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        historyTab === "withdrawals"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Previous Withdrawals ({historyData?.withdrawals?.length ?? 0})
                    </button>
                  </div>

                  {/* Freeze Account Security Action */}
                  <button
                    onClick={() =>
                      toggleFreezeUser(
                        selectedRequest.user.id,
                        historyData?.user?.transactionsFrozen ?? false
                      )
                    }
                    disabled={freezeLoading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      historyData?.user?.transactionsFrozen
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                    }`}
                  >
                    {freezeLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : historyData?.user?.transactionsFrozen ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Unfreeze Account
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Freeze Account
                      </>
                    )}
                  </button>
                </div>

                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Loading transaction ledger...</p>
                  </div>
                ) : historyTab === "transactions" ? (
                  /* Point Transactions Table */
                  <div className="rounded-2xl border border-white/10 overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-[10px] uppercase font-bold text-muted-foreground sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="px-4 py-2.5">Type</th>
                          <th className="px-4 py-2.5">Description</th>
                          <th className="px-4 py-2.5">Date</th>
                          <th className="px-4 py-2.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {!historyData?.transactions || historyData.transactions.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-muted-foreground text-xs">
                              No point transactions found for this user.
                            </td>
                          </tr>
                        ) : (
                          historyData.transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-white/[0.02]">
                              <td className="px-4 py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    t.type === "EARN_AD"
                                      ? "bg-green-500/10 text-green-400"
                                      : t.type === "WITHDRAWAL"
                                      ? "bg-amber-500/10 text-amber-400"
                                      : "bg-purple-500/10 text-purple-400"
                                  }`}
                                >
                                  {t.type}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-muted-foreground max-w-[200px] truncate">
                                {t.description}
                              </td>
                              <td className="px-4 py-2.5 text-muted-foreground text-[11px] whitespace-nowrap">
                                {new Date(t.createdAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td
                                className={`px-4 py-2.5 text-right font-bold font-mono ${
                                  t.amount > 0 ? "text-green-400" : "text-rose-400"
                                }`}
                              >
                                {t.amount > 0 ? `+${t.amount}` : t.amount}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* 📑 Previous Withdrawals History (in Dropdown / Accordion Manner) */
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {!historyData?.withdrawals || historyData.withdrawals.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs border border-white/5 rounded-2xl">
                        No previous withdrawal requests found for this user.
                      </div>
                    ) : (
                      historyData.withdrawals.map((w) => {
                        const isExpanded = expandedWithdrawalId === w.id;
                        return (
                          <div
                            key={w.id}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition"
                          >
                            {/* Accordion Header / Trigger */}
                            <button
                              onClick={() =>
                                setExpandedWithdrawalId(isExpanded ? null : w.id)
                              }
                              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] transition"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    w.status === "PENDING"
                                      ? "bg-amber-500/20 text-amber-400"
                                      : w.status === "APPROVED"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-rose-500/20 text-rose-400"
                                  }`}
                                >
                                  {w.status}
                                </span>
                                <span className="font-bold text-foreground">
                                  ${w.fiatAmount.toFixed(2)}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  ({w.pointsRequested.toLocaleString()} pts)
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(w.createdAt).toLocaleDateString()}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </button>

                            {/* Accordion Content / Dropdown Details */}
                            {isExpanded && (
                              <div className="p-4 border-t border-white/5 bg-black/30 text-xs space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                  <div>
                                    <span className="font-semibold text-foreground">Bank/Account:</span>{" "}
                                    {w.bankDetails}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-foreground">Updated:</span>{" "}
                                    {new Date(w.updatedAt).toLocaleString()}
                                  </div>
                                </div>
                                {w.notes && (
                                  <div className="p-2.5 rounded-xl bg-white/5 text-foreground mt-1">
                                    <span className="text-muted-foreground font-semibold">Moderator Note:</span>{" "}
                                    {w.notes}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Reviewer Action Notes & Final Decisions */}
              <div className="pt-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Moderation Review Note / Transaction Reference:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sent via bKash TrxID #8372910, or Rejection reason..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Modal Footer Decisions */}
            <div className="p-6 border-t border-white/10 flex items-center justify-between gap-3 bg-white/[0.02]">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 text-muted-foreground transition"
              >
                Close
              </button>

              {selectedRequest.status === "PENDING" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleReview(selectedRequest.id, "REJECTED", modalNotes)
                    }
                    disabled={actionLoading === selectedRequest.id}
                    className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject & Refund Points
                  </button>

                  <button
                    onClick={() =>
                      handleReview(selectedRequest.id, "APPROVED", modalNotes)
                    }
                    disabled={actionLoading === selectedRequest.id}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Approve Payout (${selectedRequest.fiatAmount.toFixed(2)})
                  </button>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground font-medium">
                  This request has already been marked as{" "}
                  <strong className="text-foreground">{selectedRequest.status}</strong>.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
