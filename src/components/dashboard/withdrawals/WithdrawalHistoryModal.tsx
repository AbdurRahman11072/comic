"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  Loader2,
  Lock,
  Smartphone,
  Tv,
  Unlock,
  X,
} from "lucide-react";
import {
  WithdrawalRequest,
  WithdrawalUser,
} from "@/services/withdrawal.service";

export interface FinancialHistoryData {
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

export interface ParsedPayout {
  platform: string;
  accountType?: string;
  destination: string;
  holderName?: string;
}

export function parsePayoutDetails(raw: string): ParsedPayout {
  if (!raw) return { platform: "Manual", destination: "—" };

  const match = raw.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (match) {
    const fullTag = match[1].trim(); // e.g. "bKash - Personal" or "Nagad" or "Bank Transfer"
    let remainder = match[2].trim(); // e.g. "Phone: 01812345678 | Name: John"

    let platform = fullTag;
    let accountType: string | undefined = undefined;

    if (fullTag.includes(" - ")) {
      const parts = fullTag.split(" - ");
      platform = parts[0].trim();
      accountType = parts[1].trim();
    }

    let holderName: string | undefined = undefined;
    if (remainder.includes(" | Name: ")) {
      const parts = remainder.split(" | Name: ");
      remainder = parts[0].trim();
      holderName = parts[1].trim();
    } else if (remainder.includes(" | ")) {
      const parts = remainder.split(" | ");
      remainder = parts[0].trim();
      holderName = parts[1].trim();
    }

    return {
      platform,
      accountType,
      destination: remainder,
      holderName,
    };
  }

  // Fallback for legacy format strings
  const lower = raw.toLowerCase();
  let detected = "Bank Transfer";
  if (lower.includes("bkash")) detected = "bKash";
  else if (lower.includes("nagad")) detected = "Nagad";
  else if (lower.includes("rocket")) detected = "Rocket";
  else if (lower.includes("paypal")) detected = "PayPal";
  else if (lower.includes("usdt") || lower.includes("crypto") || lower.includes("trc20")) detected = "USDT";

  return {
    platform: detected,
    destination: raw,
  };
}

export function getPlatformBadgeStyle(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("bkash")) {
    return "bg-pink-500/15 text-pink-400 border-pink-500/30";
  }
  if (p.includes("nagad")) {
    return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  }
  if (p.includes("rocket")) {
    return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  }
  if (p.includes("upay")) {
    return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  }
  if (p.includes("paypal")) {
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  }
  if (p.includes("usdt") || p.includes("crypto") || p.includes("binance")) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (p.includes("bank")) {
    return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  }
  return "bg-primary/15 text-primary border-primary/30";
}

interface WithdrawalHistoryModalProps {
  selectedRequest: WithdrawalRequest;
  onClose: () => void;
  historyLoading: boolean;
  historyData: FinancialHistoryData | null;
  modalNotes: string;
  setModalNotes: (notes: string) => void;
  historyTab: "transactions" | "withdrawals";
  setHistoryTab: (tab: "transactions" | "withdrawals") => void;
  expandedWithdrawalId: string | null;
  setExpandedWithdrawalId: (id: string | null) => void;
  freezeLoading: boolean;
  onToggleFreeze: (userId: string, currentFrozen: boolean) => Promise<void>;
  onReview: (id: string, status: "APPROVED" | "REJECTED", notes?: string) => Promise<void>;
  actionLoading: string | null;
  copyToClipboard: (text: string, label: string) => void;
}

export function WithdrawalHistoryModal({
  selectedRequest,
  onClose,
  historyLoading,
  historyData,
  modalNotes,
  setModalNotes,
  historyTab,
  setHistoryTab,
  expandedWithdrawalId,
  setExpandedWithdrawalId,
  freezeLoading,
  onToggleFreeze,
  onReview,
  actionLoading,
  copyToClipboard,
}: WithdrawalHistoryModalProps) {
  return (
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
            onClick={onClose}
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
          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" />
              Payout Destination & Platform Breakdown
            </h3>

            {(() => {
              const parsed = parsePayoutDetails(selectedRequest.bankDetails);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Platform Card */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Transaction Platform
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-sm ${getPlatformBadgeStyle(
                          parsed.platform
                        )}`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{parsed.platform}</span>
                      </span>
                      {parsed.accountType && (
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-white/80 uppercase">
                          {parsed.accountType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Destination Details Card */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Phone / Account Number
                      </span>
                      <p className="text-sm font-mono font-bold text-foreground truncate mt-0.5">
                        {parsed.destination}
                      </p>
                      {parsed.holderName && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Holder: <span className="text-white font-medium">{parsed.holderName}</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(parsed.destination, "Account Number")}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                </div>
              );
            })()}
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
                  onToggleFreeze(
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
                          <td className="px-4 py-2.5 text-muted-foreground max-w-xs truncate">
                            {t.description}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
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
                    const parsedW = parsePayoutDetails(w.bankDetails);
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
                          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] transition cursor-pointer"
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
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPlatformBadgeStyle(parsedW.platform)}`}>
                              {parsedW.platform}
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-muted-foreground">
                              <div>
                                <span className="font-semibold text-foreground block text-[11px]">Platform:</span>
                                <span className={`inline-block mt-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${getPlatformBadgeStyle(parsedW.platform)}`}>
                                  {parsedW.platform} {parsedW.accountType ? `(${parsedW.accountType})` : ""}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground block text-[11px]">Phone / Account:</span>
                                <span className="font-mono text-foreground font-bold mt-1 block">{parsedW.destination}</span>
                                {parsedW.holderName && (
                                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Holder: {parsedW.holderName}</span>
                                )}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground block text-[11px]">Updated:</span>
                                <span className="mt-1 block">{new Date(w.updatedAt).toLocaleString()}</span>
                              </div>
                            </div>
                            {w.notes && (
                              <div className="pt-2 border-t border-white/5">
                                <span className="font-semibold text-foreground">Moderator Notes:</span>{" "}
                                <span className="italic text-muted-foreground">{w.notes}</span>
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
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 text-muted-foreground transition"
          >
            Close
          </button>

          {selectedRequest.status === "PENDING" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onReview(selectedRequest.id, "REJECTED", modalNotes)
                }
                disabled={actionLoading === selectedRequest.id}
                className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Reject & Refund Points
              </button>

              <button
                onClick={() =>
                  onReview(selectedRequest.id, "APPROVED", modalNotes)
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
  );
}
