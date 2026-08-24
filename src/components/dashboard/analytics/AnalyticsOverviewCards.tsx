"use client";

import React from "react";
import {
  BookOpen,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react";

interface AnalyticsOverviewCardsProps {
  selectedSeries: any;
  overview: any;
}

export function AnalyticsOverviewCards({
  selectedSeries,
  overview,
}: AnalyticsOverviewCardsProps) {
  const statsList = [
    {
      label: selectedSeries ? "Chapters" : "Series",
      value: selectedSeries
        ? (selectedSeries._count?.chapters ?? selectedSeries.chaptersCount ?? 0)
        : overview.totalSeries,
      icon: BookOpen,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Total Views",
      value: selectedSeries
        ? (selectedSeries.totalViews ?? selectedSeries.views ?? 0).toLocaleString()
        : overview.totalViews.toLocaleString(),
      icon: Eye,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Bookmarks",
      value: selectedSeries
        ? (selectedSeries._count?.bookmarks ?? selectedSeries.likesCount ?? 0)
        : (overview.totalBookmarks ?? overview.totalLikes),
      icon: Heart,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
    },
    {
      label: selectedSeries ? "Save Rate" : "Total Reviews",
      value: selectedSeries
        ? `${selectedSeries.bookmarkRate ?? 0}%`
        : (overview.totalReviews ?? overview.totalComments),
      icon: selectedSeries ? TrendingUp : MessageSquare,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      label: "Rating",
      value: selectedSeries
        ? `${selectedSeries.rating.toFixed(1)} ★`
        : `${overview.averageRating ? overview.averageRating.toFixed(1) : "4.8"} ★`,
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: "Earnings",
      value: `${(
        selectedSeries
          ? selectedSeries.earnings
          : (overview.totalEarnings ?? overview.totalRevenue ?? 0)
      ).toLocaleString()} P`,
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsList.map((stat) => {
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
  );
}
