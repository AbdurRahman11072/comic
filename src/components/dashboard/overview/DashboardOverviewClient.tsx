"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { OverviewCharts } from "@/components/dashboard/OverviewCharts";
import { StatCard } from "@/components/dashboard/StatCard";
import { authClient } from "@/lib/auth-client";
import { DashboardStatsResponse } from "@/services/stats.service";
import {
    ArrowUpRight,
    Bookmark,
    BookOpen,
    DollarSign,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react";
import Link from "next/link";

interface DashboardOverviewClientProps {
  initialStats?: DashboardStatsResponse | null;
  userName?: string;
  userRole?: string;
}

export function DashboardOverviewClient({
  initialStats = null,
  userName = "User",
  userRole = "user",
}: DashboardOverviewClientProps) {
  const { data: session } = authClient.useSession();
  const stats = initialStats;

  const currentRole = (session?.user as any)?.role || userRole;
  const isCreatorScope = stats?.scope === "CREATOR" || currentRole === "creator";
  const displayName = session?.user?.name || userName;

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "0";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "$0";
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-10">
      {/* Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isCreatorScope ? "Creator Overview" : "System Overview"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isCreatorScope
              ? `Welcome back, ${displayName}. Here is your live series and performance analytics.`
              : `Welcome back, ${displayName}. Here's what's happening with Comic BD today.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Live Systems
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isCreatorScope ? (
          <>
            <StatCard
              label="Total Series"
              value={formatNumber(stats?.overview.totalSeries)}
              change={`${stats?.overview.seriesGrowth || 0}%`}
              isPositive={(stats?.overview.seriesGrowth ?? 0) >= 0}
              icon={BookOpen}
              color="purple"
            />
            <StatCard
              label="Total Views"
              value={formatNumber(stats?.overview.totalViews)}
              change={`${stats?.overview.viewsGrowth || 12}%`}
              isPositive
              icon={TrendingUp}
              color="primary"
            />
            <StatCard
              label="Total Bookmarks"
              value={formatNumber(stats?.overview.totalBookmarks)}
              change="Active"
              isPositive
              icon={Bookmark}
              color="blue"
            />
            <StatCard
              label="Total Earnings"
              value={`${formatNumber(stats?.overview.totalRevenue)} pts`}
              change={`${stats?.overview.revenueGrowth || 8}%`}
              isPositive
              icon={DollarSign}
              color="green"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Total Users"
              value={formatNumber(stats?.overview.totalUsers)}
              change={`${stats?.overview.userGrowth || 0}%`}
              isPositive={(stats?.overview.userGrowth ?? 0) >= 0}
              icon={Users}
              color="blue"
            />
            <StatCard
              label="Active Series"
              value={formatNumber(stats?.overview.activeSeries || stats?.overview.totalSeries)}
              change={`${stats?.overview.seriesGrowth || 0}%`}
              isPositive={(stats?.overview.seriesGrowth ?? 0) >= 0}
              icon={BookOpen}
              color="purple"
            />
            <StatCard
              label="Total Views"
              value={formatNumber(stats?.overview.totalViews)}
              change={`${stats?.overview.viewsGrowth || 8.5}%`}
              isPositive
              icon={TrendingUp}
              color="primary"
            />
            <StatCard
              label="Net Revenue"
              value={formatCurrency(stats?.overview.netRevenue)}
              change={`${stats?.overview.revenueGrowth || 0}%`}
              isPositive={(stats?.overview.revenueGrowth ?? 0) >= 0}
              icon={DollarSign}
              color="green"
            />
          </>
        )}
      </div>

      {/* Dynamic Live Charts */}
      <OverviewCharts
        revenueData={stats?.revenueChart}
        distributionData={stats?.contentDistribution}
        currencySymbol={isCreatorScope ? "" : "$"}
      />

      {/* Recent Activity / Reports Section */}
      {!isCreatorScope && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Urgent Reports</h3>
            <Link
              href="/dashboard/reports"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View all reports <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <DataTable
            data={stats?.recentReports || []}
            columns={[
              { header: "User", accessor: "user" },
              { header: "Type", accessor: "type" },
              { header: "Subject", accessor: "subject" },
              {
                header: "Status",
                accessor: (item) => (
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.status === "Resolved"
                        ? "bg-green-500/10 text-green-500"
                        : item.status === "Pending"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {item.status}
                  </span>
                ),
              },
              { header: "Date", accessor: "date", className: "text-muted-foreground" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
