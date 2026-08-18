"use client";

import { useEffect, useState } from "react";
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
  AlertTriangle,
  Flame,
  CheckCircle2,
  Lightbulb,
  ArrowLeft,
  Edit2,
  Plus,
  Lock,
  Unlock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

interface ChapterStat {
  id: string;
  number: number;
  title: string | null;
  isLocked: boolean;
  coinCost: number;
  createdAt: string;
  unlocksCount: number;
  earnings: number;
  commentsCount: number;
  readersCount: number;
}

interface SingleSeriesAnalyticsData {
  series: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    bgUrl: string | null;
    type: string;
    status: string;
    totalViews: number;
    rating: number;
    genres: string[];
    createdAt: string;
    updatedAt: string;
    creator?: {
      id: string;
      name: string;
      image?: string | null;
    } | null;
    chaptersCount: number;
    bookmarksCount: number;
    reviewsCount: number;
  };
  metrics: {
    totalViews: number;
    totalChapters: number;
    totalBookmarks: number;
    bookmarkRate: number;
    totalEarnings: number;
    daysSinceUpdate: number;
    attentionStatus: "TRENDING" | "STEADY" | "NEEDS_ATTENTION" | "NEW";
    recommendations: string[];
  };
  chapters: ChapterStat[];
  revenueChart: { date: string; points: number }[];
  recentReviews: {
    id: string;
    rating: number;
    content: string | null;
    createdAt: string;
    user: { id: string; name: string; image?: string | null };
  }[];
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

export default function SeriesAnalyticsPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { data: session } = authClient.useSession();

  const [data, setData] = useState<SingleSeriesAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/v1/creators/series/${id}/analytics`);
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setError(res.data?.message || "Failed to load series analytics");
        }
      } catch (err: any) {
        console.error("Error loading series analytics", err);
        setError(err.response?.data?.message || "Series analytics not found or unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-36 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Calculating series performance metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-24 space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">{error || "Series Analytics Unavailable"}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We could not load the analytics report for this series. Please verify that this series belongs to your account.
        </p>
        <Link href="/dashboard/series">
          <button className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-sm transition">
            ← Return to Series Management
          </button>
        </Link>
      </div>
    );
  }

  const { series, metrics, chapters, revenueChart, recentReviews } = data;

  // Chart data for chapters performance comparison
  const chapterChartData = chapters.map((c) => ({
    name: `Ch. ${c.number}`,
    unlocks: c.unlocksCount,
    earnings: c.earnings,
    readers: c.readersCount,
  }));

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/series"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Series Management
        </Link>
      </div>

      {/* Series Hero Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-primary/10 border border-white/10 p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div
              className="w-20 h-28 rounded-2xl bg-white/10 border border-white/10 bg-center bg-cover shrink-0 shadow-2xl"
              style={{ backgroundImage: series.coverUrl ? `url(${series.coverUrl})` : undefined }}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-white/10 text-white">
                  {series.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {series.status}
                </span>
                {metrics.attentionStatus === "NEEDS_ATTENTION" ? (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention
                  </span>
                ) : metrics.attentionStatus === "TRENDING" ? (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Flame className="w-3.5 h-3.5" /> High Engagement 🔥
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Steady Growth
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{series.title}</h1>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 flex-wrap">
                <span>Updated {metrics.daysSinceUpdate} days ago</span>
                <span>•</span>
                <span>Created {new Date(series.createdAt).toLocaleDateString()}</span>
                {series.genres.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-primary/90">{series.genres.join(", ")}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
            <Link href={`/dashboard/chapters/add?seriesId=${series.id}`}>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-primary rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition">
                <Plus className="w-3.5 h-3.5" /> Add Chapter
              </button>
            </Link>
            <Link href={`/dashboard/series/edit/${series.id}`}>
              <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </Link>
            <Link href={`/series/${series.slug}`} target="_blank">
              <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition">
                <ExternalLink className="w-3.5 h-3.5" /> View Public
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Actionable Health Diagnostic Box */}
      <div className={`rounded-3xl p-6 border backdrop-blur-md ${
        metrics.attentionStatus === "NEEDS_ATTENTION"
          ? "bg-red-500/[0.04] border-red-500/30"
          : metrics.attentionStatus === "TRENDING"
          ? "bg-amber-500/[0.04] border-amber-500/30"
          : "bg-emerald-500/[0.04] border-emerald-500/30"
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${
            metrics.attentionStatus === "NEEDS_ATTENTION"
              ? "bg-red-500/20 text-red-400"
              : metrics.attentionStatus === "TRENDING"
              ? "bg-amber-500/20 text-amber-400"
              : "bg-emerald-500/20 text-emerald-400"
          }`}>
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Series Engagement Diagnostics & Growth Plan
            </h3>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {metrics.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <p className="text-white/90 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Series Core KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Views", value: metrics.totalViews.toLocaleString(), icon: Eye, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Chapters", value: metrics.totalChapters, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Bookmarks", value: metrics.totalBookmarks, icon: Heart, color: "text-pink-400", bg: "bg-pink-400/10" },
          { label: "Save Rate", value: `${metrics.bookmarkRate}%`, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-400/10" },
          { label: "Reader Rating", value: `${series.rating.toFixed(1)} ★`, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Total Earnings", value: `${metrics.totalEarnings.toLocaleString()} P`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg"
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

      {/* Visual Analytics Graphs for this series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Points Revenue Area Chart */}
        <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 text-white">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> 30-Day Revenue Trend
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Points generated from unlockable chapters of this series.
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSeriesRev" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#colorSeriesRev)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-white/5 animate-pulse rounded-xl" />
            )}
          </div>
        </div>

        {/* Chapter Unlocks & Engagement Bar Chart */}
        <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 text-white">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Chapter Unlocks & Engagement
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Reader purchase activity per chapter.
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            {mounted && chapterChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chapterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Bar dataKey="unlocks" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                    {chapterChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.unlocks > 0 ? "#10b981" : "#3b82f6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                No chapter purchase activity yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapter-by-Chapter Performance Table */}
      <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Chapter Performance & Monetization</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Breakdown of unlocks, earnings, and reader comments per chapter.
            </p>
          </div>
          <Link href={`/dashboard/chapters/add?seriesId=${series.id}`}>
            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1.5 transition">
              <Plus className="w-3.5 h-3.5" /> Upload Chapter
            </button>
          </Link>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No chapters uploaded yet for this series.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="pb-3 pr-4">Chapter</th>
                  <th className="pb-3 px-4 text-center">Type & Pricing</th>
                  <th className="pb-3 px-4 text-center">Paid Unlocks</th>
                  <th className="pb-3 px-4 text-center">Revenue</th>
                  <th className="pb-3 px-4 text-center">Comments</th>
                  <th className="pb-3 px-4 text-center">Release Date</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-white">Chapter {c.number}</div>
                      {c.title && <span className="text-xs text-muted-foreground truncate block">{c.title}</span>}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {c.isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Lock className="w-3 h-3" /> {c.coinCost} Pts
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Unlock className="w-3 h-3" /> Free
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-semibold text-cyan-400">
                      {c.unlocksCount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-extrabold text-emerald-400">
                      {c.earnings.toLocaleString()} P
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-muted-foreground">
                      {c.commentsCount}
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-muted-foreground font-mono">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <Link
                        href={`/series/${series.slug}/chapter-${c.number}`}
                        target="_blank"
                        className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition inline-block mr-1"
                        title="Read Chapter"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/chapters/edit/${c.id}`}
                        className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition inline-block"
                        title="Edit Chapter"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reader Reviews & Sentiment */}
      {recentReviews.length > 0 && (
        <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Recent Reader Reviews ({series.reviewsCount})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentReviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                      {rev.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-white">{rev.user.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < rev.rating ? "fill-yellow-400" : "opacity-20"}`}
                      />
                    ))}
                  </div>
                </div>
                {rev.content && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    "{rev.content}"
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground/60 font-mono">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
