"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Flag, X, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { CreateReportAction } from "@/actions/community";
import { toast } from "react-hot-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "series" | "chapter" | "comment" | "review" | "user";
  targetId: string;
  targetTitle?: string;
}

const REPORT_REASONS = [
  "Broken or Missing Chapters / Images",
  "Inappropriate or Explicit Content",
  "Copyright or DMCA Infringement",
  "Incorrect Details or Duplicate Series",
  "Spam, Scam, or Misleading Links",
  "Other Reason",
];

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    setLoading(true);
    try {
      const fullReason = details.trim()
        ? `${selectedReason}: ${details.trim()}`
        : selectedReason;

      const res = await CreateReportAction({
        targetType,
        targetId,
        reason: fullReason,
      });

      if (res.success) {
        setSubmitted(true);
        toast.success("Report submitted successfully");
        setTimeout(() => {
          setSubmitted(false);
          setDetails("");
          onClose();
        }, 1800);
      } else {
        toast.error(res.message || "Please log in to submit a report");
      }
    } catch (_err) {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-5 bg-[#141419] z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Report {targetType.charAt(0).toUpperCase() + targetType.slice(1)}
              </h3>
              {targetTitle && (
                <p className="text-xs text-zinc-400 truncate max-w-xs">{targetTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Thank You for Reporting</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Our moderation team has received your report and will review it promptly to keep Comic BD safe and enjoyable.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Reason for Report</label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition text-xs font-medium ${
                      selectedReason === r
                        ? "bg-red-500/10 border-red-500/40 text-white"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="text-primary focus:ring-primary h-4 w-4 bg-transparent border-zinc-700 cursor-pointer"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any specific chapter numbers, error timestamps, or context..."
                rows={3}
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>False or abusive reports may lead to temporary account restrictions.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
