"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    label: "All Series ✓",
    icon: (
      <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    label: "Free Series",
    icon: (
      <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    label: "Action",
    icon: (
      <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    label: "Romance",
    icon: (
      <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

interface FilterTabsProps {
  onFilter?: (label: string) => void;
}

/** FilterTabs — pill tabs for filtering latest updates */
export function FilterTabs({ onFilter }: FilterTabsProps) {
  const [active, setActive] = useState(0);

  const handleClick = (i: number) => {
    setActive(i);
    onFilter?.(TABS[i].label);
  };

  return (
    <div className="flex gap-1.5 flex-wrap mb-4">
      {TABS.map((tab, i) => (
        <button
          key={tab.label}
          onClick={() => handleClick(i)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium border transition-all duration-200",
            "glass",
            i === active
              ? "bg-primary border-primary/50 text-white"
              : "glass glass-hover text-muted-foreground hover:text-white"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
