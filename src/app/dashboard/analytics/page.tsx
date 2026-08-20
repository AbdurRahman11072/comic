"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { creatorService } from "@/services/creator.service";
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
  AlertTriangle,
  Flame,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Filter,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Cell
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
  type: string;
  status: string;
  totalViews: number;
  rating: number;
  earnings: number;
  bookmarkRate: number;
  daysSinceUpdate: number;
  attentionStatus: "TRENDING" | "STEADY" | "NEEDS_ATTENTION" | "NEW";
  attentionReason: string;
  createdAt: string;
  updatedAt: string;
  chapters?: {
    id: string;
    number: number;
    title: string | null;
    isLocked: boolean;
    coinCost: number;
    createdAt: string;
  }[];
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

function AnalyticsContent() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const initialSeriesId = searchParams.get("seriesId") || "ALL";

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(initialSeriesId);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (searchParams.get("seriesId")) {
      setSelectedSeriesId(searchParams.get("seriesId")!);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await creatorService.getAnalytics();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [session]);

  const selectedSeries = useMemo(() => {
    if (!data?.series || selectedSeriesId === "ALL") return null;
    return data.series.find((s) => s.id === selectedSeriesId) || null;
  }, [data, selectedSeriesId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.series.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-muted-foreground">
          <BarChart3 className="w-8 h-8 opacity-40" />
        </div>
        <h2 className="text-xl font-bold">No Analytics Data Yet</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Publish your first series and start uploading chapters to view engagement graphs, views, and revenue diagnostics.
        </p>
        <Link href="/dashboard/series/add">
          <button className="px-5 py-2.5 bg-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition">
            Add New Series
          </button>
        </Link>
      </div>
    );
  }

  const { overview, series, revenueChart } = data;

  // Compute needs-attention list
  const attentionList = series.filter((s) => s.attentionStatus === "NEEDS_ATTENTION");
  const trendingList = series.filter((s) => s.attentionStatus === "TRENDING");

  // Chart data for comparing series views
  const comparisonData = series.map((s) => ({
    name: s.title.length > 15 ? s.title.slice(0, 15) + "..." : s.title,
    views: s.totalViews,
    bookmarks: s._count.bookmarks,
    earnings: s.earnings,
  }));

  return (
    <div className="space-y-8">
      {/* Header with Series Filter Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Series & Revenue Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze engagement, reader retention, and actionable attention diagnostics.
          </p>
        </div>

        {/* Series Filter Selector */}
        <div className="flex items-center gap-2 bg-neutral-900/80 border border-white/10 rounded-2xl p-1.5 shadow-lg">
          <Filter className="w-4 h-4 text-muted-foreground ml-2" />
          <select
            value={selectedSeriesId}
            onChange={(e) => setSelectedSeriesId(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white px-2 py-1.5 rounded-xl outline-none cursor-pointer focus:ring-1 focus:ring-primary"
          >
            <option value="ALL" className="bg-neutral-900 text-white">
              📊 All Series (Portfolio Overview)
            </option>
            {series.map((s) => (
              <option key={s.id} value={s.id} className="bg-neutral-900 text-white">
                {s.title} ({s.totalViews.toLocaleString()} views)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Series Spotlight / Alert Banner */}
      {selectedSeries ? (
        <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent border border-primary/20 p-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-22 rounded-xl bg-white/10 border border-white/10 bg-center bg-cover shrink-0 shadow-xl"
                style={{ backgroundImage: selectedSeries.coverUrl ? `url(${selectedSeries.coverUrl})` : undefined }}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-white">
                    {selectedSeries.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">
                    {selectedSeries.status}
                  </span>
                  {selectedSeries.attentionStatus === "NEEDS_ATTENTION" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Needs Attention
                    </span>
                  ) : selectedSeries.attentionStatus === "TRENDING" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <Flame className="w-3 h-3" /> High Engagement
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Stable Performance
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedSeries.title}</h2>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <span>Updated {selectedSeries.daysSinceUpdate} days ago</span>
                  <span>•</span>
                  <span>{selectedSeries._count.chapters} Chapters published</span>
                </p>
              </div>
            </div>

            {/* Diagnostic Note Box */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-md w-full">
              <div className="flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">Diagnostic Insight</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedSeries.attentionReason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: selectedSeries ? "Chapters" : "Series",
            value: selectedSeries ? selectedSeries._count.chapters : overview.totalSeries,
            icon: BookOpen,
            color: "text-blue-400",
            bg: "bg-blue-400/10"
          },
          {
            label: "Total Views",
            value: selectedSeries ? selectedSeries.totalViews.toLocaleString() : overview.totalViews.toLocaleString(),
            icon: Eye,
            color: "text-amber-400",
            bg: "bg-amber-400/10"
          },
          {
            label: "Bookmarks",
            value: selectedSeries ? selectedSeries._count.bookmarks : overview.totalBookmarks,
            icon: Heart,
            color: "text-pink-400",
            bg: "bg-pink-400/10"
          },
          {
            label: selectedSeries ? "Save Rate" : "Total Reviews",
            value: selectedSeries ? `${selectedSeries.bookmarkRate}%` : overview.totalReviews,
            icon: selectedSeries ? TrendingUp : MessageSquare,
            color: "text-cyan-400",
            bg: "bg-cyan-400/10"
          },
          {
            label: "Rating",
            value: selectedSeries ? `${selectedSeries.rating.toFixed(1)} ★` : "4.8 ★",
            icon: Star,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10"
          },
          {
            label: "Earnings",
            value: `${(selectedSeries ? selectedSeries.earnings : overview.totalRevenue).toLocaleString()} P`,
            icon: DollarSign,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10"
          },
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

      {/* Engagement & Action Alert Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention Card */}
        <div className="glass rounded-3xl p-6 border border-red-500/20 bg-gradient-to-b from-red-500/[0.03] to-transparent">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Series Needing Attention ({attentionList.length})
            </h2>
            <span className="text-[10px] text-muted-foreground">Action Recommended</span>
          </div>

          {attentionList.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              Great job! All series have regular uploads and healthy chapter counts.
            </div>
          ) : (
            <div className="space-y-3">
              {attentionList.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-red-500/30 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-14 rounded-lg bg-white/5 border border-white/10 bg-center bg-cover shrink-0"
                      style={{ backgroundImage: s.coverUrl ? `url(${s.coverUrl})` : undefined }}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white truncate max-w-[180px]">{s.title}</h3>
                      <p className="text-[11px] text-red-400 font-medium mt-0.5 line-clamp-1">
                        {s.attentionReason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/chapters/add?seriesId=${s.id}`}
                      className="px-2.5 py-1.5 rounded-xl bg-primary text-xs font-bold hover:opacity-90 transition flex items-center gap-1 shadow-md shadow-primary/20"
                    >
                      <Plus className="w-3.5 h-3.5" /> Chapter
                    </Link>
                    <button
                      onClick={() => setSelectedSeriesId(s.id)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition text-xs font-semibold"
                      title="Inspect series"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High Engagement & Top Earners */}
        <div className="glass rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.03] to-transparent">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <Flame className="w-4 h-4 text-amber-400" /> High Engagement & Growth
            </h2>
            <span className="text-[10px] text-muted-foreground">Top Performing</span>
          </div>

          <div className="space-y-3">
            {series.slice(0, 3).map((s, idx) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div
                    className="w-10 h-14 rounded-lg bg-white/5 border border-white/10 bg-center bg-cover shrink-0"
                    style={{ backgroundImage: s.coverUrl ? `url(${s.coverUrl})` : undefined }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white truncate max-w-[180px]">{s.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span className="text-amber-400 font-mono font-semibold">{s.totalViews.toLocaleString()} views</span>
                      <span>•</span>
                      <span className="text-pink-400 font-mono font-semibold">{s._count.bookmarks} saves</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-emerald-400 font-mono">{s.earnings.toLocaleString()} P</p>
                  <p className="text-[10px] text-muted-foreground">Earnings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs (Revenue & Series Views Comparison) */}
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
                <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
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
                    contentStyle={{ backgroundColor: "#111", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  />
                  <Bar dataKey="views" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#f59e0b" : "#3b82f6"} />
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

      {/* Comprehensive Series Performance Diagnostics Table */}
      <div className="glass rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold">Comprehensive Series Performance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any series row to inspect detailed metrics and retention rates.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider border-b border-white/5">
                <th className="pb-3 pr-4">Series Title</th>
                <th className="pb-3 px-4 text-center">Status</th>
                <th className="pb-3 px-4 text-center">Chapters</th>
                <th className="pb-3 px-4 text-center">Views</th>
                <th className="pb-3 px-4 text-center">Bookmarks</th>
                <th className="pb-3 px-4 text-center">Save Rate</th>
                <th className="pb-3 px-4 text-center">Earnings</th>
                <th className="pb-3 px-4 text-center">Health Status</th>
                <th className="pb-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {series.map((s) => (
                <tr
                  key={s.id}
                  className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${
                    selectedSeriesId === s.id ? "bg-primary/5 border-primary/20" : ""
                  }`}
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-14 rounded-lg bg-white/5 border border-white/10 bg-center bg-cover shrink-0"
                        style={{ backgroundImage: s.coverUrl ? `url(${s.coverUrl})` : undefined }}
                      />
                      <div>
                        <Link href={`/series/${s.slug}`} className="font-semibold hover:text-primary transition truncate block max-w-[180px]">
                          {s.title}
                        </Link>
                        <span className="text-[10px] text-muted-foreground uppercase">{s.type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-muted-foreground">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-semibold">{s._count.chapters}</td>
                  <td className="py-4 px-4 text-center font-mono font-semibold text-amber-400">
                    {s.totalViews.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-semibold text-pink-400">
                    {s._count.bookmarks}
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-semibold text-cyan-400">
                    {s.bookmarkRate}%
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-extrabold text-emerald-400">
                    {s.earnings.toLocaleString()} P
                  </td>
                  <td className="py-4 px-4 text-center">
                    {s.attentionStatus === "NEEDS_ATTENTION" ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        Needs Attention
                      </span>
                    ) : s.attentionStatus === "TRENDING" ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Trending 🔥
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Steady
                      </span>
                    )}
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <button
                      onClick={() => setSelectedSeriesId(s.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition border border-white/10"
                    >
                      Diagnose
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="py-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
