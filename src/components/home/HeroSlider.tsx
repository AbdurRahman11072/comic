"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { seriesService } from "@/services/series.service";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export function HeroSlider() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await seriesService.getFeaturedSeries();
        const dataArr = res?.data ?? [];
        if (dataArr.length > 0) {
          const mapped = dataArr.map((item: any) => ({
            id: item.series?.id ?? item.id,
            image: item.series?.bgUrl || item.series?.coverUrl,
            title: item.series?.title ?? 'Untitled',
            href: `/series/${item.series?.slug ?? '#'}`
          }));
          setItems(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch featured series for slider:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return <div className="w-full min-h-[210px] sm:min-h-[280px] md:min-h-[340px] aspect-[16/9] sm:aspect-[21/8] md:aspect-[21/7] rounded-2xl sm:rounded-[2rem] bg-white/5 animate-pulse mb-6 sm:mb-8" />;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full min-h-[210px] sm:min-h-[280px] md:min-h-[340px] aspect-[16/9] sm:aspect-[21/8] md:aspect-[21/7] rounded-2xl sm:rounded-[2rem] overflow-hidden group mb-6 sm:mb-8 shadow-2xl border border-white/5">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: true,
        }}
        pagination={{
          clickable: true,
          el: '.hero-pagination',
        }}
        loop={items.length > 1}
        className="w-full h-full"
      >
        {items.map((item, idx) => (
          <SwiperSlide key={`${item.id}-${idx}`}>
            <Link href={item.href} className="block w-full h-full relative">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] group-hover:scale-105"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              {/* Responsive dark gradient overlays for high legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
              
              <div className="absolute bottom-3 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6 md:bottom-8 md:left-8 md:right-8 space-y-2 sm:space-y-3 md:space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-1 sm:space-y-1.5"
                >
                  <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary text-white text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase shadow-lg shadow-primary/30">
                    Featured Series
                  </span>
                  <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white line-clamp-1 drop-shadow-md">
                    {item.title}
                  </h2>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  <div className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm shadow-xl hover:scale-105 transition-transform active:scale-95 flex items-center justify-center">
                    Read Now
                  </div>
                  <div className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full glass border border-white/20 text-white font-bold text-xs sm:text-sm shadow-xl hover:bg-white/10 transition-all flex items-center justify-center">
                    Add to Library
                  </div>
                </motion.div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination container */}
      <div className="hero-pagination absolute bottom-3.5 right-4 sm:bottom-6 sm:right-8 flex gap-1.5 sm:gap-2 z-20 !w-auto" />

      <style jsx global>{`
        .hero-pagination .swiper-pagination-bullet {
          width: 6px;
          height: 5px;
          background: rgba(255, 255, 255, 0.4);
          opacity: 1;
          border-radius: 99px;
          transition: all 0.3s ease;
        }
        @media (min-width: 640px) {
          .hero-pagination .swiper-pagination-bullet {
            width: 8px;
            height: 6px;
          }
        }
        .hero-pagination .swiper-pagination-bullet-active {
          width: 20px;
          background: var(--primary);
        }
        @media (min-width: 640px) {
          .hero-pagination .swiper-pagination-bullet-active {
            width: 32px;
          }
        }
      `}</style>
    </div>
  );
}
