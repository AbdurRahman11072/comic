"use client";

import React from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueCashFlowChartProps {
  data: Array<{
    date: string;
    revenue: number;
    payouts: number;
    margin: number;
  }>;
  mounted: boolean;
}

const CustomCashFlowTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="bg-black/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-1.5 min-w-[180px]">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          {new Date(point.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-emerald-400">Gross Revenue:</span>
          <span className="font-mono font-bold">${point.revenue.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-rose-400">Creator Payouts:</span>
          <span className="font-mono font-bold">${point.payouts.toFixed(2)}</span>
        </div>
        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-xs font-bold">
          <span className="text-cyan-400">Net Platform Margin:</span>
          <span className="font-mono font-black">${point.margin.toFixed(2)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueCashFlowChart({ data, mounted }: RevenueCashFlowChartProps) {
  return (
    <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Financial Cash Flow & Net Margin
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gross customer payments vs creator withdrawals and platform retained earnings.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-white/80">Revenue Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="text-white/80">Creator Payouts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-white/80">Net Margin</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
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
                tickFormatter={(val) => `$${val}`}
              />
              <RechartsTooltip content={<CustomCashFlowTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Gross Revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorGross)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="payouts"
                name="Creator Payouts"
                stroke="#f43f5e"
                fillOpacity={1}
                fill="url(#colorPayouts)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="margin"
                name="Net Margin"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#colorMargin)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl" />
        )}
      </div>
    </div>
  );
}
