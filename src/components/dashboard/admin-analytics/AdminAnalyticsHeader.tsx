"use client";

import React from "react";
import { BarChart3, Clock, Download, RefreshCw, ShieldCheck } from "lucide-react";

interface AdminAnalyticsHeaderProps {
  timeframe: string;
  loading: boolean;
  onTimeframeChange: (tf: string) => void;
  onRefresh: () => void;
}

export function AdminAnalyticsHeader({
  timeframe,
  loading,
  onTimeframeChange,
  onRefresh,
}: AdminAnalyticsHeaderProps) {
  const timeframes = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
    { label: "1 Year", value: "1y" },
    { label: "All Time", value: "all" },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Executive Dashboard
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Platform Telemetry
          </span>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <BarChart3 className="w-7 h-7 text-primary" /> Platform Intelligence & Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time financial performance, reader engagement quality, ad monetization, and creator
          growth metrics.
        </p>
      </div>

      {/* Controls & Timeframe Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1 shadow-inner">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeframe === tf.value
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-xl glass hover:bg-white/10 text-muted-foreground hover:text-white transition disabled:opacity-50 cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
        </button>
      </div>
    </div>
  );
}
