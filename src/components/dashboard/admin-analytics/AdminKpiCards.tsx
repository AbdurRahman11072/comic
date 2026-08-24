"use client";

import React from "react";
import {
  BookOpen,
  DollarSign,
  Eye,
  Megaphone,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { AdminAnalyticsData } from "@/services/adminAnalytics.service";

interface AdminKpiCardsProps {
  kpis: AdminAnalyticsData["kpis"];
}

export function AdminKpiCards({ kpis }: AdminKpiCardsProps) {
  const cards = [
    {
      title: "Gross Revenue",
      value: `$${kpis.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      growth: kpis.revenueGrowth,
      subtitle: "Stripe & Points Sales",
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Total Readers",
      value: kpis.totalUsers.toLocaleString(),
      growth: kpis.userGrowth,
      subtitle: `${kpis.dau.toLocaleString()} DAU / ${kpis.mau.toLocaleString()} MAU`,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-500/20",
    },
    {
      title: "Total Ad Views",
      value: kpis.totalAdViews.toLocaleString(),
      subtitle: `${kpis.globalCtr}% Overall CTR`,
      icon: Megaphone,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-500/20",
    },
    {
      title: "Total Readership",
      value: kpis.totalViews.toLocaleString(),
      subtitle: `${kpis.totalChapterUnlocks.toLocaleString()} Paid Unlocks`,
      icon: Eye,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-500/20",
    },
    {
      title: "Content Catalog",
      value: `${kpis.totalSeries} Series`,
      subtitle: `${kpis.totalChapters.toLocaleString()} Total Chapters`,
      icon: BookOpen,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-500/20",
    },
    {
      title: "Creator Studios",
      value: `${kpis.totalCreators} Studios`,
      subtitle: `${kpis.activeSeries} Ongoing Titles`,
      icon: Sparkles,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      border: "border-pink-500/20",
    },
    {
      title: "Total Payouts Done",
      value: `$${kpis.totalFiatWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `$${kpis.pendingFiatLiability.toFixed(2)} Pending (${kpis.pendingWithdrawalCount})`,
      icon: Wallet,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      border: "border-orange-500/20",
    },
    {
      title: "Revenue Pool Payouts",
      value: `${kpis.totalDistributionPool.toLocaleString()} P`,
      subtitle: `${kpis.totalPointsSpentOnChapters.toLocaleString()} P Spent by Readers`,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`glass rounded-2xl p-5 border ${card.border} relative overflow-hidden group hover:scale-[1.01] transition-all`}
          >
            <div className="absolute -top-3 -right-3 opacity-[0.05] group-hover:opacity-[0.10] transition-opacity">
              <Icon className="w-24 h-24" />
            </div>

            <div className="flex items-center justify-between gap-2 mb-3">
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              {card.growth !== undefined && (
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    card.growth >= 0
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {card.growth >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {card.growth >= 0 ? `+${card.growth}%` : `${card.growth}%`}
                </span>
              )}
            </div>

            <p className="text-xl sm:text-2xl font-black text-white">{card.value}</p>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
              {card.title}
            </p>
            <p className="text-[10px] text-white/50 mt-1 truncate">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
