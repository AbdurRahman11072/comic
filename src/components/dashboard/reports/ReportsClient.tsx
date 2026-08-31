"use client";

import { useState } from "react";
import { communityService, ReportItem } from "@/services/community.service";
import { ResolveReportAction } from "@/actions/community";
import { MuteUserAction, BanUserAction } from "@/actions/user";
import {
  AlertTriangle,
  CheckCircle2,
  Ban,
  VolumeX,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

import { PaginationFooter } from "@/components/dashboard/PaginationFooter";

interface ReportsClientProps {
  initialReports?: ReportItem[];
  initialStatus?: string;
}

export function ReportsClient({
  initialReports = [],
  initialStatus = "PENDING",
}: ReportsClientProps) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReports = async (status = statusFilter) => {
    setLoading(true);
    try {
      const res = await communityService.getReports({ status });
      if (res.success && Array.isArray(res.data)) {
        setReports(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch reports", err);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    fetchReports(newStatus);
  };

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

  const totalPages = Math.ceil(reports.length / itemsPerPage) || 1;
  const paginatedReports = reports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <AlertTriangle className="w-6 h-6 text-yellow-400" /> Moderation & Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review user-submitted reports for copyright, spam, abusive comments, and inappropriate content.
          </p>
        </div>

        {/* Filter Badges & Refresh */}
        <div className="flex items-center gap-2">
          {(["PENDING", "RESOLVED", "DISMISSED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === status
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "glass glass-hover text-white/70"
              }`}
            >
              {status}
            </button>
          ))}

          <button
            onClick={() => fetchReports()}
            disabled={loading}
            className="p-2.5 glass glass-hover rounded-xl text-white/80 hover:text-white disabled:opacity-50 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredReportsList(paginatedReports)}

        <PaginationFooter
          page={currentPage}
          totalPages={totalPages}
          totalItems={reports.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );

  function filteredReportsList(items: ReportItem[]) {
    if (items.length === 0) {
      return (
        <div className="text-center py-20 glass rounded-2xl border border-white/5 text-muted-foreground text-sm">
          No {statusFilter.toLowerCase()} reports to review. Everything is clean! 🎉
        </div>
      );
    }

    return items.map((report) => (
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
            &quot;{report.reason}&quot;
          </p>
        </div>

        {/* Quick Actions */}
        {report.status === "PENDING" && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMuteUser(report.reporterId, 24)}
                className="px-3 py-1.5 glass glass-hover text-yellow-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" /> Mute 24h
              </button>
              <button
                onClick={() => handleBanUser(report.reporterId, `Violated rules: ${report.reason}`)}
                className="px-3 py-1.5 glass glass-hover text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" /> Ban User
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResolve(report.id, "DISMISSED")}
                className="px-4 py-1.5 glass glass-hover text-white/70 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleResolve(report.id, "RESOLVED")}
                className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
              </button>
            </div>
          </div>
        )}
      </div>
    ));
  }
}
