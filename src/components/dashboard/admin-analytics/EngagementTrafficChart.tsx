"use client";

import React from "react";
import { Activity, CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface EngagementTrafficChartProps {
  readQualityDistribution: Array<{
    tier: string;
    name: string;
    count: number;
    color: string;
  }>;
  mounted: boolean;
}

export function EngagementTrafficChart({
  readQualityDistribution,
  mounted,
}: EngagementTrafficChartProps) {
  const totalEvents = readQualityDistribution.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-cyan-400" /> Reader Engagement & Quality Retention
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Breakdown of reading sessions across duration and chapter completion tiers.
          </p>
        </div>
        <span className="text-xs font-bold text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          {totalEvents.toLocaleString()} Total Read Events
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Bar Visualization */}
        <div className="h-56 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={readQualityDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="tier" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "14px",
                  }}
                  formatter={(val: any) => [`${val.toLocaleString()} reads`, "Volume"]}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {readQualityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl" />
          )}
        </div>

        {/* Quality Tier Legend & Percentage breakdown */}
        <div className="space-y-2.5">
          {readQualityDistribution.map((item) => {
            const pct = totalEvents > 0 ? ((item.count / totalEvents) * 100).toFixed(1) : "0.0";
            return (
              <div
                key={item.tier}
                className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.count.toLocaleString()} sessions</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white/90">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
