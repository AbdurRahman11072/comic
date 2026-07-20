"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteService } from "@/services/site.service";

const DiscordSVG = () => (
  <svg viewBox="0 0 24 24" width="14" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
  </svg>
);

const ReportSVG = () => (
  <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);

/**
 * SocialRow — two cards side-by-side (or stacked on mobile):
 * 1. "Facing an Issue?" → Report
 * 2. "Join Our Socials"  → Discord
 */
export function SocialRow() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await siteService.getSiteConfig();
        if (res.data) setConfig(res.data);
      } catch (error) {
        // silently fail
      }
    };
    fetchConfig();
  }, []);

  const discordUrl = config?.discord || "https://discord.gg/4y2WknskQ7";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
      {/* Report card */}
      <div className="flex items-center justify-between gap-3 rounded-[20px] glass glass-hover px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 self-stretch rounded-full bg-white/20" />
          <div>
            <div className="text-[13px] font-semibold">Facing an Issue?</div>
            <div className="text-[11px] text-muted-foreground">Let us know, and we'll help ASAP</div>
          </div>
        </div>
        <button
          id="reportBtn"
          className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold text-white transition-opacity duration-200 hover:opacity-80 bg-primary"
        >
          <ReportSVG />
          Report
        </button>
      </div>

      {/* Discord card */}
      <div className="flex items-center justify-between gap-3 rounded-[20px] glass glass-hover px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 self-stretch rounded-full bg-white/20" />
          <div>
            <div className="text-[13px] font-semibold">Join Our Socials</div>
            <div className="text-[11px] text-muted-foreground">to explore more</div>
          </div>
        </div>
        <Link
          href={discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold text-white transition-opacity duration-200 hover:opacity-80 bg-[#5865F2]"
        >
          <DiscordSVG />
          Discord
        </Link>
      </div>
    </div>
  );
}
