"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Database, Download, ShieldCheck, RefreshCw, Loader2,
  Users, BookOpen, Layers, MessageSquare, DollarSign,
  AlertCircle, Sparkles, CheckCircle2, Clock
} from "lucide-react";
import { toast } from "react-hot-toast";

interface BackupStats {
  usersCount: number;
  seriesCount: number;
  chaptersCount: number;
  commentsCount: number;
  transactionsCount: number;
  reportsCount: number;
  promosCount: number;
  auditLogsCount: number;
  timestamp: string;
}

export default function AdminBackupPage() {
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/admin/backup/stats");
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      toast.error("Failed to load database backup statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      // Direct browser download
      const response = await api.get("/api/v1/admin/backup/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `comic_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Database backup downloaded successfully!");
      fetchStats();
    } catch (err) {
      toast.error("Failed to export database backup.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Database className="w-6 h-6 text-primary" /> Database Backup & Snapshot Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Export full JSON data backups across all tables for offline storage and disaster recovery.
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          disabled={exporting || loading}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Complete Backup (.json)
        </button>
      </div>

      {/* Snapshot Overview Grid */}
      <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Live Database Table Metrics
          </h2>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 rounded-lg glass glass-hover text-white/70 hover:text-white"
            title="Refresh counts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Users", count: stats.usersCount, icon: Users, color: "text-blue-400" },
              { label: "Total Series", count: stats.seriesCount, icon: BookOpen, color: "text-emerald-400" },
              { label: "Total Chapters", count: stats.chaptersCount, icon: Layers, color: "text-purple-400" },
              { label: "User Comments", count: stats.commentsCount, icon: MessageSquare, color: "text-amber-400" },
              { label: "Point Transactions", count: stats.transactionsCount, icon: DollarSign, color: "text-emerald-400" },
              { label: "User Reports", count: stats.reportsCount, icon: AlertCircle, color: "text-red-400" },
              { label: "Promo Codes", count: stats.promosCount, icon: Sparkles, color: "text-pink-400" },
              { label: "Staff Audit Logs", count: stats.auditLogsCount, icon: ShieldCheck, color: "text-cyan-400" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-xl font-bold text-white font-mono">{stat.count.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Backup Instructions & Audit Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> What is included in this backup?
          </h3>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
            <li>Platform Site Configuration & Legal documents</li>
            <li>All User accounts (excluding sensitive auth hashes)</li>
            <li>Full Series, Genres & Chapter metadata</li>
            <li>Creator Promo Codes & Redemption logs</li>
            <li>Transaction history & Staff moderation audit logs</li>
          </ul>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Cloud Database Auto-Backups
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your production database on Neon PostgreSQL automatically performs Point-in-Time recovery (PITR) and daily automated snapshots.
            Use this JSON exporter whenever you want an offline archive or migration dump.
          </p>
        </div>
      </div>
    </div>
  );
}
