"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteService } from "@/services/site.service";

/** Pulsing alert banner — mirrors .banner-alert with pulse-border animation */
export function AnnounceBanner() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await siteService.getSiteConfig();
        if (res.data && res.data.announceText) {
          setConfig(res.data);
        }
      } catch (error) {
        // silently fail
      }
    };
    fetchConfig();
  }, []);

  if (!config) return null;

  return (
    <div className="my-4 flex items-center justify-between gap-3 rounded-[20px] glass animate-pulse-border px-4 py-3.5">
      {/* Text block */}
      <div className="flex items-center gap-2.5">
        <div className="w-1 self-stretch rounded-full flex-shrink-0 bg-primary" />
        <div>
          <div className="text-[13px] font-semibold text-primary">
            {config.announceText}
          </div>
          <div className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
            Stay updated with our latest news and community events.
          </div>
        </div>
      </div>

      {/* Link CTA */}
      {config.announceLink && (
        <Link
          href={config.announceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white transition-opacity duration-200 hover:opacity-85"
          style={{ background: "var(--primary)" }}
        >
          View More
        </Link>
      )}
    </div>
  );
}
