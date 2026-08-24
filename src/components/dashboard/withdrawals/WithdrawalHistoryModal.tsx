"use client";

import { Check, Loader2, Lock, Unlock, X } from "lucide-react";
import type { WithdrawalRequest } from "@/services/withdrawal.service";
import type { FinancialHistoryData } from "./WithdrawalUtils";

import { WithdrawalSummaryHeader } from "./WithdrawalSummaryHeader";
import { WithdrawalLedgerTable } from "./WithdrawalLedgerTable";
import { WithdrawalAccordionList } from "./WithdrawalAccordionList";

export { parsePayoutDetails, getPlatformBadgeStyle } from "./WithdrawalUtils";
export type { FinancialHistoryData, ParsedPayout } from "./WithdrawalUtils";

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
            className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-white/5">
          {/* Top Request Summary Cards & Intelligence */}
          <WithdrawalSummaryHeader
            selectedRequest={selectedRequest}
            historyData={historyData}
            copyToClipboard={copyToClipboard}
          />

          {/* Financial History Tabs: Ledger vs. Previous Withdrawals */}
          <div className="pt-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setHistoryTab("transactions")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    historyTab === "transactions"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Point Ledger ({historyData?.transactions?.length ?? 0})
                </button>
                <button
                  onClick={() => setHistoryTab("withdrawals")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
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
              <WithdrawalLedgerTable historyData={historyData} />
            ) : (
              <WithdrawalAccordionList
                historyData={historyData}
                expandedWithdrawalId={expandedWithdrawalId}
                onToggleExpand={setExpandedWithdrawalId}
              />
            )}
          </div>

          {/* Reviewer Action Notes */}
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
            className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 text-muted-foreground transition cursor-pointer"
          >
            Close
          </button>

          {selectedRequest.status === "PENDING" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onReview(selectedRequest.id, "REJECTED", modalNotes)}
                disabled={actionLoading === selectedRequest.id}
                className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Reject & Refund Points
              </button>

              <button
                onClick={() => onReview(selectedRequest.id, "APPROVED", modalNotes)}
                disabled={actionLoading === selectedRequest.id}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
