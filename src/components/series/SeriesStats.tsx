import { Star, Bookmark } from "lucide-react";

interface SeriesStatsProps {
  rating: number;
  favorites: number;
}

export function SeriesStats({ rating, favorites }: SeriesStatsProps) {
  return (
    <div className="flex items-center gap-0">
      {/* Rating */}
      <div className="flex h-14 min-w-0 flex-1 items-center justify-center gap-2 rounded-l glass border-r-0">
        <Star className="h-5 w-5 text-purple-400" fill="#a855f7" />
        <div className="flex flex-col leading-none">
          <span className="bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-sm font-bold text-transparent">
            {rating.toFixed(2)}
          </span>
          <small className="bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-[10px] text-transparent">
            Ratings
          </small>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-white/10 shrink-0" />

      {/* Favorites */}
      <div className="flex h-14 min-w-0 flex-1 items-center justify-center gap-2 rounded-r glass border-l-0">
        <Bookmark className="h-5 w-5 text-cyan-400" fill="#22d3ee" />
        <div className="flex flex-col leading-none">
          <span className="bg-gradient-to-br from-green-400 to-blue-400 bg-clip-text text-sm font-bold text-transparent">
            {favorites.toLocaleString()}
          </span>
          <small className="bg-gradient-to-br from-green-400 to-blue-400 bg-clip-text text-[10px] text-transparent">
            Favorites
          </small>
        </div>
      </div>
    </div>
  );
}
