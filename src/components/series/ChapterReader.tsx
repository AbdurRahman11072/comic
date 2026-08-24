"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import { UpdateHistoryAction } from "@/actions/user";
import { BuyChapterAction } from "@/actions/points";
import { InsufficientPointsModal } from "@/components/ui/InsufficientPointsModal";
import { usePoints } from "@/providers/PointsProvider";
import { useReader } from "@/providers/ReaderProvider";
import { adRevenueService } from "@/services/adRevenue.service";

import { ReaderHeader } from "./ReaderHeader";
import { ReaderSettingsModal } from "./ReaderSettingsModal";
import { ReaderCanvas } from "./ReaderCanvas";
import { ReaderBottomNav } from "./ReaderBottomNav";

interface ChapterReaderProps {
  slug: string;
  initialChapter: any;
}

export function ChapterReader({ slug, initialChapter }: ChapterReaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [chapter, setChapter] = useState(initialChapter);

  // Reader Settings (Context-backed, persisted to localStorage)
  const {
    mode: readerMode,
    theme: readerTheme,
    imageWidth,
    setMode,
    setTheme,
    setImageWidth: setWidth,
  } = useReader();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [showHeader, setShowHeader] = useState<boolean>(true);
  const [buying, setBuying] = useState(false);

  // Points balance & insufficient points modal
  const { points: userPoints, refreshPoints, updateBalance } = usePoints();
  const [insufficientPointsOpen, setInsufficientPointsOpen] = useState(false);

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

    adRevenueService.trackProgress(getPayload());

    const heartbeatTimer = setInterval(() => {
      adRevenueService.trackProgress(getPayload());
    }, 15000);

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
    amoled: "bg-black text-white",
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${themeClasses[readerTheme]}`}
    >
      {/* Chapter Header/Navigation */}
      <ReaderHeader
        slug={slug}
        chapter={chapter}
        showHeader={showHeader}
        readerTheme={readerTheme}
        onOpenSettings={() => setSettingsOpen(true)}
        onNavigatePrev={() =>
          router.push(`/series/${slug}/chapter-${chapter.prevChapterNumber}`)
        }
        onNavigateNext={() =>
          router.push(`/series/${slug}/chapter-${chapter.nextChapterNumber}`)
        }
        onNavigateAll={() => router.push(`/series/${slug}`)}
      />

      {/* Chapter Images Canvas */}
      <main className="flex-1 flex flex-col items-center py-4 transition-colors duration-300">
        <ReaderCanvas
          chapter={chapter}
          readerMode={readerMode}
          imageWidth={imageWidth}
          currentPage={currentPage}
          buying={buying}
          onPageChange={setCurrentPage}
          onBuyChapter={handleBuy}
        />

        {/* Bottom Navigation, Creator Spotlight & Comments */}
        <ReaderBottomNav
          slug={slug}
          chapter={chapter}
          onNavigatePrev={() =>
            router.push(`/series/${slug}/chapter-${chapter.prevChapterNumber}`)
          }
          onNavigateNext={() =>
            router.push(`/series/${slug}/chapter-${chapter.nextChapterNumber}`)
          }
        />
      </main>

      {/* Reader Settings Modal */}
      <ReaderSettingsModal
        open={settingsOpen}
        readerMode={readerMode}
        readerTheme={readerTheme}
        imageWidth={imageWidth}
        onClose={() => setSettingsOpen(false)}
        onSetReaderMode={setMode}
        onSetReaderTheme={setTheme}
        onSetImageWidth={setWidth}
      />

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
