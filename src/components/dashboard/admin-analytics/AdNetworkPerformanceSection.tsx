"use client";

import React from "react";
import { Globe, Megaphone, Smartphone, Sparkles } from "lucide-react";

interface AdNetworkPerformanceSectionProps {
  adNetworkStats: Array<{
    provider: string;
    impressions: number;
    clicks: number;
    units: number;
    ctr: number;
  }>;
}

export function AdNetworkPerformanceSection({
  adNetworkStats,
}: AdNetworkPerformanceSectionProps) {
  const getProviderIcon = (name: string) => {
    if (name.includes("AdSense")) return <Globe className="w-4 h-4 text-blue-400" />;
    if (name.includes("AdMob")) return <Smartphone className="w-4 h-4 text-yellow-400" />;
    return <Sparkles className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
      <div>
        <h2 className="text-base font-bold flex items-center gap-2 text-white">
          <Megaphone className="w-5 h-5 text-amber-400" /> Ad Network Monetization & Delivery
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Delivery performance, impression yield, and click-through rates by advertising provider.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {adNetworkStats.map((item) => (
          <div
            key={item.provider}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  {getProviderIcon(item.provider)}
                </div>
                <span className="text-xs font-bold text-white truncate">{item.provider}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded-md">
                {item.units} slots
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Impressions</p>
                <p className="text-sm font-extrabold text-white font-mono mt-0.5">
                  {item.impressions.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Clicks</p>
                <p className="text-sm font-extrabold text-amber-400 font-mono mt-0.5">
                  {item.clicks.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Click-Through Rate (CTR):</span>
              <span className="font-bold text-emerald-400 font-mono">{item.ctr}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
