"use client";

import React from "react";
import { Check, Layers, X } from "lucide-react";

const PRESET_GENRES = [
  "Action",
  "Romance",
  "Fantasy",
  "Martial Arts",
  "Comedy",
  "Drama",
  "Slice of Life",
  "Sci-Fi",
  "Horror",
  "Isekai",
  "Adventure",
  "Supernatural",
  "Mystery",
  "School Life",
];

interface SeriesGenreSelectorProps {
  genres: string[];
  genreInput: string;
  onToggleGenre: (genre: string) => void;
  onGenreInputChange: (val: string) => void;
  onAddCustomGenre: () => void;
}

export function SeriesGenreSelector({
  genres,
  genreInput,
  onToggleGenre,
  onGenreInputChange,
  onAddCustomGenre,
}: SeriesGenreSelectorProps) {
  return (
    <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Layers className="w-5 h-5 text-primary" /> Genre Categories & Tags
      </h2>
      <p className="text-xs text-muted-foreground">
        Select matching genre tags to help readers discover your series in browse & category
        filters.
      </p>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        {PRESET_GENRES.map((preset) => {
          const selected = genres.includes(preset);
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onToggleGenre(preset)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selected
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {selected && <Check className="w-3.5 h-3.5" />}
              {preset}
            </button>
          );
        })}
      </div>

      {/* Custom Tag Input */}
      <div className="flex gap-2 pt-2 max-w-md">
        <input
          type="text"
          placeholder="Add custom tag..."
          value={genreInput}
          onChange={(e) => onGenreInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddCustomGenre();
            }
          }}
          className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-primary/50"
        />
        <button
          type="button"
          onClick={onAddCustomGenre}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Add Tag
        </button>
      </div>

      {/* Selected Custom Tags (if not in preset) */}
      {genres.filter((g) => !PRESET_GENRES.includes(g)).length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {genres
            .filter((g) => !PRESET_GENRES.includes(g))
            .map((g) => (
              <span
                key={g}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/20 text-primary text-xs font-bold border border-primary/30"
              >
                {g}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => onToggleGenre(g)}
                />
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
