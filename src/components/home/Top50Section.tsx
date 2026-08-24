"use client";

import { useEffect, useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  LayoutGrid,
  ListOrdered,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperCore } from "swiper";
import { seriesService } from "@/services/series.service";
import { Top50RankCard } from "./Top50RankCard";
import { type Series } from "@/types";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type TimeframePeriod = "today" | "weekly" | "monthly";

export function Top50Section() {
  const [period, setPeriod] = useState<TimeframePeriod>("today");
  const [seriesList, setSeriesList] = useState<Array<Series & { rank?: number; periodViews?: number }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"slider" | "grid">("slider");
  const [activeTier, setActiveTier] = useState<number>(0); // 0 = 1-10, 1 = 11-20, etc.
  const swiperRef = useRef<SwiperCore | null>(null);

  const fetchTop50 = async (tf: TimeframePeriod) => {
    setLoading(true);
    try {
      const res = await seriesService.getTop50Series(tf);
      if (res.success && res.data) {
        setSeriesList(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch top 50 series:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTop50(period);
  }, [period]);

  const handlePeriodChange = (newPeriod: TimeframePeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  };

  const periodLabels = {
    today: "Today's Reads",
    weekly: "This Week's Reads",
    monthly: "This Month's Reads",
  };

  const tierRanges = [
    { label: "Top 1-10", startIndex: 0 },
    { label: "11 - 20", startIndex: 10 },
    { label: "21 - 30", startIndex: 20 },
    { label: "31 - 40", startIndex: 30 },
    { label: "41 - 50", startIndex: 40 },
  ];

  const handleTierJump = (startIndex: number, tierIdx: number) => {
    setActiveTier(tierIdx);
    if (swiperRef.current) {
      swiperRef.current.slideTo(startIndex);
    }
  };

  return (
    <section className="mt-12 relative w-full" id="top-50-leaderboard">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" /> Platform Leaderboard
            </span>
            <span className="text-[11px] text-white/50 font-medium">Ranked #1 through #50</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            Top 50 Most Popular Series
          </h2>
        </div>

        {/* Controls: Timeframe Selector & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Switcher Tabs */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1 shadow-inner">
            <button
              onClick={() => handlePeriodChange("today")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                period === "today"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
            <button
              onClick={() => handlePeriodChange("weekly")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                period === "weekly"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Weekly</span>
            </button>
            <button
              onClick={() => handlePeriodChange("monthly")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                period === "monthly"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Monthly</span>
            </button>
          </div>

          {/* Slider / Grid View Toggle */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("slider")}
              className={`p-2 rounded-lg text-xs transition cursor-pointer ${
                viewMode === "slider"
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:text-white"
              }`}
              title="Carousel Slide View"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg text-xs transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:text-white"
              }`}
              title="Expanded Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Slider Prev / Next Navigation Buttons (Only visible in slider mode) */}
          {viewMode === "slider" && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="p-2 rounded-xl glass hover:bg-white/10 text-white transition cursor-pointer"
                title="Slide Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="p-2 rounded-xl glass hover:bg-white/10 text-white transition cursor-pointer"
                title="Slide Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tier Fast-Jump Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-1">
          Jump:
        </span>
        {tierRanges.map((tier, idx) => (
          <button
            key={tier.label}
            onClick={() => handleTierJump(tier.startIndex, idx)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition cursor-pointer ${
              activeTier === idx && viewMode === "slider"
                ? "bg-white/15 text-white border border-white/20"
                : "bg-white/[0.03] text-muted-foreground hover:text-white border border-white/5"
            }`}
          >
            {tier.label}
          </button>
        ))}
      </div>

      {/* Content Rendering: Loading Skeleton, Swiper Auto-Slider, or Expanded Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[0.74/1] rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : seriesList.length === 0 ? (
        <div className="py-16 text-center glass rounded-2xl border border-white/5 text-muted-foreground text-sm">
          No series views recorded for this period yet.
        </div>
      ) : viewMode === "slider" ? (
        /* --- AUTO-SLIDE & INTERACTIVE CAROUSEL --- */
        <div className="relative group/swiper">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => {
              const currentIdx = swiper.activeIndex;
              setActiveTier(Math.floor(currentIdx / 10));
            }}
            spaceBetween={12}
            slidesPerView={2}
            speed={600}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 14 },
              768: { slidesPerView: 4, spaceBetween: 14 },
              1024: { slidesPerView: 5, spaceBetween: 16 },
              1280: { slidesPerView: 5, spaceBetween: 16 },
            }}
            className="w-full !pb-2"
          >
            {seriesList.map((series) => (
              <SwiperSlide key={series.id} className="!h-auto">
                <Top50RankCard series={series} periodLabel={periodLabels[period]} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        /* --- EXPANDED FULL 50 GRID VIEW --- */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 animate-in fade-in duration-300">
          {seriesList.map((series) => (
            <Top50RankCard key={series.id} series={series} periodLabel={periodLabels[period]} />
          ))}
        </div>
      )}
    </section>
  );
}
