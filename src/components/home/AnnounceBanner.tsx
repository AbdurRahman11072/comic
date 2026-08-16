"use client";

import Link from "next/link";
import { useGetSiteConfigQuery } from "@/redux/api/siteConfigApi";
import { Megaphone, AlertTriangle, ArrowRight } from "lucide-react";

export function AnnounceBanner() {
  const { data: configRes } = useGetSiteConfigQuery();
  const config = configRes?.data;

  // If maintenance mode is active, display a maintenance notice banner
  if (config?.isMaintenanceMode) {
    return (
      <div className="my-4 flex items-center justify-between gap-3 rounded-2xl p-4 bg-red-500/10 border border-red-500/20 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-red-400">Scheduled Maintenance in Progress</div>
            <p className="text-xs text-white/70 mt-0.5">
              {config.maintenanceMessage || "We are performing background database optimizations. Reading is uninterrupted!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!config?.announceText || !config.announceText.trim()) return null;

  return (
    <div className="my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl glass p-4 border border-primary/30 relative overflow-hidden group">
      <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />

      {/* Text block */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
          <Megaphone className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">
            {config.announceText}
          </div>
          <div className="text-xs text-white/60 mt-0.5">
            {config.appTagline || "Stay updated with our latest news and community events."}
          </div>
        </div>
      </div>

      {/* Link CTA */}
      {config.announceLink && (
        <Link
          href={config.announceLink}
          target={config.announceLink.startsWith("http") ? "_blank" : undefined}
          rel={config.announceLink.startsWith("http") ? "noopener noreferrer" : undefined}
          className="relative z-10 flex-shrink-0 flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white transition hover:opacity-90 bg-primary shadow-md shadow-primary/20 self-start sm:self-auto"
        >
          <span>View More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
