"use client";

import React from "react";
import {
  BarChart3,
  DollarSign,
  FileText,
  Megaphone,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

export type SettingsTabId =
  | "system"
  | "branding"
  | "announcement"
  | "socials"
  | "economy"
  | "seo"
  | "mobile"
  | "legal";

interface SettingsTabNavProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

export function SettingsTabNav({ activeTab, onTabChange }: SettingsTabNavProps) {
  const tabs = [
    { id: "system" as const, label: "System & Toggles", icon: ShieldCheck },
    { id: "branding" as const, label: "Branding & Hero", icon: Sparkles },
    { id: "announcement" as const, label: "Announcement Bar", icon: Megaphone },
    { id: "socials" as const, label: "Social Channels", icon: Share2 },
    { id: "economy" as const, label: "Economy & Payouts", icon: DollarSign },
    { id: "seo" as const, label: "SEO & Analytics", icon: BarChart3 },
    { id: "mobile" as const, label: "Mobile Apps", icon: Smartphone },
    { id: "legal" as const, label: "Legal Docs", icon: FileText },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              isActive
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "glass glass-hover text-white/70 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" /> {tab.label}
          </button>
        );
      })}
    </div>
  );
}
