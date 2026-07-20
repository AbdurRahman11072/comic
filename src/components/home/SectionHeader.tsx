import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  viewAllHref?: string;
}

export function SectionHeader({ title, icon, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 text-lg font-bold">
        <div className="w-1 h-6 bg-primary rounded-full mr-1" />
        {icon && <span className="w-[22px] h-[22px] flex items-center justify-center text-primary">{icon}</span>}
        <span>{title}</span>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-white transition-colors duration-200"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
