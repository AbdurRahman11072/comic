"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface HSliderProps {
  children: ReactNode;
  className?: string;
}

/** Horizontal drag container using framer-motion */
export function HSlider({ children, className }: HSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (!scrollRef.current) return;
    
    const updateConstraints = () => {
      if (!scrollRef.current) return;
      const scrollWidth = scrollRef.current.scrollWidth;
      const offsetWidth = scrollRef.current.offsetWidth;
      setConstraints({ left: -(scrollWidth - offsetWidth), right: 0 });
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [children]);

  return (
    <div className="overflow-hidden -mx-4 px-4 pb-1 cursor-grab active:cursor-grabbing">
      <motion.div
        ref={scrollRef}
        drag="x"
        dragConstraints={constraints}
        dragElastic={0.1}
        className={cn(
          "flex gap-3 w-max",
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
