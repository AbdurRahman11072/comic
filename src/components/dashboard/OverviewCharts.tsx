"use client";

import { useEffect, useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

const DATA = [
  { name: "Jan", revenue: 4000, visitors: 2400 },
  { name: "Feb", revenue: 3000, visitors: 1398 },
  { name: "Mar", revenue: 2000, visitors: 9800 },
  { name: "Apr", revenue: 2780, visitors: 3908 },
  { name: "May", revenue: 1890, visitors: 4800 },
  { name: "Jun", revenue: 2390, visitors: 3800 },
  { name: "Jul", revenue: 3490, visitors: 4300 },
];

const SERIES_STATS = [
  { name: "Action", value: 400, color: "#e11d48" },
  { name: "Romance", value: 300, color: "#3b82f6" },
  { name: "Comedy", value: 300, color: "#10b981" },
  { name: "Drama", value: 200, color: "#8b5cf6" },
];

export function OverviewCharts() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-2xl" />
    <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-2xl" />
  </div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Area Chart */}
      <div className="glass p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col">
        <h3 className="text-lg font-bold mb-6">Revenue & Growth</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DATA}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(17, 24, 39, 0.9)", 
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(8px)"
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#e11d48" 
                fillOpacity={1} 
                fill="url(#colorRev)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Series Category Bar Chart */}
      <div className="glass p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col">
        <h3 className="text-lg font-bold mb-6">Content Distribution</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SERIES_STATS} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="rgba(255,255,255,0.6)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{ 
                  backgroundColor: "rgba(17, 24, 39, 0.9)", 
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px"
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {SERIES_STATS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
