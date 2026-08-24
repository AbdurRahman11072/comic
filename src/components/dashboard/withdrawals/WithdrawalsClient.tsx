"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { userService } from "@/services/user.service";
import { FreezeUserAction } from "@/actions/user";
import { ReviewWithdrawalAction } from "@/actions/withdrawal";
import {
  WithdrawalFilterParams,
  WithdrawalMetaData,
  WithdrawalRequest,
  withdrawalService,
} from "@/services/withdrawal.service";
import {
  FinancialHistoryData,
  WithdrawalHistoryModal,
} from "./WithdrawalHistoryModal";

import { WithdrawalStatsSummary } from "./WithdrawalStatsSummary";
import { WithdrawalBatchToolbar } from "./WithdrawalBatchToolbar";
import {
  WithdrawalFiltersToolbar,
  WithdrawalTabType,
} from "./WithdrawalFiltersToolbar";
import { WithdrawalTable } from "./WithdrawalTable";

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
  const [activeTab, setActiveTab] = useState<WithdrawalTabType>("PENDING");
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

        if (historyData) {
          setHistoryData({
            ...historyData,
            user: { ...historyData.user, transactionsFrozen: !currentFrozen },
          });
        }
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
      <WithdrawalStatsSummary meta={meta} />

      {/* Moderator Task Splitting / Batch Partitioning Toolbar */}
      <WithdrawalBatchToolbar
        isAdmin={isAdmin}
        selectedBatch={selectedBatch}
        batchButtons={batchButtons}
        customFrom={customFrom}
        customTo={customTo}
        meta={meta}
        onSelectBatch={setSelectedBatch}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onApplyCustomRange={fetchRequests}
      />

      {/* Tabs & Search Controls */}
      <WithdrawalFiltersToolbar
        activeTab={activeTab}
        searchQuery={searchQuery}
        meta={meta}
        onTabChange={setActiveTab}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Minimal Modern Table UI */}
      <WithdrawalTable
        requests={requests}
        loading={loading}
        activeTab={activeTab}
        actionLoading={actionLoading}
        onOpenHistoryModal={openHistoryModal}
        onReview={handleReview}
        onCopy={copyToClipboard}
      />

      {/* Comprehensive Review & User Transaction History Modal */}
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
