"use client";

import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="bg-black/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          {new Date(point.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="text-sm font-extrabold text-emerald-400 mt-1">
          {point.points.toLocaleString()} Points
        </p>
      </div>
    );
  }
  return null;
};

interface AnalyticsChartsProps {
  mounted: boolean;
  revenueChart: any[];
  comparisonData: any[];
}

export function AnalyticsCharts({
  mounted,
  revenueChart,
  comparisonData,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend Area Chart */}
      <div className="glass rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue (Last 30 Days)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Points generated from premium chapter unlocks.
            </p>
          </div>
        </div>
        <div className="h-64 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueChart}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(str) => {
                    try {
                      return new Date(str).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    } catch {
                      return str;
                    }
                  }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} P`}
                />
                <RechartsTooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-white/5 animate-pulse rounded-xl" />
          )}
        </div>
      </div>

      {/* Series Comparison Bar Chart */}
      <div className="glass rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Series Views Comparison
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Comparative readership volume across your active titles.
            </p>
          </div>
        </div>
        <div className="h-64 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="views" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                  {comparisonData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#f59e0b" : "#3b82f6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-white/5 animate-pulse rounded-xl" />
          )}
        </div>
      </div>
    </div>
  );
}
