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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Star, BookOpen, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

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
  description: string;
  genres: string[];
  chapters: Chapter[];
  isBookmarked?: boolean;
  lastReadChapterNumber?: number | null;
}

interface SeriesDetailContentProps {
  series: Series;
}

export function SeriesDetailContent({ series }: SeriesDetailContentProps) {
  const [reverseOrder, setReverseOrder] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const chaptersToDisplay = useMemo(() => {
    let sorted = [...series.chapters];
    if (reverseOrder) {
      sorted = sorted.reverse();
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [series.chapters, reverseOrder, currentPage]);

  const totalPages = Math.ceil(series.chapters.length / itemsPerPage);

  const handleReverseToggle = () => {
    setReverseOrder((prev) => !prev);
    setCurrentPage(1); // Reset to first page on sort change
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
              
              <SeriesStats rating={series.rating} favorites={series.favorites} />
              
              <div className="p-4 rounded-xl glass">
                <SeriesMeta
                  status={series.status}
                  type={series.type}
                  chapterCount={series.chapterCount}
                  lastUpdate={series.lastUpdate}
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
            <div className="space-y-2">
              <p className="text-sm text-foreground/50 font-medium line-clamp-1">
                {series.altTitles}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {series.title}
              </h1>
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
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      Chapters
                      <span className="text-sm font-normal text-foreground/40">
                        ({series.chapters.length})
                      </span>
                    </h3>
                    <button 
                      onClick={handleReverseToggle}
                      className="text-xs text-primary hover:underline flex items-center gap-1 glass px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      {reverseOrder ? "Oldest First" : "Newest First"}
                    </button>
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
    </div>
  );
}
