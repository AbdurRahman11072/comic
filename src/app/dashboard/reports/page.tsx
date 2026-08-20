"use client";

import { useState, useEffect } from "react";
import { communityService, ReportItem } from "@/services/community.service";
import { ResolveReportAction } from "@/actions/community";
import { MuteUserAction, BanUserAction } from "@/actions/user";
import {
  AlertTriangle, CheckCircle2, XCircle, Shield, Ban, VolumeX, Loader2, RefreshCw, MessageSquare
} from "lucide-react";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export default function ReportsManagementPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await communityService.getReports({ status: statusFilter });
      if (res.success && Array.isArray(res.data)) {
        setReports(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolve = async (id: string, status: "RESOLVED" | "DISMISSED") => {
    try {
      const res = await ResolveReportAction(id, { status });
      if (res.success) {
        toast.success(`Report marked as ${status.toLowerCase()}`);
        fetchReports();
      } else {
        toast.error(res.message || "Failed to update report");
      }
    } catch (_err) {
      toast.error("Failed to update report");
    }
  };

  const handleMuteUser = async (userId: string, hours: number) => {
    try {
      const res = await MuteUserAction(userId, { durationHours: hours });
      if (res.success) {
        toast.success(`User muted for ${hours} hours`);
      } else {
        toast.error(res.message || "Failed to mute user");
      }
    } catch (_err) {
      toast.error("Failed to mute user");
    }
  };

  const handleBanUser = async (userId: string, reason: string) => {
    if (!confirm("Are you sure you want to ban this user?")) return;
    try {
      const res = await BanUserAction(userId, {
        banned: true,
        banReason: reason,
      });
      if (res.success) {
        toast.success("User banned successfully");
      } else {
        toast.error(res.message || "Failed to ban user");
      }
    } catch (_err) {
      toast.error("Failed to ban user");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <AlertTriangle className="w-6 h-6 text-primary" /> Moderation & Reports Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review reported comments, reviews, series, and take immediate moderation action.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 glass rounded-xl text-sm font-semibold text-white outline-none border border-white/10"
          >
            <option value="PENDING" className="bg-neutral-900">Pending Reports</option>
            <option value="RESOLVED" className="bg-neutral-900">Resolved Reports</option>
            <option value="DISMISSED" className="bg-neutral-900">Dismissed Reports</option>
          </select>
          <button
            onClick={fetchReports}
            className="p-2.5 glass glass-hover rounded-xl text-white/80 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id}
              className="glass p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/20 text-primary uppercase">
                    {report.targetType}
                  </span>
                  <span className="text-xs text-white/50">
                    Reported by <strong className="text-white">{report.reporter?.name || "Anonymous"}</strong>
                  </span>
                </div>
                <span className="text-xs text-white/40">
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </span>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Reason</p>
                <p className="text-sm font-medium text-white/90 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  "{report.reason}"
                </p>
              </div>

              {/* Quick Actions */}
              {report.status === "PENDING" && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMuteUser(report.reporterId, 24)}
                      className="px-3 py-1.5 glass glass-hover text-yellow-400 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <VolumeX className="w-3.5 h-3.5" /> Mute 24h
                    </button>
                    <button
                      onClick={() => handleBanUser(report.reporterId, `Violated rules: ${report.reason}`)}
                      className="px-3 py-1.5 glass glass-hover text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" /> Ban User
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolve(report.id, "DISMISSED")}
                      className="px-4 py-1.5 glass glass-hover text-white/70 hover:text-white rounded-xl text-xs font-bold"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleResolve(report.id, "RESOLVED")}
                      className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 glass rounded-2xl border border-white/5 text-muted-foreground text-sm">
            No {statusFilter.toLowerCase()} reports to review. Everything is clean! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
