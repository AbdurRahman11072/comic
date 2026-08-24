"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, FileText, Lock, ShieldCheck, Wallet } from "lucide-react";
import { AdminAnalyticsData } from "@/services/adminAnalytics.service";

interface PlatformHealthAlertsProps {
  healthAlerts: AdminAnalyticsData["healthAlerts"];
}

export function PlatformHealthAlerts({ healthAlerts }: PlatformHealthAlertsProps) {
  const alerts = [
    {
      title: "Pending CashOuts",
      count: healthAlerts.pendingWithdrawals,
      amount: `$${healthAlerts.pendingWithdrawalAmount.toFixed(2)}`,
      desc: "Moderator approval needed",
      href: "/dashboard/withdrawals",
      icon: Wallet,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      title: "Pending Content Reports",
      count: healthAlerts.pendingReports,
      desc: "Flagged series & comments",
      href: "/dashboard/reports",
      icon: AlertTriangle,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      border: "border-rose-400/20",
    },
    {
      title: "Series Applications",
      count: healthAlerts.pendingApplications,
      desc: "Creator upload submissions",
      href: "/dashboard/applications",
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
    {
      title: "Frozen Accounts",
      count: healthAlerts.frozenUsers,
      desc: "Security lock active",
      href: "/dashboard/users",
      icon: Lock,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
    },
  ];

  return (
    <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Platform Moderation & Queue Pulse
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational action items requiring staff review or moderation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {alerts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`p-4 rounded-2xl bg-white/[0.02] border ${item.border} hover:scale-[1.02] transition flex items-center justify-between gap-3 group`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${item.bg}`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{item.title}</span>
                    <span className={`text-xs font-mono font-black ${item.count > 0 ? item.color : "text-muted-foreground"}`}>
                      ({item.count})
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {item.amount ? `${item.amount} • ` : ""}{item.desc}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white group-hover:translate-x-0.5 transition" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
