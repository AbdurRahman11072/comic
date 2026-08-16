"use client";

import { useEffect, useRef } from "react";
import { useGetAdByPlacementQuery, useRecordAdImpressionMutation, useRecordAdClickMutation } from "@/redux/api/adApi";
import { ExternalLink, Sparkles } from "lucide-react";

interface AdBannerProps {
  placement: "home_top" | "home_bottom" | "reader_bottom" | "browse_banner" | string;
  className?: string;
  slotName?: string;
}

export function AdBanner({ placement, className = "", slotName }: AdBannerProps) {
  const { data: adRes, isLoading } = useGetAdByPlacementQuery(placement);
  const [recordImpression] = useRecordAdImpressionMutation();
  const [recordClick] = useRecordAdClickMutation();
  const impressionRecorded = useRef(false);

  const ad = adRes?.data;

  // Track impression once on mount when ad is loaded
  useEffect(() => {
    if (ad?.id && !impressionRecorded.current) {
      impressionRecorded.current = true;
      recordImpression(ad.id).catch(() => null);
    }
  }, [ad?.id, recordImpression]);

  // Handle AdSense script push
  useEffect(() => {
    if (ad?.provider === "ADSENSE" && typeof window !== "undefined") {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense push error", e);
      }
    }
  }, [ad]);

  if (isLoading || !ad) {
    return null;
  }

  // 1. GOOGLE ADSENSE (WEB)
  if (ad.provider === "ADSENSE" && (ad.adSlotId || ad.adClient)) {
    return (
      <div className={`w-full overflow-hidden flex flex-col items-center justify-center my-4 py-2 ${className}`}>
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1">
          Advertisement
        </span>
        <div className="w-full flex justify-center min-h-[90px] bg-white/[0.02] border border-white/5 rounded-2xl p-2 overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: "block", textAlign: "center" }}
            data-ad-client={ad.adClient || "ca-pub-XXXXXXXXXX"}
            data-ad-slot={ad.adSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // 2. CUSTOM DIRECT SPONSOR / BANNER
  if (ad.imageUrl) {
    return (
      <div className={`w-full overflow-hidden my-4 ${className}`}>
        <div className="relative group rounded-2xl overflow-hidden glass border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-lg shadow-black/20">
          <a
            href={ad.linkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (ad.id) recordClick(ad.id).catch(() => null);
            }}
            className="block relative w-full h-24 sm:h-28 overflow-hidden"
          >
            {/* Background cover image */}
            <img
              src={ad.imageUrl}
              alt={ad.title || "Sponsored"}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />

            {/* Ambient gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-4 sm:p-6 justify-between">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> SPONSORED
                  </span>
                  {ad.title && (
                    <span className="text-white font-bold text-sm sm:text-base drop-shadow-md truncate">
                      {ad.title}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/80 line-clamp-1">
                  Click to explore exclusive perks and offers.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 group-hover:bg-primary text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all">
                <span>Visit Sponsor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>
        </div>
      </div>
    );
  }

  return null;
}
