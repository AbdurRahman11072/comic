"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { adminAnalyticsService, AdminAnalyticsData } from "@/services/adminAnalytics.service";

import { AdminAnalyticsHeader } from "./AdminAnalyticsHeader";
import { AdminKpiCards } from "./AdminKpiCards";
import { RevenueCashFlowChart } from "./RevenueCashFlowChart";
import { EngagementTrafficChart } from "./EngagementTrafficChart";
import { AdNetworkPerformanceSection } from "./AdNetworkPerformanceSection";
import { ContentFormatGenreDistribution } from "./ContentFormatGenreDistribution";
import { TopSeriesLeaderboard } from "./TopSeriesLeaderboard";
import { TopCreatorsLeaderboard } from "./TopCreatorsLeaderboard";
import { PlatformHealthAlerts } from "./PlatformHealthAlerts";

interface AdminAnalyticsClientProps {
  initialData?: AdminAnalyticsData | null;
}

export function AdminAnalyticsClient({ initialData = null }: AdminAnalyticsClientProps) {
  const [data, setData] = useState<AdminAnalyticsData | null>(initialData);
  const [timeframe, setTimeframe] = useState<string>(initialData?.timeframe || "30d");
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async (tf: string) => {
    setLoading(true);
    try {
      const res = await adminAnalyticsService.getAnalytics(tf);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.message || "Failed to load platform analytics");
      }
    } catch (_err) {
      toast.error("Failed to load platform analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    fetchData(tf);
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Aggregating platform intelligence metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* 1. Header with Timeframe Toggles */}
      <AdminAnalyticsHeader
        timeframe={timeframe}
        loading={loading}
        onTimeframeChange={handleTimeframeChange}
        onRefresh={() => fetchData(timeframe)}
      />

      {/* 2. Executive KPIs (8 Metrics) */}
      <AdminKpiCards kpis={data.kpis} />

      {/* 3. Platform Health & Action Items */}
      <PlatformHealthAlerts healthAlerts={data.healthAlerts} />

      {/* 4. Financial Cash Flow & Retention Charts */}
      <div className="grid grid-cols-1 gap-6">
        <RevenueCashFlowChart data={data.revenueCashFlowChart} mounted={mounted} />
      </div>

      {/* 5. Reader Retention & Ad Delivery Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementTrafficChart
          readQualityDistribution={data.readQualityDistribution}
          mounted={mounted}
        />
        <AdNetworkPerformanceSection adNetworkStats={data.adNetworkStats} />
      </div>

      {/* 6. Content Formats & Genre Distribution */}
      <ContentFormatGenreDistribution
        contentFormatDistribution={data.contentFormatDistribution}
        genreDistribution={data.genreDistribution}
      />

      {/* 7. Top Series & Creator Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSeriesLeaderboard topSeriesList={data.topSeriesList} />
        <TopCreatorsLeaderboard topCreatorsList={data.topCreatorsList} />
      </div>
    </div>
  );
}
