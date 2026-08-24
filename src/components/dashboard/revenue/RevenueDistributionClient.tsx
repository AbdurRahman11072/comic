"use client";

import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  adRevenueService,
  DistributionPreviewData,
  DistributionRunItem,
} from "@/services/adRevenue.service";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  DollarSign,
  History,
  Info,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
  initialHistory: DistributionRunItem[];
  initialPagination: any;
  pointRate: number;
}

export function RevenueDistributionClient({
  initialHistory,
  initialPagination,
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
  const [inspectLoading, setInspectLoading] = useState(false);

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

  // Inspect run details modal
  const handleInspectRun = async (runId: string) => {
    setInspectLoading(true);
    try {
      const res = await adRevenueService.getDetails(runId);
      if (res.success && res.data) {
        setInspectRun(res.data);
      } else {
        toast.error(res.message || "Failed to load run details.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load run details.");
    } finally {
      setInspectLoading(false);
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
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
            Refresh History
          </button>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            1. Select Distribution Period & Total Pool
          </h2>

          {/* Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-foreground/40 font-medium mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset("last_month")}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition"
            >
              Previous Month
            </button>
            <button
              type="button"
              onClick={() => applyPreset("this_month")}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => applyPreset("last_30")}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition"
            >
              Last 30 Days
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
              Period Start Date
            </label>
            <input
              type="date"
              max={todayStr}
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
              Period End Date
            </label>
            <input
              type="date"
              max={todayStr}
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
            />
          </div>

          {/* Revenue Amount */}
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
              Distributable Creator Pool
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="w-full px-3.5 py-2.5 pr-20 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
              />
              <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "USD" | "POINTS")}
                  className="h-full px-2 rounded-lg bg-white/10 border border-white/10 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="USD" className="bg-[#18181b]">USD ($)</option>
                  <option value="POINTS" className="bg-[#18181b]">Points</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-end">
            <button
              onClick={handleCalculatePreview}
              disabled={previewLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 transition disabled:opacity-50"
            >
              {previewLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating Scores...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Calculate Preview
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-foreground/50 pt-1 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              Conversion Rate: 1 Point = ${pointRate.toFixed(2)} USD • Entered pool is allocated 100%
              across verified creators based on Quality Scores.
            </span>
          </div>
          <div className="text-[11px] text-foreground/40 italic">
            Tip: Set Period End Date to a completed past day (e.g. yesterday or last month end) to ensure no active reads arrive mid-calculation.
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {previewData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Overlap Alert */}
          {previewData.overlappingRun && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm text-amber-200">
                  Warning: Date Range Overlaps with an Existing Distribution
                </p>
                <p className="text-foreground/80">
                  The selected period overlaps with completed distribution run{" "}
                  <strong className="text-white">#{previewData.overlappingRun.id}</strong> (
                  {format(new Date(previewData.overlappingRun.periodStart), "MMM d, yyyy")} to{" "}
                  {format(new Date(previewData.overlappingRun.periodEnd), "MMM d, yyyy")}). You cannot
                  execute a new run covering an overlapping period until that run is reverted.
                </p>
              </div>
            </div>
          )}

          {/* Zero Score Warning */}
          {previewData.totalPlatformQualityScore === 0 && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm text-blue-200">No Qualifying Reading Activity Found</p>
                <p className="text-foreground/80">
                  There were 0 authenticated reads that met the minimum Quality Score criteria
                  (Qualified, Engaged, or Completed) in this period. Distribution cannot be executed
                  for 0 quality points.
                </p>
              </div>
            </div>
          )}

          {/* KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
                Distributable Pool
              </p>
              <p className="text-xl font-black text-primary mt-1">
                {previewData.distributablePool.toLocaleString()} pts
              </p>
              <p className="text-xs text-foreground/60 mt-0.5">
                ≈ ${(previewData.distributablePool * previewData.pointRate).toFixed(2)} USD
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
                Platform Quality Score
              </p>
              <p className="text-xl font-black text-white mt-1">
                {previewData.totalPlatformQualityScore.toLocaleString()}
              </p>
              <p className="text-xs text-foreground/60 mt-0.5">Total Engagement Pts</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
                Qualifying Readers
              </p>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {previewData.totalDeduplicatedReads.toLocaleString()}
              </p>
              <p className="text-xs text-foreground/60 mt-0.5">Deduplicated 1/user/ch</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
                Filtered Bots / Guests
              </p>
              <p className="text-xl font-black text-yellow-400 mt-1">
                {previewData.telemetry.totalBotEvents + previewData.telemetry.totalGuestEvents}
              </p>
              <p className="text-xs text-foreground/60 mt-0.5">
                {previewData.telemetry.totalBotEvents} bots • {previewData.telemetry.totalGuestEvents} guests
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 col-span-2 sm:col-span-1">
              <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">
                Eligible Creators
              </p>
              <p className="text-xl font-black text-purple-400 mt-1">
                {previewData.creators.length}
              </p>
              <p className="text-xs text-foreground/60 mt-0.5">Receiving payouts</p>
            </div>
          </div>

          {/* Creators Itemized Table */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Creator Score Breakdown & Payout Allocation
                </h3>
                <p className="text-xs text-foreground/60 mt-0.5">
                  Showing all {previewData.creators.length} creators with qualified reading engagement
                  for {format(new Date(previewData.periodStart), "MMM d, yyyy")} –{" "}
                  {format(new Date(previewData.periodEnd), "MMM d, yyyy")}
                </p>
              </div>

              {previewData.totalPlatformQualityScore > 0 && !previewData.overlappingRun && (
                <button
                  onClick={() => setConfirmModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Distribute Points
                </button>
              )}
            </div>

            {previewData.creators.length === 0 ? (
              <div className="py-12 text-center text-foreground/40 text-sm">
                No creator reading data available for this date window.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-white/[0.02] text-foreground/60 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Creator / Channel</th>
                      <th className="py-3 px-4 text-center">Qualified (1.0)</th>
                      <th className="py-3 px-4 text-center">Engaged (2.5)</th>
                      <th className="py-3 px-4 text-center">Completed (4.0)</th>
                      <th className="py-3 px-4 text-right">Quality Score</th>
                      <th className="py-3 px-4 text-right">Share %</th>
                      <th className="py-3 px-4 text-right">Points to Credit</th>
                      <th className="py-3 px-4 text-right">USD Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {previewData.creators.map((c, index) => (
                      <tr key={c.creatorId} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 text-foreground/40 font-bold">
                          #{index + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/20 border border-white/10 shrink-0 flex items-center justify-center">
                              {c.profileImage ? (
                                <img
                                  src={c.profileImage}
                                  alt={c.channelName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-primary">
                                  {c.channelName.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{c.channelName}</p>
                              <p className="text-[10px] text-foreground/40 truncate">
                                {c.ownerEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center text-foreground/70">
                          {c.qualifiedReadsCount}
                        </td>
                        <td className="py-3.5 px-4 text-center text-foreground/70">
                          {c.engagedReadsCount}
                        </td>
                        <td className="py-3.5 px-4 text-center text-foreground/70">
                          {c.completedReadsCount}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-primary">
                          {c.qualityScore.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-foreground/80">
                          {c.scorePercentage.toFixed(2)}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                          +{c.pointsAwarded.toLocaleString()} pts
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-foreground/60">
                          ${c.fiatEquivalent.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation & Execution Modal */}
      {confirmModalOpen && previewData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#121215] border border-white/10 p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Revenue Distribution</h3>
                <p className="text-xs text-foreground/60">
                  {format(new Date(previewData.periodStart), "MMM d, yyyy")} –{" "}
                  {format(new Date(previewData.periodEnd), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground/60">Distributable Points Pool:</span>
                <span className="font-bold text-emerald-400">
                  {previewData.distributablePool.toLocaleString()} Points ($
                  {(previewData.distributablePool * previewData.pointRate).toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Recipients Count:</span>
                <span className="font-bold text-white">{previewData.creators.length} Creators</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Total Platform Score:</span>
                <span className="font-bold text-primary">
                  {previewData.totalPlatformQualityScore.toLocaleString()} pts
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                Audit Notes / Description (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. July 2026 AdSense distribution batch"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                This will atomically credit each creator&apos;s point balance, update lifetime
                earnings, and generate audit trail records.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={executing}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDistribution}
                disabled={executing}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Executing Batch...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Execute & Credit Points
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Distribution Runs Section */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Distribution Runs History & Audit Trail
            </h2>
            <p className="text-xs text-foreground/60 mt-0.5">
              Permanent audit ledger of all completed and reverted revenue distributions
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          {history.length === 0 ? (
            <div className="py-12 text-center text-foreground/40 text-sm">
              No revenue distributions executed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.02] text-foreground/60 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Gross Input</th>
                    <th className="py-3 px-4">Distributed Pool</th>
                    <th className="py-3 px-4 text-center">Creators</th>
                    <th className="py-3 px-4">Executed By</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Date Executed</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {history.map((run) => (
                    <tr key={run.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {format(new Date(run.periodStart), "MMM d, yyyy")} –{" "}
                        {format(new Date(run.periodEnd), "MMM d, yyyy")}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-foreground/80">
                        {run.currency === "USD" ? `$${run.grossAmountEntered.toFixed(2)}` : `${run.grossAmountEntered.toLocaleString()} pts`}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        {run.distributablePool.toLocaleString()} pts
                      </td>
                      <td className="py-3.5 px-4 text-center text-foreground/70">
                        {run.totalCreatorsCount}
                      </td>
                      <td className="py-3.5 px-4 text-foreground/60">
                        {run.admin?.name || "Admin"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            run.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-foreground/40 font-mono">
                        {format(new Date(run.createdAt), "MMM d, yyyy HH:mm")}
                      </td>
                      <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleInspectRun(run.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition"
                        >
                          Inspect
                        </button>
                        {run.status === "COMPLETED" && (
                          <button
                            onClick={() => openRevertModal(run)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Revert
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Inspect Single Run Details Modal */}
      {inspectRun && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-[#121215] border border-white/10 p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Distribution Run Breakdown #{inspectRun.id}
                </h3>
                <p className="text-xs text-foreground/60 mt-0.5">
                  Period: {format(new Date(inspectRun.periodStart), "MMM d, yyyy")} –{" "}
                  {format(new Date(inspectRun.periodEnd), "MMM d, yyyy")} • Executed by{" "}
                  {inspectRun.admin?.name || "Admin"} on{" "}
                  {format(new Date(inspectRun.createdAt), "MMM d, yyyy HH:mm")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {inspectRun.status === "COMPLETED" && (
                  <button
                    onClick={() => openRevertModal(inspectRun)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Revert Run
                  </button>
                )}
                <button
                  onClick={() => setInspectRun(null)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/70"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Run Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-foreground/50">Total Pool:</span>
                <p className="text-sm font-bold text-primary mt-0.5">
                  {inspectRun.distributablePool.toLocaleString()} pts
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-foreground/50">Total Quality Score:</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {inspectRun.totalQualityScore.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-foreground/50">Creators Paid:</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {inspectRun.totalCreatorsCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-foreground/50">Status:</span>
                <p className="text-sm font-bold text-white mt-0.5">{inspectRun.status}</p>
              </div>
            </div>

            {/* Itemized Payout Table */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-white/5">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#18181c] border-b border-white/10 text-foreground/60 uppercase text-[10px] tracking-wider z-10">
                  <tr>
                    <th className="py-2.5 px-3">Creator</th>
                    <th className="py-2.5 px-3 text-center">Qualified</th>
                    <th className="py-2.5 px-3 text-center">Engaged</th>
                    <th className="py-2.5 px-3 text-center">Completed</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                    <th className="py-2.5 px-3 text-right">Share %</th>
                    <th className="py-2.5 px-3 text-right">Points Credited</th>
                    {inspectRun.status === "REVERTED" && (
                      <>
                        <th className="py-2.5 px-3 text-right text-yellow-400">Clawed Back</th>
                        <th className="py-2.5 px-3 text-right text-red-400">Shortfall</th>
                      </>
                    )}
                    <th className="py-2.5 px-3 text-right">USD Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(inspectRun.creatorPayouts || []).map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-bold text-white">
                        {p.creator?.channelName || "Creator"}
                      </td>
                      <td className="py-2.5 px-3 text-center text-foreground/70">
                        {p.qualifiedReadsCount}
                      </td>
                      <td className="py-2.5 px-3 text-center text-foreground/70">
                        {p.engagedReadsCount}
                      </td>
                      <td className="py-2.5 px-3 text-center text-foreground/70">
                        {p.completedReadsCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                        {p.qualityScore.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-foreground/80">
                        {p.scorePercentage.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        +{p.pointsAwarded.toLocaleString()} pts
                      </td>
                      {inspectRun.status === "REVERTED" && (
                        <>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-yellow-400">
                            -{p.revertedPoints?.toLocaleString() ?? 0} pts
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-red-400">
                            {p.shortfallPoints ? `${p.shortfallPoints.toLocaleString()} pts` : "0"}
                          </td>
                        </>
                      )}
                      <td className="py-2.5 px-3 text-right font-mono text-foreground/60">
                        ${p.fiatEquivalent.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2-Step Revert & Clawback Confirmation Modal */}
      {revertModalOpen && revertTargetRun && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#141215] border border-red-500/30 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Revert Revenue Distribution</h3>
                <p className="text-xs text-foreground/60">
                  Run #{revertTargetRun.id} • {format(new Date(revertTargetRun.periodStart), "MMM d, yyyy")} –{" "}
                  {format(new Date(revertTargetRun.periodEnd), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs space-y-2">
              <p className="font-bold text-red-200">⚠️ Irreversible Accounting Action & Clawback Rules:</p>
              <ul className="list-disc pl-4 space-y-1 text-foreground/80">
                <li>
                  <strong className="text-white">Auto-cancels PENDING withdrawals:</strong> Any pending cashout
                  requests for affected creators will be rejected with an explanation note and refunded to their live balance.
                </li>
                <li>
                  <strong className="text-white">Claws back points:</strong> Deducts up to each creator&apos;s current live
                  balance (points cannot go negative).
                </li>
                <li>
                  <strong className="text-white">Shortfall tracking:</strong> If a creator has already withdrawn funds (approved withdrawals are untouched), the deficit is recorded as an unresolved shortfall on the audit ledger.
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground/60">Total Points Awarded to Reclaim:</span>
                <span className="font-bold text-white">{revertTargetRun.distributablePool.toLocaleString()} Points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Affected Creators Count:</span>
                <span className="font-bold text-white">{revertTargetRun.totalCreatorsCount} Creators</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
                Reason for Reversal (Audit Trail)
              </label>
              <textarea
                rows={2}
                value={revertReason}
                onChange={(e) => setRevertReason(e.target.value)}
                placeholder="e.g. Discovered fraud cluster in period reads / calculation correction"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-foreground/30 focus:outline-none focus:border-red-500/50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-red-300 mb-1.5">
                Type <strong className="text-white underline">REVERT</strong> below to confirm:
              </label>
              <input
                type="text"
                value={revertConfirmText}
                onChange={(e) => setRevertConfirmText(e.target.value)}
                placeholder="Type REVERT"
                className="w-full px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono font-bold text-white focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRevertModalOpen(false)}
                disabled={reverting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/80 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRevert}
                disabled={reverting || revertConfirmText.trim().toUpperCase() !== "REVERT"}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {reverting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Reverting & Clawing Back...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Confirm Revert & Clawback Points
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
