import type { Chapter } from "./types";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChapterItemProps {
  chapter: Chapter;
  isDivider?: boolean;
}

export function ChapterItem({ chapter, isDivider }: ChapterItemProps) {
  return (
    <>
      {isDivider && (
        <div className="h-px bg-primary/20 rounded-full my-0.5" />
      )}
      <Link
        href={chapter.href}
        className={cn(
          "flex items-center justify-between py-[5px] px-1 text-[11px] rounded-md",
          "border-b border-dashed border-white/15 last:border-b-0",
          "transition-all duration-150 hover:px-2 hover:bg-white/5 group"
        )}
      >
        <span className="flex-1 truncate text-white/85 group-hover:text-white transition-colors">
          {chapter.name}
        </span>

        <span className="flex items-center gap-1 mx-1">
          {chapter.isLocked && (
            <span
              className="w-[14px] h-[14px] rounded-full flex-shrink-0"
              style={{ background: "var(--coin)" }}
              title="Coin-locked"
            />
          )}
          {chapter.isNew && (
            <span className="px-[5px] py-px rounded text-[9px] font-semibold bg-primary text-white uppercase tracking-wide">
              New
            </span>
          )}
        </span>

        <span className="text-muted-foreground text-[10px] whitespace-nowrap ml-1">
          {chapter.date}
        </span>
      </Link>
    </>
  );
}
