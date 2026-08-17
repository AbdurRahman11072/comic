"use client";

import { useState, useMemo } from "react";
import { SeriesBackground } from "./SeriesBackground";
import { SeriesCover } from "./SeriesCover";
import { SeriesStats } from "./SeriesStats";
import { SeriesMeta } from "./SeriesMeta";
import { SeriesActions } from "./SeriesActions";
import { SeriesDescription } from "./SeriesDescription";
import { ChapterRow } from "./ChapterRow";
import { ReviewSection } from "./ReviewSection";
import { BulkUnlockModal } from "./BulkUnlockModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Star, BookOpen, ArrowUpDown, ChevronLeft, ChevronRight, Unlock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Chapter {
  id?: string;
  number: number;
  title: string;
  date: string;
  isNew?: boolean;
  isLocked?: boolean;
  isPurchased?: boolean;
  coinCost?: number;
}

interface Series {
  id?: string;
  slug: string;
  title: string;
  altTitles: string;
  coverUrl: string;
  bgUrl: string;
  status: "ONGOING" | "COMPLETED" | "HIATUS" | "DROPPED";
  type: string;
  chapterCount: number;
  lastUpdate: string;
  rating: number;
  favorites: number;
  totalViews?: number;
  description: string;
  genres: string[];
  chapters: Chapter[];
  isBookmarked?: boolean;
  lastReadChapterNumber?: number | null;
  creator?: {
    id: string;
    name: string;
    image?: string | null;
    creatorProfile?: {
      id: string;
      channelName: string;
      profileImage?: string | null;
      bannerUrl?: string | null;
      description?: string | null;
    } | null;
  } | null;
}

interface SeriesDetailContentProps {
  series: Series;
}

export function SeriesDetailContent({ series }: SeriesDetailContentProps) {
  const router = useRouter();
  const [reverseOrder, setReverseOrder] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [localPurchasedIds, setLocalPurchasedIds] = useState<Set<string>>(new Set());
  const itemsPerPage = 20;

  // Enrich chapters with local purchased state
  const enrichedChapters = useMemo(() => {
    return (series.chapters || []).map((c) => ({
      ...c,
      isPurchased: c.isPurchased || (c.id ? localPurchasedIds.has(c.id) : false),
    }));
  }, [series.chapters, localPurchasedIds]);

  const lockedChaptersCount = useMemo(() => {
    return enrichedChapters.filter((c) => c.isLocked && !c.isPurchased).length;
  }, [enrichedChapters]);

  const chaptersToDisplay = useMemo(() => {
    let sorted = [...enrichedChapters];
    if (reverseOrder) {
      sorted = sorted.reverse();
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [enrichedChapters, reverseOrder, currentPage]);

  const totalPages = Math.ceil(enrichedChapters.length / itemsPerPage);

  const handleReverseToggle = () => {
    setReverseOrder((prev) => !prev);
    setCurrentPage(1);
  };

  return (
    <div className="relative min-h-screen pt-16 pb-20">
      <SeriesBackground bgUrl={series.bgUrl} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Cover & Stats (Sticky on desktop) */}
          <div className="w-full md:w-[280px] shrink-0">
            <div className="md:sticky md:top-24 space-y-6">
              <div className="relative">
                <SeriesCover src={series.coverUrl} alt={series.title} />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-primary" />
                  {series.chapterCount} Chapters
                </div>
              </div>
              
              <SeriesStats
                rating={series.rating}
                favorites={series.favorites}
                views={series.totalViews || (series as any).views || 0}
              />
              
              <div className="p-4 rounded-xl glass">
                <SeriesMeta
                  status={series.status}
                  type={series.type}
                  chapterCount={series.chapterCount}
                  lastUpdate={series.lastUpdate}
                  creator={series.creator}
                />
              </div>

              <SeriesActions
                seriesId={series.id}
                isBookmarked={series.isBookmarked}
                slug={series.slug}
                lastReadChapterNumber={series.lastReadChapterNumber}
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Title Section */}
            <div className="space-y-3">
              <p className="text-sm text-foreground/50 font-medium line-clamp-1">
                {series.altTitles}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {series.title}
              </h1>

              {/* Creator Channel Badge */}
              {series.creator && (
                <Link
                  href={`/channel/${series.creator.creatorProfile?.id || series.creator.id}`}
                  className="inline-flex items-center gap-3 p-2.5 pr-4 rounded-2xl glass glass-hover border border-white/10 hover:border-primary/40 transition group"
                  title={`Visit ${series.creator.creatorProfile?.channelName || series.creator.name}'s Creator Channel`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-primary/30 to-purple-500/30 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                    {series.creator.creatorProfile?.profileImage || series.creator.image ? (
                      <img
                        src={(series.creator.creatorProfile?.profileImage || series.creator.image) as string}
                        alt={series.creator.creatorProfile?.channelName || series.creator.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="font-bold text-sm text-primary">
                        {(series.creator.creatorProfile?.channelName || series.creator.name || "C").charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-primary transition truncate">
                        {series.creator.creatorProfile?.channelName || series.creator.name}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-primary/20 text-primary rounded-full border border-primary/30">
                        CREATOR CHANNEL
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground/80 transition flex items-center gap-1">
                      Visit Channel & Announcements <ExternalLink className="w-2.5 h-2.5 inline text-primary" />
                    </span>
                  </div>
                </Link>
              )}
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="glass p-1 rounded-xl h-auto mb-6">
                <TabsTrigger
                  value="chapters"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <BookOpen className="w-4 h-4" />
                  Chapters
                </TabsTrigger>
                <TabsTrigger
                  value="ratings"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Star className="w-4 h-4" />
                  Ratings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chapters" className="space-y-6">
                {/* Description and Genres */}
                <div className="p-6 rounded-2xl glass">
                  <SeriesDescription html={series.description} genres={series.genres} />
                </div>

                {/* Chapter List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2 flex-wrap gap-2">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      Chapters
                      <span className="text-sm font-normal text-foreground/40">
                        ({series.chapters.length})
                      </span>
                    </h3>

                    <div className="flex items-center gap-2">
                      {lockedChaptersCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setBulkModalOpen(true)}
                          className="text-xs font-bold text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all cursor-pointer"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Bulk Unlock ({lockedChaptersCount})</span>
                        </button>
                      )}

                      <button 
                        onClick={handleReverseToggle}
                        className="text-xs text-primary hover:underline flex items-center gap-1 glass px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        {reverseOrder ? "Oldest First" : "Newest First"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid gap-1 rounded-2xl glass p-2 max-h-[600px] overflow-y-auto scrollbar-thin">
                    {chaptersToDisplay.map((chapter) => (
                      <ChapterRow
                        key={chapter.number}
                        id={chapter.id}
                        number={chapter.number}
                        title={chapter.title}
                        date={chapter.date}
                        isNew={chapter.isNew}
                        isLocked={chapter.isLocked}
                        isPurchased={chapter.isPurchased}
                        coinCost={chapter.coinCost}
                        href={`/series/${series.slug}/chapter-${chapter.number}`}
                        onUnlocked={(unlockedId) => {
                          setLocalPurchasedIds((prev) => new Set([...prev, unlockedId]));
                          router.refresh();
                        }}
                      />
                    ))}
                    
                    {chaptersToDisplay.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No chapters available.
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg glass hover:bg-white/5 disabled:opacity-30 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium px-4">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg glass hover:bg-white/5 disabled:opacity-30 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ratings" className="space-y-6">
                <ReviewSection seriesId={series.id!} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Bulk Unlock Modal */}
      <BulkUnlockModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        seriesTitle={series.title}
        chapters={enrichedChapters}
        onSuccess={(unlockedIds) => {
          if (unlockedIds && unlockedIds.length > 0) {
            setLocalPurchasedIds((prev) => {
              const next = new Set(prev);
              unlockedIds.forEach((id) => next.add(id));
              return next;
            });
          }
          router.refresh();
        }}
      />
    </div>
  );
}
