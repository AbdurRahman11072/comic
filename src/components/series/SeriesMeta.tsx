import { Dna, Type, BookOpen, Calendar } from "lucide-react";

interface SeriesMetaProps {
  status: "ONGOING" | "COMPLETED" | "HIATUS" | "DROPPED";
  type: string;
  chapterCount: number;
  lastUpdate: string;
}

const STATUS_COLOR: Record<string, string> = {
  ONGOING: "bg-green-500",
  COMPLETED: "bg-blue-500",
  HIATUS: "bg-yellow-500",
  DROPPED: "bg-red-500",
};

export function SeriesMeta({
  status,
  type,
  chapterCount,
  lastUpdate,
}: SeriesMetaProps) {
  return (
    <div className="flex flex-col gap-2 text-foreground">
      {/* Status */}
      <div className="flex sm:justify-between justify-start items-center gap-2">
        <h2 className="font-semibold text-sm flex items-center gap-1.5">
          <Dna className="inline-block w-4 h-4 opacity-70" />
          Status
        </h2>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 rounded-full inline-block ${STATUS_COLOR[status] ?? "bg-gray-500"}`}
          />
          <p className="font-normal text-xs text-foreground/80">{status}</p>
        </div>
      </div>

      {/* Type */}
      <div className="flex sm:justify-between justify-start items-center gap-2">
        <h2 className="font-semibold text-sm flex items-center gap-1.5">
          <Type className="inline-block w-4 h-4 opacity-70" />
          Type
        </h2>
        <span className="px-2 py-0.5 rounded text-xs font-medium border border-white/20 bg-white/5 text-foreground/80">
          {type}
        </span>
      </div>

      {/* Chapters */}
      <div className="flex sm:justify-between justify-start items-center gap-2">
        <h2 className="font-semibold text-sm flex items-center gap-1.5">
          <BookOpen className="inline-block w-4 h-4 opacity-70" />
          Chapters
        </h2>
        <p className="font-normal text-xs text-foreground/80">{chapterCount}</p>
      </div>

      {/* Last update */}
      <div className="flex sm:justify-between justify-start items-center gap-2">
        <h2 className="font-semibold text-sm flex items-center gap-1.5">
          <Calendar className="inline-block w-4 h-4 opacity-70" />
          Last update
        </h2>
        <p className="font-normal text-xs text-foreground/80">{lastUpdate}</p>
      </div>
    </div>
  );
}
