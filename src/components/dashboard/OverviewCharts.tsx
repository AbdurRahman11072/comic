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

interface RevenueDataPoint {
  name: string;
  revenue: number;
}

interface ContentDistributionItem {
  name: string;
  value: number;
  color: string;
}

interface OverviewChartsProps {
  revenueData?: RevenueDataPoint[];
  distributionData?: ContentDistributionItem[];
  currencySymbol?: string;
}

const DEFAULT_REVENUE: RevenueDataPoint[] = [
  { name: "Jan", revenue: 0 },
  { name: "Feb", revenue: 0 },
  { name: "Mar", revenue: 0 },
  { name: "Apr", revenue: 0 },
  { name: "May", revenue: 0 },
  { name: "Jun", revenue: 0 },
  { name: "Jul", revenue: 0 },
];

const DEFAULT_DISTRIBUTION: ContentDistributionItem[] = [
  { name: "MANHWA", value: 0, color: "#e11d48" },
  { name: "MANGA", value: 0, color: "#3b82f6" },
  { name: "COMIC", value: 0, color: "#10b981" },
  { name: "MANHUA", value: 0, color: "#8b5cf6" },
];

export function OverviewCharts({
  revenueData,
  distributionData,
  currencySymbol = "$",
}: OverviewChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartRevenue = revenueData && revenueData.length > 0 ? revenueData : DEFAULT_REVENUE;
  const chartDistribution = distributionData !== undefined && distributionData.length > 0 
    ? distributionData 
    : DEFAULT_DISTRIBUTION;

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-2xl" />
        <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Area Chart */}
      <div className="glass p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col">
        <h3 className="text-lg font-bold mb-6">Revenue & Growth</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartRevenue}>
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
                tickFormatter={(value) => `${currencySymbol}${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(17, 24, 39, 0.9)", 
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(8px)"
                }}
                formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, "Revenue"]}
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
            <BarChart data={chartDistribution} layout="vertical" margin={{ left: 20 }}>
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
                formatter={(val: any) => [`${val} series`, "Count"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {chartDistribution.map((entry, index) => (
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
