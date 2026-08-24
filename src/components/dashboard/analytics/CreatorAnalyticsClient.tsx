"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BarChart3, Filter } from "lucide-react";
import { AnalyticsData } from "@/services/creator.service";

import { AnalyticsOverviewCards } from "./AnalyticsOverviewCards";
import { SeriesSpotlightBanner } from "./SeriesSpotlightBanner";
import { AttentionAndEngagementCards } from "./AttentionAndEngagementCards";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { SeriesPerformanceTable } from "./SeriesPerformanceTable";

interface CreatorAnalyticsClientProps {
  initialData?: AnalyticsData | null;
}

export function CreatorAnalyticsClient({
  initialData = null,
}: CreatorAnalyticsClientProps) {
  const searchParams = useSearchParams();
  const initialSeriesId = searchParams.get("seriesId") || "ALL";

  const [data] = useState<AnalyticsData | null>(initialData);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(initialSeriesId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const querySeriesId = searchParams.get("seriesId");
    if (querySeriesId) {
      setSelectedSeriesId(querySeriesId);
    }
  }, [searchParams]);

  const selectedSeries = useMemo(() => {
    if (!data?.series || selectedSeriesId === "ALL") return null;
    return data.series.find((s) => s.id === selectedSeriesId) || null;
  }, [data, selectedSeriesId]);

  if (!data || data.series.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-muted-foreground">
          <BarChart3 className="w-8 h-8 opacity-40" />
        </div>
        <h2 className="text-xl font-bold">No Analytics Data Yet</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Publish your first series and start uploading chapters to view engagement graphs, views,
          and revenue diagnostics.
        </p>
        <Link href="/dashboard/series/add">
          <button className="px-5 py-2.5 bg-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition cursor-pointer">
            Add New Series
          </button>
        </Link>
      </div>
    );
  }

  const { overview, series, revenueChart } = data;

  // Compute needs-attention list
  const attentionList = series.filter((s: any) => s.attentionStatus === "NEEDS_ATTENTION");

  // Chart data for comparing series views
  const comparisonData = series.map((s: any) => ({
    name: s.title.length > 15 ? s.title.slice(0, 15) + "..." : s.title,
    views: s.totalViews || s.views || 0,
    bookmarks: s._count?.bookmarks || s.likesCount || 0,
    earnings: s.earnings || 0,
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
                {s.title} ({(s.totalViews || (s as any).views || 0).toLocaleString()} views)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Series Spotlight / Alert Banner */}
      <SeriesSpotlightBanner selectedSeries={selectedSeries} />

      {/* Overview Stats Cards */}
      <AnalyticsOverviewCards selectedSeries={selectedSeries} overview={overview} />

      {/* Engagement & Action Alert Grids */}
      <AttentionAndEngagementCards
        attentionList={attentionList}
        topSeries={series}
        onSelectSeries={setSelectedSeriesId}
      />

      {/* Visual Analytics Graphs (Revenue & Series Views Comparison) */}
      <AnalyticsCharts
        mounted={mounted}
        revenueChart={revenueChart}
        comparisonData={comparisonData}
      />

      {/* Comprehensive Series Performance Diagnostics Table */}
      <SeriesPerformanceTable
        series={series}
        selectedSeriesId={selectedSeriesId}
        onSelectSeries={setSelectedSeriesId}
      />
    </div>
  );
}
