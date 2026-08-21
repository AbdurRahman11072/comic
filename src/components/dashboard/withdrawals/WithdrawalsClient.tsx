"use client";

import { authClient } from "@/lib/auth-client";
import { userService } from "@/services/user.service";
import { FreezeUserAction } from "@/actions/user";
import {
  WithdrawalFilterParams,
  WithdrawalMetaData,
  WithdrawalRequest,
  withdrawalService,
} from "@/services/withdrawal.service";
import { ReviewWithdrawalAction } from "@/actions/withdrawal";
import {
  FinancialHistoryData,
  getPlatformBadgeStyle,
  parsePayoutDetails,
  WithdrawalHistoryModal,
} from "./WithdrawalHistoryModal";
import {
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Eye,
  Filter,
  Layers,
  Loader2,
  Search,
  Smartphone,
  Sparkles,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface WithdrawalsClientProps {
  initialRequests?: WithdrawalRequest[];
  initialMeta?: WithdrawalMetaData | null;
  initialIsAdmin?: boolean;
}

export function WithdrawalsClient({
  initialRequests = [],
  initialMeta = null,
  initialIsAdmin = false,
}: WithdrawalsClientProps) {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user
    ? (session.user as any).role === "admin"
    : initialIsAdmin;

  const [requests, setRequests] = useState<WithdrawalRequest[]>(initialRequests);
  const [meta, setMeta] = useState<WithdrawalMetaData | null>(initialMeta);
  const [loading, setLoading] = useState(false);
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
      const params: WithdrawalFilterParams = {
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

      const res = await withdrawalService.getWithdrawalRequests(params);
      if (res.success) {
        setRequests(res.data || []);
        if (res.pagination) {
          setMeta(res.pagination);
        }
      } else {
        toast.error(res.message || "Failed to load withdrawal requests");
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
      const payload = {
        status,
        notes: notes || (status === "REJECTED" ? "Rejected by moderator" : "Approved and sent"),
      };
      const res = await ReviewWithdrawalAction(id, payload);
      if (res.success) {
        toast.success(`Withdrawal ${status.toLowerCase()} successfully`);

        // Close modal if reviewing from modal
        if (selectedRequest?.id === id) {
          setSelectedRequest(null);
        }
        fetchRequests();
      } else {
        toast.error(res.message || "Failed to update withdrawal status");
      }
    } catch (err: any) {
      console.error("Failed to review withdrawal", err);
      toast.error(err?.message || "Failed to update withdrawal status");
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
      const res = await userService.getUserFinancialHistory(req.user.id);
      if (res.success) {
        setHistoryData(res.data);
      } else {
        toast.error(res.message || "Failed to load user financial history");
      }
    } catch (_err) {
      toast.error("Failed to load user financial history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleFreezeUser = async (userId: string, currentFrozen: boolean) => {
    setFreezeLoading(true);
    try {
      const res = await FreezeUserAction(userId, { frozen: !currentFrozen });
      if (res.success) {
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
      } else {
        toast.error(res.message || "Failed to update freeze status");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update freeze status");
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
                  <th className="px-5 py-4">Platform & Method</th>
                  <th className="px-5 py-4">Account / Phone Details</th>
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

                    {/* Platform & Method */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {(() => {
                        const parsed = parsePayoutDetails(req.bankDetails);
                        return (
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-sm ${getPlatformBadgeStyle(
                                parsed.platform
                              )}`}
                            >
                              <Smartphone className="w-3.5 h-3.5 shrink-0" />
                              <span>{parsed.platform}</span>
                            </span>
                            {parsed.accountType && (
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {parsed.accountType}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Phone / Account Destination */}
                    <td className="px-5 py-4 min-w-[180px] max-w-[260px]">
                      {(() => {
                        const parsed = parsePayoutDetails(req.bankDetails);
                        return (
                          <div className="flex flex-col gap-0.5 group/copy">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-foreground truncate">
                                {parsed.destination}
                              </span>
                              <button
                                onClick={() => copyToClipboard(parsed.destination, "Account Number")}
                                title="Copy account details"
                                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground opacity-0 group-hover/copy:opacity-100 transition cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            {parsed.holderName && (
                              <span className="text-[11px] text-muted-foreground truncate">
                                Name: <span className="text-foreground/90 font-medium">{parsed.holderName}</span>
                              </span>
                            )}
                          </div>
                        );
                      })()}
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
        <WithdrawalHistoryModal
          selectedRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          historyLoading={historyLoading}
          historyData={historyData}
          modalNotes={modalNotes}
          setModalNotes={setModalNotes}
          historyTab={historyTab}
          setHistoryTab={setHistoryTab}
          expandedWithdrawalId={expandedWithdrawalId}
          setExpandedWithdrawalId={setExpandedWithdrawalId}
          freezeLoading={freezeLoading}
          onToggleFreeze={toggleFreezeUser}
          onReview={handleReview}
          actionLoading={actionLoading}
          copyToClipboard={copyToClipboard}
        />
      )}
    </div>
  );
}
