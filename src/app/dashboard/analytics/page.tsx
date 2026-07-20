"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";
import {
  BarChart3,
  Eye,
  BookOpen,
  Layers,
  Heart,
  MessageSquare,
  DollarSign,
  Loader2,
  TrendingUp,
  Star,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface OverviewStats {
  totalSeries: number;
  totalChapters: number;
  totalViews: number;
  totalBookmarks: number;
  totalReviews: number;
  totalRevenue: number;
}

interface SeriesStat {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  totalViews: number;
  rating: number;
  createdAt: string;
  _count: {
    chapters: number;
    bookmarks: number;
    reviews: number;
  };
}

interface RevenuePoint {
  date: string;
  points: number;
}

interface AnalyticsData {
  overview: OverviewStats;
  series: SeriesStat[];
  revenueChart: RevenuePoint[];
}

const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="bg-black/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          {new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
        <p className="text-sm font-extrabold text-emerald-400 mt-1">
          {point.points.toLocaleString()} Points
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data: session } = authClient.useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await api.get("/api/v1/creators/analytics");
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>No analytics data available yet. Start by publishing a series!</p>
      </div>
    );
  }

  const { overview, series, revenueChart } = data;

  // Find max revenue for bar chart scaling
  const maxRevenue = Math.max(...revenueChart.map((r) => r.points), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your content performance and revenue.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Series", value: overview.totalSeries, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Chapters", value: overview.totalChapters, icon: Layers, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "Total Views", value: overview.totalViews.toLocaleString(), icon: Eye, color: "text-cyan-400", bg: "bg-cyan-400/10" },
          { label: "Bookmarks", value: overview.totalBookmarks, icon: Heart, color: "text-pink-400", bg: "bg-pink-400/10" },
          { label: "Reviews", value: overview.totalReviews, icon: MessageSquare, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Revenue", value: `${overview.totalRevenue.toLocaleString()} P`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div className="absolute -top-2 -right-2 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
                <Icon className="w-20 h-20" />
              </div>
              <div className={`p-2 rounded-lg ${stat.bg} w-fit mb-3`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart (Last 30 Days) */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Revenue (Last 30 Days)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Points earned from premium chapter purchases.
            </p>
          </div>
        </div>
        <div className="h-64 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(str) => {
                    try {
                      return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

      {/* Series Performance Table */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-bold mb-5">Series Performance</h2>
        {series.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>You haven't published any series yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="pb-3 pr-4">Series</th>
                  <th className="pb-3 px-4 text-center">Chapters</th>
                  <th className="pb-3 px-4 text-center">Views</th>
                  <th className="pb-3 px-4 text-center">Bookmarks</th>
                  <th className="pb-3 px-4 text-center">Reviews</th>
                  <th className="pb-3 px-4 text-center">Rating</th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-4">
                      <Link href={`/series/${s.slug}`} className="flex items-center gap-3 group">
                        <div
                          className="w-10 h-14 rounded-lg bg-white/5 border border-white/10 bg-center bg-cover shrink-0 group-hover:border-primary/30 transition-colors"
                          style={{ backgroundImage: s.coverUrl ? `url(${s.coverUrl})` : undefined }}
                        />
                        <span className="font-semibold group-hover:text-primary transition-colors truncate max-w-[200px]">
                          {s.title}
                        </span>
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-center font-mono">{s._count.chapters}</td>
                    <td className="py-4 px-4 text-center font-mono">{s.totalViews.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center font-mono">{s._count.bookmarks}</td>
                    <td className="py-4 px-4 text-center font-mono">{s._count.reviews}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-yellow-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {s.rating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
