"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, List, Settings, Lock, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { BuyChapterAction } from "@/actions/points";
import { UpdateHistoryAction } from "@/actions/user";
import { AdPlayer } from "@/components/ui/AdPlayer";
import { CommentSection } from "@/components/series/CommentSection";
import { toast } from "react-hot-toast";

interface ChapterReaderProps {
  slug: string;
  initialChapter: any;
}

export function ChapterReader({ slug, initialChapter }: ChapterReaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [chapter, setChapter] = useState(initialChapter);
  const [buying, setBuying] = useState(false);
  const [adWatched, setAdWatched] = useState(false);

  // Reader Settings States
  const [readerMode, setReaderMode] = useState<"scroll" | "page">("scroll");
  const [readerTheme, setReaderTheme] = useState<"dark" | "light" | "sepia" | "amoled">("dark");
  const [imageWidth, setImageWidth] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  
  const isFreeChapter = !chapter.isLocked;
  const showAd = isFreeChapter && !adWatched;
  
  useEffect(() => {
    setChapter(initialChapter);
    setCurrentPage(0); // Reset page index on chapter change
  }, [initialChapter]);

  // Load settings from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("reader_mode");
    const savedTheme = localStorage.getItem("reader_theme");
    const savedWidth = localStorage.getItem("reader_width");

    if (savedMode) setReaderMode(savedMode as any);
    if (savedTheme) setReaderTheme(savedTheme as any);
    if (savedWidth) setImageWidth(Number(savedWidth));
  }, []);

  const handleSetReaderMode = (val: "scroll" | "page") => {
    setReaderMode(val);
    localStorage.setItem("reader_mode", val);
  };

  const handleSetReaderTheme = (val: "dark" | "light" | "sepia" | "amoled") => {
    setReaderTheme(val);
    localStorage.setItem("reader_theme", val);
  };

  const handleSetImageWidth = (val: number) => {
    setImageWidth(val);
    localStorage.setItem("reader_width", String(val));
  };

  useEffect(() => {
    if (session && chapter?.seriesId && chapter?.id) {
      UpdateHistoryAction(chapter.seriesId, chapter.id).catch(console.error);
    }
  }, [session, chapter?.seriesId, chapter?.id]);

  const handleBuy = async () => {
    if (!session) {
      toast.error("Please sign in to unlock this chapter.");
      return;
    }
    setBuying(true);
    try {
      const res = await BuyChapterAction(chapter.id);
      if (res.success) {
        if ((window as any).__refreshNavPoints) {
          (window as any).__refreshNavPoints();
        }
        toast.success("Chapter unlocked successfully!");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to unlock chapter.");
      }
    } catch (error) {
      console.error("Failed to buy chapter:", error);
      toast.error("Failed to unlock chapter. Check your point balance.");
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
      <div className={`sticky top-16 z-30 backdrop-blur-md border-b px-4 py-3 transition-colors duration-300 ${headerThemeClasses[readerTheme]}`}>
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <Link href={`/series/${slug}`} className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline">
              {chapter.series.title}
            </Link>
            <h1 className="text-sm font-bold truncate max-w-[200px] sm:max-w-none">
              Chapter {chapter.number} {chapter.title && `- ${chapter.title}`}
            </h1>
          </div>

          <div className="flex items-center gap-2">
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
          {showAd ? (
            <div className="w-full py-10">
              <AdPlayer onAdComplete={() => setAdWatched(true)} />
            </div>
          ) : chapter.images && chapter.images.length > 0 ? (
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

        {/* Comment Section */}
        <CommentSection chapterId={chapter.id} />
      </main>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
    </div>
  );
}

const BookOpen = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z" />
  </svg>
);
