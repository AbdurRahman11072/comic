import type { Series } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GridCardProps {
  series: Series;
  className?: string;
}

export function GridCard({ series, className }: GridCardProps) {
  const href = `/series/${series.slug}`;
  const image = series.coverUrl;

  return (
    <Link
      href={href}
      className={cn(
        "relative block overflow-hidden rounded-[14px] cursor-pointer group",
        "bg-white/10 bg-center bg-cover",
        "transition-all duration-200 hover:-translate-y-1 hover:opacity-90",
        className
      )}
      style={{
        aspectRatio: "0.74 / 1",
        backgroundImage: `url(${image})`,
      }}
    >
      {/* Top badges */}
      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
        <span className="bg-black/55 border border-white/10 rounded px-1.5 py-px text-[10px] capitalize">
          {series.type.toLowerCase()}
        </span>
        {series.status === 'COMPLETED' && (
          <span className="bg-primary/80 border border-white/10 rounded px-1.5 py-px text-[10px] capitalize">
            Completed
          </span>
        )}
      </div>

      {/* Bottom overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/85 flex flex-col justify-end p-2.5">
        {series.discount && (
          <span className="self-start mb-1.5 bg-primary rounded-md px-2 py-px text-[11px] font-semibold border-none text-white shadow-lg shadow-primary/20">
            {series.discount} OFF
          </span>
        )}
        {series.altTitles && (
          <div className="text-[10px] opacity-65 mb-0.5 truncate">{series.altTitles}</div>
        )}
        <h3 className="text-[12px] font-bold leading-[1.25] line-clamp-2 opacity-90 group-hover:opacity-100 transition-opacity">
          {series.title}
        </h3>
      </div>
    </Link>
  );
}
