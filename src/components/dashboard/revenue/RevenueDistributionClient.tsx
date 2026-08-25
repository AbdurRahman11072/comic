"use client";

import { useState, useEffect } from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  adRevenueService,
  DistributionPreviewData,
  DistributionRunItem,
} from "@/services/adRevenue.service";
import { RefreshCw, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

import { DistributionConfigForm } from "./DistributionConfigForm";
import { DistributionPreviewSection } from "./DistributionPreviewSection";
import { DistributionHistoryTable } from "./DistributionHistoryTable";
import { ExecuteDistributionModal } from "./ExecuteDistributionModal";
import { RevertDistributionModal } from "./RevertDistributionModal";
import { InspectRunDrawer } from "./InspectRunDrawer";

interface Props {
  initialHistory: DistributionRunItem[];
  initialPagination: any;
  pointRate: number;
}

export function RevenueDistributionClient({
  initialHistory,
  initialPagination: _initialPagination,
  pointRate,
}: Props) {
  // Config state
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const lastMonthStart = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
  const lastMonthEnd = format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");

  const [periodStart, setPeriodStart] = useState<string>(lastMonthStart);
  const [periodEnd, setPeriodEnd] = useState<string>(lastMonthEnd);
  const [amount, setAmount] = useState<string>("1000");
  const [currency, setCurrency] = useState<"USD" | "POINTS">("USD");
  const [notes, setNotes] = useState<string>("");

  // Preview & execution state
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<DistributionPreviewData | null>(null);
  const [executing, setExecuting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // History & Inspection state
  const [history, setHistory] = useState<DistributionRunItem[]>(initialHistory);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [inspectRun, setInspectRun] = useState<DistributionRunItem | null>(null);

  // Sync initialHistory from SSR or auto-fetch on mount if empty
  useEffect(() => {
    if (initialHistory && initialHistory.length > 0) {
      setHistory(initialHistory);
    } else {
      refreshHistory();
    }
  }, [initialHistory]);

  // Revert Modal State
  const [revertModalOpen, setRevertModalOpen] = useState(false);
  const [revertTargetRun, setRevertTargetRun] = useState<DistributionRunItem | null>(null);
  const [revertReason, setRevertReason] = useState("");
  const [revertConfirmText, setRevertConfirmText] = useState("");
  const [reverting, setReverting] = useState(false);

  // Date range presets
  const applyPreset = (type: "last_month" | "this_month" | "last_30" | "last_7") => {
    const now = new Date();
    if (type === "last_month") {
      setPeriodStart(format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd"));
      setPeriodEnd(format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd"));
    } else if (type === "this_month") {
      setPeriodStart(format(startOfMonth(now), "yyyy-MM-dd"));
      setPeriodEnd(format(now, "yyyy-MM-dd"));
    } else if (type === "last_30") {
      setPeriodStart(format(subDays(now, 30), "yyyy-MM-dd"));
      setPeriodEnd(format(now, "yyyy-MM-dd"));
    } else if (type === "last_7") {
      setPeriodStart(format(subDays(now, 7), "yyyy-MM-dd"));
      setPeriodEnd(format(now, "yyyy-MM-dd"));
    }
  };

  // Trigger preview calculation
  const handleCalculatePreview = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid positive revenue amount.");
      return;
    }

    if (!periodStart || !periodEnd) {
      toast.error("Please select both start and end dates.");
      return;
    }

    if (new Date(periodEnd) <= new Date(periodStart)) {
      toast.error("End date must be after start date.");
      return;
    }

    setPreviewLoading(true);
    try {
      const res = await adRevenueService.getPreview({
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(`${periodEnd}T23:59:59.999Z`).toISOString(),
        amount: numAmount,
        currency,
      });

      if (res.success && res.data) {
        setPreviewData(res.data);
        toast.success("Quality scores and distribution preview calculated!");
      } else {
        toast.error(res.message || "Failed to calculate distribution preview.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to calculate preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Refresh history list
  const refreshHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await adRevenueService.getHistory(1, 20);
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  // Confirm and execute atomic distribution run
  const handleExecuteDistribution = async () => {
    if (!previewData) return;

    setExecuting(true);
    try {
      const res = await adRevenueService.executeDistribution({
        periodStart: previewData.periodStart,
        periodEnd: previewData.periodEnd,
        amount: previewData.grossAmountEntered,
        currency: previewData.currency,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        toast.success("Revenue distribution successfully executed! Creator balances credited.");
        setConfirmModalOpen(false);
        setPreviewData(null);
        setNotes("");
        refreshHistory();
      } else {
        toast.error(res.message || "Failed to execute distribution.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to execute distribution.");
    } finally {
      setExecuting(false);
    }
  };

  // Inspect run details modal
  const handleInspectRun = async (runId: string) => {
    try {
      const res = await adRevenueService.getDetails(runId);
      if (res.success && res.data) {
        setInspectRun(res.data);
      } else {
        toast.error(res.message || "Failed to load run details.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load run details.");
    }
  };

  // Open Revert Confirmation Modal
  const openRevertModal = (run: DistributionRunItem) => {
    setRevertTargetRun(run);
    setRevertReason("");
    setRevertConfirmText("");
    setRevertModalOpen(true);
  };

  // Execute Revert and Clawback
  const handleExecuteRevert = async () => {
    if (!revertTargetRun) return;
    if (revertConfirmText.trim().toUpperCase() !== "REVERT") {
      toast.error("Please type REVERT to confirm.");
      return;
    }

    setReverting(true);
    try {
      const res = await adRevenueService.revertDistribution(
        revertTargetRun.id,
        revertReason.trim() || undefined
      );

      if (res.success) {
        toast.success(
          `Run #${revertTargetRun.id} reverted! Clawed back: ${res.data?.totalClawedBack?.toLocaleString() ?? 0} pts (Shortfalls: ${res.data?.totalShortfall?.toLocaleString() ?? 0} pts)`
        );
        setRevertModalOpen(false);
        setRevertTargetRun(null);
        if (inspectRun?.id === revertTargetRun.id) {
          handleInspectRun(revertTargetRun.id);
        }
        refreshHistory();
      } else {
        toast.error(res.message || "Failed to revert distribution.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to revert distribution.");
    } finally {
      setReverting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-6 h-6" />
              </span>
              Reader Quality Revenue Distribution
            </h1>
          </div>
          <p className="text-sm text-foreground/60 mt-1.5 max-w-2xl">
            Distribute gross ad network pools proportionally to creators based on verified reading
            engagement, completion depth, and active reading duration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshHistory}
            disabled={historyLoading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
            Refresh History
          </button>
        </div>
      </div>

      {/* Main Configuration Card */}
      <DistributionConfigForm
        periodStart={periodStart}
        periodEnd={periodEnd}
        amount={amount}
        currency={currency}
        todayStr={todayStr}
        pointRate={pointRate}
        previewLoading={previewLoading}
        onPeriodStartChange={setPeriodStart}
        onPeriodEndChange={setPeriodEnd}
        onAmountChange={setAmount}
        onCurrencyChange={setCurrency}
        onApplyPreset={applyPreset}
        onCalculatePreview={handleCalculatePreview}
      />

      {/* Preview Section */}
      {previewData && (
        <DistributionPreviewSection
          previewData={previewData}
          onOpenConfirmModal={() => setConfirmModalOpen(true)}
        />
      )}

      {/* Historical Distribution Runs Section */}
      <DistributionHistoryTable
        history={history}
        onInspectRun={handleInspectRun}
        onOpenRevertModal={openRevertModal}
      />

      {/* Confirmation & Execution Modal */}
      <ExecuteDistributionModal
        open={confirmModalOpen}
        previewData={previewData}
        notes={notes}
        executing={executing}
        onNotesChange={setNotes}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleExecuteDistribution}
      />

      {/* Inspect Single Run Details Modal / Drawer */}
      <InspectRunDrawer
        inspectRun={inspectRun}
        onClose={() => setInspectRun(null)}
        onOpenRevertModal={openRevertModal}
      />

      {/* 2-Step Revert & Clawback Confirmation Modal */}
      <RevertDistributionModal
        open={revertModalOpen}
        run={revertTargetRun}
        revertReason={revertReason}
        revertConfirmText={revertConfirmText}
        reverting={reverting}
        onReasonChange={setRevertReason}
        onConfirmTextChange={setRevertConfirmText}
        onClose={() => setRevertModalOpen(false)}
        onConfirm={handleExecuteRevert}
      />
    </div>
  );
}
