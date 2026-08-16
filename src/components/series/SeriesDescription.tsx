"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SeriesDescriptionProps {
  html: string;
  genres: string[];
}

export function SeriesDescription({ html, genres }: SeriesDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  // Strip HTML tags to evaluate text length
  const plainText = html ? html.replace(/<[^>]*>/g, "").trim() : "";
  const isLong = plainText.length > 220;

  return (
    <div className="space-y-4">
      {/* Description Content */}
      <div className="relative">
        <div
          className={`prose prose-invert prose-sm max-w-none text-foreground/85 leading-relaxed transition-all ${
            isLong
              ? expanded
                ? "max-h-none"
                : "max-h-[5.5rem] overflow-hidden"
              : ""
          }`}
          dangerouslySetInnerHTML={{ __html: html || "<p>No description available for this series.</p>" }}
        />

        {/* Fade gradient overlay only when content is actually long & collapsed */}
        {isLong && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0f0f13] via-[#0f0f13]/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Show more/less toggle button only if content is long enough */}
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold transition-colors cursor-pointer"
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
      )}

      {/* Genre Tags */}
      {genres && genres.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {genres.map((g) => (
            <span
              key={g}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {g}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
