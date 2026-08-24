"use client";

import { UpdateHistoryAction } from "@/actions/user";
import { AdBanner } from "@/components/ads/AdBanner";
import { CommentSection } from "@/components/series/CommentSection";
import { useSession } from "@/lib/auth-client";
import { ChevronLeft, ChevronRight, ExternalLink, List, Loader2, Lock, Settings, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { InsufficientPointsModal } from "@/components/ui/InsufficientPointsModal";
import { BuyChapterAction } from "@/actions/points";
import { usePoints } from "@/providers/PointsProvider";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setImageWidth, setReaderMode, setReaderTheme } from "@/redux/slices/readerSlice";
import { adRevenueService } from "@/services/adRevenue.service";


interface ChapterReaderProps {
  slug: string;
  initialChapter: any;
}

export function ChapterReader({ slug, initialChapter }: ChapterReaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const [chapter, setChapter] = useState(initialChapter);

  // Redux Reader Settings State
  const { mode: readerMode, theme: readerTheme, imageWidth } = useAppSelector((state) => state.reader);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [showHeader, setShowHeader] = useState<boolean>(true);

  // Auto-hide header when scrolling down, show when scrolling up
  useEffect(() => {
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;

    const handleScrollDirection = () => {
      const currentY = window.scrollY;

      // Always keep header visible near the top
      if (currentY <= 50) {
        setShowHeader(true);
      } else if (currentY > lastY + 8) {
        // Scrolling Down -> Hide Header
        setShowHeader(false);
      } else if (currentY < lastY - 8) {
        // Scrolling Up -> Show Header
        setShowHeader(true);
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", handleScrollDirection, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollDirection);
  }, []);

  const [buying, setBuying] = useState(false);
  
  useEffect(() => {
    setChapter(initialChapter);
    setCurrentPage(0); // Reset page index on chapter change
  }, [initialChapter]);

  // Restore scroll position for this chapter
  useEffect(() => {
    if (chapter?.id && readerMode === "scroll") {
      const savedScroll = localStorage.getItem(`chapter_scroll_${chapter.id}`);
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo({ top: Number(savedScroll), behavior: "smooth" });
        }, 150);
      }
    }
  }, [chapter?.id, readerMode]);

  // Save scroll position on scroll (debounced)
  useEffect(() => {
    if (readerMode !== "scroll" || !chapter?.id) return;

    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (window.scrollY > 100) {
          localStorage.setItem(`chapter_scroll_${chapter.id}`, String(Math.round(window.scrollY)));
        }
      }, 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [chapter?.id, readerMode]);

  // Keyboard navigation for page mode
  useEffect(() => {
    if (readerMode !== "page" || !chapter?.images?.length) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentPage((p) => Math.max(0, p - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentPage((p) => Math.min((chapter.images?.length || 1) - 1, p + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readerMode, chapter?.images?.length]);

  const handleSetReaderMode = (val: "scroll" | "page") => {
    dispatch(setReaderMode(val));
  };

  const handleSetReaderTheme = (val: "dark" | "light" | "sepia" | "amoled") => {
    dispatch(setReaderTheme(val));
  };

  const handleSetImageWidth = (val: number) => {
    dispatch(setImageWidth(val));
  };

  useEffect(() => {
    if (session && chapter?.seriesId && chapter?.id) {
      UpdateHistoryAction(chapter.seriesId, chapter.id).catch(console.error);
    }
  }, [session, chapter?.seriesId, chapter?.id]);

  // --- Real-time Read Session Telemetry & Heartbeat (15s) ---
  const [sessionId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    let sId = sessionStorage.getItem("comic_reading_session_id");
    if (!sId) {
      sId = crypto.randomUUID();
      sessionStorage.setItem("comic_reading_session_id", sId);
    }
    return sId;
  });

  useEffect(() => {
    if (!chapter?.id || !chapter?.seriesId || !sessionId) return;

    let activeDurationSeconds = 0;
    let interactionCount = 0;
    let maxScrollDepth = 0;
    const viewedPages = new Set<number>([0]);
    const totalPages = chapter.images?.length || 1;

    // Track user interactions (mouse move, scroll, keydown, touch)
    const onUserInteraction = () => {
      interactionCount++;
    };

    const onScroll = () => {
      interactionCount++;
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const depth = Math.min(100, Math.round((scrollY / scrollHeight) * 100));
        if (depth > maxScrollDepth) {
          maxScrollDepth = depth;
          const estimatedPage = Math.min(totalPages - 1, Math.floor((depth / 100) * totalPages));
          for (let i = 0; i <= estimatedPage; i++) {
            viewedPages.add(i);
          }
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onUserInteraction, { passive: true });
    window.addEventListener("keydown", onUserInteraction, { passive: true });
    window.addEventListener("touchmove", onUserInteraction, { passive: true });

    // Active duration timer (pauses when tab is hidden)
    const secondTimer = setInterval(() => {
      if (document.visibilityState === "visible") {
        activeDurationSeconds += 1;
      }
    }, 1000);

    const getPayload = () => {
      const pagesCount = Math.max(1, viewedPages.size);
      const completionPercent = Math.min(100, Math.round((pagesCount / totalPages) * 100));
      return {
        sessionId,
        seriesId: chapter.seriesId,
        chapterId: chapter.id,
        durationSeconds: activeDurationSeconds,
        pagesViewed: pagesCount,
        totalPages,
        completionPercent,
        scrollDepthPercent: maxScrollDepth,
        interactionCount,
      };
    };

    // Initial ping on chapter load
    adRevenueService.trackProgress(getPayload());

    // Periodic Heartbeat every 15 seconds
    const heartbeatTimer = setInterval(() => {
      adRevenueService.trackProgress(getPayload());
    }, 15000);

    // Exit beacon on unload or unmount
    const handleExit = () => {
      adRevenueService.sendExitBeacon(getPayload());
    };

    window.addEventListener("pagehide", handleExit);
    window.addEventListener("beforeunload", handleExit);

    return () => {
      clearInterval(secondTimer);
      clearInterval(heartbeatTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onUserInteraction);
      window.removeEventListener("keydown", onUserInteraction);
      window.removeEventListener("touchmove", onUserInteraction);
      window.removeEventListener("pagehide", handleExit);
      window.removeEventListener("beforeunload", handleExit);
      handleExit();
    };
  }, [chapter?.id, chapter?.seriesId, chapter?.images?.length, sessionId]);

  // Points balance & insufficient points modal
  const { points: userPoints, refreshPoints, updateBalance } = usePoints();
  const [insufficientPointsOpen, setInsufficientPointsOpen] = useState(false);

  const handleBuy = async () => {
    if (!session) {
      toast.error("Please sign in to unlock this chapter.");
      return;
    }

    const cost = chapter.coinCost || 20;
    if (userPoints < cost) {
      setInsufficientPointsOpen(true);
      return;
    }

    setBuying(true);
    try {
      const res = await BuyChapterAction(chapter.id);
      if (res.success) {
        if (res.data?.points !== undefined) {
          updateBalance(res.data.points);
        } else {
          refreshPoints();
        }
        toast.success("Chapter unlocked successfully!");
        router.refresh();
      } else {
        const errMsg = res.message || "Failed to unlock chapter.";
        if (errMsg.toLowerCase().includes("insufficient") || errMsg.toLowerCase().includes("point")) {
          setInsufficientPointsOpen(true);
        } else {
          toast.error(errMsg);
        }
      }
    } catch (error: any) {
      console.error("Failed to buy chapter:", error);
      toast.error("Failed to unlock chapter.");
    } finally {
      setBuying(false);
    }
  };

  const themeClasses = {
    dark: "bg-[#0a0a0a] text-white",
    light: "bg-white text-black",
    sepia: "bg-[#f4ecd8] text-[#5c3a21]",
    amoled: "bg-black text-white"
  };

  const headerThemeClasses = {
    dark: "bg-[#0a0a0a]/90 border-white/5 text-white",
    light: "bg-white/90 border-black/5 text-black",
    sepia: "bg-[#f4ecd8]/95 border-[#e4dcb8]/40 text-[#5c3a21]",
    amoled: "bg-black/90 border-white/5 text-white"
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeClasses[readerTheme]}`}>
      {/* Chapter Header/Navigation */}
      <div
        className={`sticky top-0 z-[100] backdrop-blur-md border-b px-4 py-3 transition-all duration-300 ease-in-out transform ${
          showHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        } ${headerThemeClasses[readerTheme]}`}
      >
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col min-w-0">
              <Link href={`/series/${slug}`} className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline truncate">
                {chapter.series.title}
              </Link>
              <h1 className="text-sm font-bold truncate max-w-[160px] sm:max-w-[240px]">
                Chapter {chapter.number} {chapter.title && `- ${chapter.title}`}
              </h1>
            </div>

            {/* Channel Logo & Pill Link */}
            {chapter.series?.creator && (
              <Link
                href={`/channel/${chapter.series.creator.creatorProfile?.id || chapter.series.creator.id}`}
                className="flex items-center gap-2 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition group shrink-0"
                title={`Visit ${chapter.series.creator.creatorProfile?.channelName || chapter.series.creator.name}'s Creator Channel`}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-primary/20 border border-white/10 shrink-0 flex items-center justify-center">
                  {chapter.series.creator.creatorProfile?.profileImage || chapter.series.creator.image ? (
                    <img
                      src={(chapter.series.creator.creatorProfile?.profileImage || chapter.series.creator.image) as string}
                      alt="Channel"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] font-bold text-primary">
                      {(chapter.series.creator.creatorProfile?.channelName || chapter.series.creator.name || "C").charAt(0)}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-[11px] font-bold text-white group-hover:text-primary transition truncate max-w-[100px]">
                  {chapter.series.creator.creatorProfile?.channelName || chapter.series.creator.name}
                </span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setSettingsOpen(true)}
              className="p-2 glass glass-hover rounded-lg hover:opacity-80 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-1" />
            <div className="flex items-center gap-1">
              <button 
                disabled={!chapter.prevChapterNumber}
                onClick={() => router.push(`/series/${slug}/chapter-${chapter.prevChapterNumber}`)}
                className="p-2 glass glass-hover rounded-lg disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => router.push(`/series/${slug}`)}
                className="px-3 py-2 glass glass-hover rounded-lg flex items-center gap-2"
              >
                <List className="w-4 h-4 opacity-70" />
                <span className="text-xs font-bold hidden sm:inline">All Chapters</span>
              </button>
              <button 
                disabled={!chapter.nextChapterNumber}
                onClick={() => router.push(`/series/${slug}/chapter-${chapter.nextChapterNumber}`)}
                className="p-2 glass glass-hover rounded-lg disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Images */}
      <main className="flex-1 flex flex-col items-center py-4 transition-colors duration-300">
        <div className="max-w-[900px] w-full flex flex-col items-center px-4">
          {chapter.images && chapter.images.length > 0 ? (
            readerMode === "scroll" ? (
              chapter.images.map((img: any) => (
                <img 
                  key={img.id}
                  src={img.url}
                  alt={`Page ${img.order}`}
                  className="h-auto object-contain select-none pointer-events-none transition-all duration-300"
                  style={{ width: `${imageWidth}%` }}
                  loading="lazy"
                />
              ))
            ) : (
              // Page Mode
              <div className="w-full flex flex-col items-center space-y-6">
                <div className="relative w-full flex items-center justify-center group min-h-[400px]">
                  {/* Prev Overlay Button */}
                  <button 
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    className="absolute left-0 top-0 bottom-0 w-[15%] bg-gradient-to-r from-black/25 to-transparent flex items-center justify-start pl-4 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed z-10"
                  >
                    <ChevronLeft className="w-10 h-10 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                  </button>

                  <img 
                    src={chapter.images[currentPage]?.url}
                    alt={`Page ${currentPage + 1}`}
                    className="h-auto object-contain select-none pointer-events-none transition-all duration-300"
                    style={{ width: `${imageWidth}%` }}
                  />

                  {/* Next Overlay Button */}
                  <button 
                    disabled={currentPage === chapter.images.length - 1}
                    onClick={() => setCurrentPage(p => Math.min(chapter.images.length - 1, p + 1))}
                    className="absolute right-0 top-0 bottom-0 w-[15%] bg-gradient-to-l from-black/25 to-transparent flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed z-10"
                  >
                    <ChevronRight className="w-10 h-10 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                  </button>
                </div>

                {/* Page Counter UI */}
                <div className="flex items-center gap-4 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-xs font-bold shadow-lg">
                  <button 
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    className="hover:text-primary transition-colors disabled:opacity-30"
                  >
                    Prev
                  </button>
                  <span className="opacity-80">Page {currentPage + 1} of {chapter.images.length}</span>
                  <button 
                    disabled={currentPage === chapter.images.length - 1}
                    onClick={() => setCurrentPage(p => Math.min(chapter.images.length - 1, p + 1))}
                    className="hover:text-primary transition-colors disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>
            )
          ) : chapter.isLocked && !chapter.isPurchased ? (
            <div className="py-20 flex flex-col items-center text-center space-y-6 w-full">
               <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                 <Lock className="w-10 h-10 text-yellow-500" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-white mb-2">Chapter Locked</h2>
                 <p className="text-white/60 max-w-md mx-auto">This chapter requires coins to unlock. Support the author by unlocking it now!</p>
               </div>
               <button 
                 onClick={handleBuy}
                 disabled={buying}
                 className="flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-colors disabled:opacity-50"
               >
                 {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                 Unlock for {chapter.coinCost} Coins
               </button>
            </div>
          ) : (
            <div className="py-20 text-center text-white/30 space-y-4">
               <BookOpen className="w-12 h-12 mx-auto opacity-20" />
               <p>No images found for this chapter.</p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="w-full max-w-[800px] mt-8 mb-20 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 glass rounded-2xl border border-white/5">
            <button 
                disabled={!chapter.prevChapterNumber}
                onClick={() => router.push(`/series/${slug}/chapter-${chapter.prevChapterNumber}`)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass glass-hover text-white font-bold transition-all disabled:opacity-30"
            >
                <ChevronLeft className="w-5 h-5" />
                Previous Chapter
            </button>
            <div className="text-center">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Finished Reading</p>
                <Link href={`/series/${slug}`} className="text-sm font-bold text-primary hover:underline">Back to series info</Link>
            </div>
            <button 
                disabled={!chapter.nextChapterNumber}
                onClick={() => router.push(`/series/${slug}/chapter-${chapter.nextChapterNumber}`)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-30"
            >
                Next Chapter
                <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Creator Channel Spotlight Box */}
        {chapter.series?.creator && (
          <div className="w-full max-w-[800px] mb-8 px-4">
            <div className="p-5 glass rounded-2xl border border-white/10 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-primary/30 to-purple-500/30 border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                  {chapter.series.creator.creatorProfile?.profileImage || chapter.series.creator.image ? (
                    <img
                      src={(chapter.series.creator.creatorProfile?.profileImage || chapter.series.creator.image) as string}
                      alt="Channel"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {(chapter.series.creator.creatorProfile?.channelName || chapter.series.creator.name || "C").charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white truncate">
                      {chapter.series.creator.creatorProfile?.channelName || chapter.series.creator.name}
                    </h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-primary/20 text-primary rounded-full border border-primary/30 shrink-0">
                      CREATOR
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {chapter.series.creator.creatorProfile?.description || "Read more series and creator announcements on this channel."}
                  </p>
                </div>
              </div>

              <Link
                href={`/channel/${chapter.series.creator.creatorProfile?.id || chapter.series.creator.id}`}
                className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <span>Visit Channel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Reader Bottom Ad Banner */}
        <div className="w-full max-w-[800px] px-4">
          <AdBanner placement="reader_bottom" />
        </div>

        {/* Comment Section */}
        <CommentSection chapterId={chapter.id} />
      </main>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[30] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
          <div className="relative glass border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Reader Settings</h3>
              <button 
                onClick={() => setSettingsOpen(false)} 
                className="p-1 hover:bg-white/10 rounded-full transition text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reading Mode */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Reading Mode</label>
              <div className="flex gap-2">
                {[
                  { value: "scroll", label: "Webtoon (Scroll)" },
                  { value: "page", label: "Paging (Click)" }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSetReaderMode(opt.value as any)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      readerMode === opt.value
                        ? "bg-primary text-white border-primary"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Color Theme</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "dark", label: "Dark", bg: "bg-[#0a0a0a]", border: "border-white/10" },
                  { value: "light", label: "Light", bg: "bg-white", border: "border-black/10" },
                  { value: "sepia", label: "Sepia", bg: "bg-[#f4ecd8]", border: "border-[#e4dcb8]" },
                  { value: "amoled", label: "AMOLED", bg: "bg-black", border: "border-white/10" }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSetReaderTheme(opt.value as any)}
                    className={`h-10 rounded-xl relative border flex items-center justify-center text-[10px] font-bold ${opt.bg} ${opt.border} ${
                      readerTheme === opt.value ? "ring-2 ring-primary" : ""
                    }`}
                    style={{ color: opt.value === 'light' || opt.value === 'sepia' ? '#5c3a21' : '#fff' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Width */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Image Width</label>
                <span className="text-xs font-bold text-primary">{imageWidth}%</span>
              </div>
              <div className="flex gap-2">
                {[50, 75, 100].map(width => (
                  <button
                    key={width}
                    onClick={() => handleSetImageWidth(width)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      imageWidth === width
                        ? "bg-primary text-white border-primary"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {width === 100 ? "Full" : `${width}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Insufficient Points Modal */}
      <InsufficientPointsModal
        open={insufficientPointsOpen}
        onOpenChange={setInsufficientPointsOpen}
        requiredPoints={chapter.coinCost || 20}
        currentBalance={userPoints}
        title={`Unlock Chapter #${chapter.number}`}
        description={`You need ${chapter.coinCost || 20} points to unlock this chapter.`}
      />
    </div>
  );
}

const BookOpen = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z" />
  </svg>
);
