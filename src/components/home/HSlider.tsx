"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HSliderProps {
  children: ReactNode;
  className?: string;
  autoSlide?: boolean;
  slideInterval?: number;
}

export function HSlider({
  children,
  className,
  autoSlide = true,
  slideInterval = 4000,
}: HSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (container) container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [children]);

  // Auto-slide effect
  useEffect(() => {
    if (!autoSlide || isPaused) return;

    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      const cardWidth = clientWidth > 640 ? 340 : 280;

      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        containerRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        containerRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, isPaused, slideInterval]);

  const handleScroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const cardWidth = containerRef.current.clientWidth > 640 ? 340 : 280;
    containerRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="relative group -mx-4 px-4 pb-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className={cn(
          "flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 select-none",
          className
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {/* Navigation Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center text-white shadow-xl hover:scale-110 hover:bg-primary/80 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center text-white shadow-xl hover:scale-110 hover:bg-primary/80 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
