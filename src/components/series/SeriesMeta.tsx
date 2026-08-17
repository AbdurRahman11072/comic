import { Dna, Type, BookOpen, Calendar, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface SeriesMetaProps {
  status: "ONGOING" | "COMPLETED" | "HIATUS" | "DROPPED";
  type: string;
  chapterCount: number;
  lastUpdate: string;
  creator?: {
    id: string;
    name: string;
    image?: string | null;
    creatorProfile?: {
      id: string;
      channelName: string;
      profileImage?: string | null;
      description?: string | null;
    } | null;
  } | null;
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
  creator,
}: SeriesMetaProps) {
  const channelId = creator?.creatorProfile?.id || creator?.id;
  const channelName = creator?.creatorProfile?.channelName || creator?.name;
  const channelLogo = creator?.creatorProfile?.profileImage || creator?.image;

  return (
    <div className="flex flex-col gap-2.5 text-foreground">
      {/* Creator Channel */}
      {creator && (
        <div className="flex sm:justify-between justify-start items-center gap-2 pb-2.5 border-b border-white/5">
          <h2 className="font-semibold text-xs text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <UserIcon className="inline-block w-3.5 h-3.5 opacity-70 text-primary" />
            Creator
          </h2>
          <Link
            href={`/channel/${channelId}`}
            className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition group text-right"
            title={`Visit ${channelName}'s Channel`}
          >
            <div className="w-5 h-5 rounded-full overflow-hidden bg-primary/20 border border-white/10 shrink-0 flex items-center justify-center">
              {channelLogo ? (
                <img
                  src={channelLogo as string}
                  alt={channelName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-primary">
                  {(channelName || "C").charAt(0)}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-white group-hover:text-primary transition truncate max-w-[120px]">
              {channelName}
            </span>
          </Link>
        </div>
      )}

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
