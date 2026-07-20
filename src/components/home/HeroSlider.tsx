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
    return <div className="w-full aspect-[21/9] sm:aspect-[21/7] rounded-[2rem] bg-white/5 animate-pulse mb-8" />;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] rounded-[2rem] overflow-hidden group mb-8 shadow-2xl">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: true, // Stop auto-slide if user interacts (as requested)
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
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1"
                >
                  <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-primary/30">
                    Featured Series
                  </span>
                  <h2 className="text-3xl md:text-5xl font-heading tracking-tight text-white line-clamp-1">
                    {item.title}
                  </h2>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-4"
                >
                  <div className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm shadow-xl hover:scale-105 transition-transform active:scale-95">
                    Read Now
                  </div>
                  <div className="px-6 py-2.5 rounded-full glass border-white/20 text-white font-bold text-sm shadow-xl hover:bg-white/10 transition-all">
                    Add to Library
                  </div>
                </motion.div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination container */}
      <div className="hero-pagination absolute bottom-6 right-8 flex gap-2 z-20 !w-auto" />

      <style jsx global>{`
        .hero-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
          border-radius: 99px;
          transition: all 0.3s ease;
        }
        .hero-pagination .swiper-pagination-bullet-active {
          width: 32px;
          background: var(--primary);
        }
      `}</style>
    </div>
  );
}
