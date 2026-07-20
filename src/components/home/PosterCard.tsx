import type { Series } from "@/types";
import { ChapterItem } from "./ChapterItem";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PosterCardProps {
  series: Series;
  className?: string;
}

export function PosterCard({ series, className }: PosterCardProps) {
  const href = `/series/${series.slug}`;
  const image = series.coverUrl;

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-xl glass glass-hover transition-all duration-200",
        className
      )}
    >
      {/* Cover thumbnail */}
      <Link
        href={href}
        className="relative flex-shrink-0 w-32 h-48 bg-white/10 bg-center bg-cover overflow-hidden"
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Type badge */}
        <span className="absolute top-1.5 left-1.5 bg-black/55 border border-white/10 rounded px-1.5 py-px text-[10px] capitalize leading-none">
          {series.type.toLowerCase()}
        </span>
        {/* Pinned badge */}
        {series.isPinned && (
          <span className="absolute bottom-1.5 left-1.5 bg-black/55 border border-white/10 rounded px-1.5 py-px text-[10px] flex items-center gap-1 leading-none">
            📌 Pinned
          </span>
        )}
      </Link>

      {/* Info panel */}
      <div className="flex-1 p-2.5 flex flex-col justify-between min-w-0">
        <Link
          href={href}
          className="text-sm font-semibold leading-tight line-clamp-3 mb-2 hover:text-accent transition-colors"
        >
          {series.title}
        </Link>

        <div className="flex flex-col">
          {series.chapters?.slice(0, 3).map((chap, i) => (
            <ChapterItem
              key={chap.number}
              chapter={{
                name: `Chapter ${chap.number}`,
                href: `/series/${series.slug}/chapter-${chap.number}`,
                date: new Date(chap.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                isLocked: chap.isLocked,
              }}
              isDivider={i > 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
