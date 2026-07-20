"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SeriesDescriptionProps {
  html: string;
  genres: string[];
}

export function SeriesDescription({ html, genres }: SeriesDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="relative">
        <div
          className={`prose prose-invert prose-sm max-w-none text-foreground/80 leading-relaxed transition-all overflow-hidden ${
            expanded ? "max-h-[999px]" : "max-h-[6rem]"
          }`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        )}
      </div>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" /> Show less
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" /> Read more
          </>
        )}
      </button>

      {/* Genre Tags */}
      <div className="flex flex-wrap gap-2">
        {genres.map((g) => (
          <span
            key={g}
            className="px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors cursor-pointer"
          >
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
