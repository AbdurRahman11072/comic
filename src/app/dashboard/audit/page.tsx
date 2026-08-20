"use client";

import { useState, useEffect, useCallback } from "react";
import { auditService, AuditLog } from "@/services/audit.service";
import {
  ShieldAlert, ShieldCheck, UserCheck, Settings, Trash2, Ban, RefreshCw, Loader2, Calendar
} from "lucide-react";
import { format } from "date-fns";

export default function AuditLogsDashboardPage() {
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await auditService.getAuditLogs({ page, limit: 25 });
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
      }
    } catch (_err) {
      // Handled in service fallback
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);


  const getActionBadge = (action: string) => {
    if (action.includes("BAN")) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
          <Ban className="w-3 h-3" /> {action}
        </span>
      );
    }
    if (action.includes("PROMO") || action.includes("CREATE")) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> {action}
        </span>
      );
    }
    if (action.includes("DELETE")) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> {action}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
        <Settings className="w-3 h-3" /> {action}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" /> Staff Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tamper-evident record of administrative and moderation actions on the platform.
          </p>
        </div>
        <button
          onClick={() => fetchLogs()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 glass glass-hover rounded-xl text-sm font-semibold text-white/80 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-primary" : ""}`} /> Refresh
        </button>
      </div>

      {/* Logs Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Staff Member</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Target</th>
                  <th className="py-4 px-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-6 text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-white/10 overflow-hidden shrink-0">
                          {log.actor?.image ? (
                            <img src={log.actor.image} alt="Actor" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/50">
                              {log.actor?.name?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{log.actor?.name || "System"}</p>
                          <span className="text-[10px] text-white/40 uppercase font-bold">{log.actor?.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getActionBadge(log.action)}</td>
                    <td className="py-4 px-6 text-xs font-mono text-white/70">
                      {log.targetType} {log.targetId && `(${log.targetId.slice(0, 8)}...)`}
                    </td>
                    <td className="py-4 px-6 text-xs text-white/60 font-mono max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No audit logs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
