"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, Bookmark, Share2, Loader2, Link as LinkIcon, MessageCircle, Send, Flag } from "lucide-react";
import Link from "next/link";
import { ToggleBookmarkAction } from "@/actions/user";
import { ReportModal } from "@/components/common/ReportModal";
import { toast } from "react-hot-toast";

const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

interface SeriesActionsProps {
  seriesId?: string;
  seriesTitle?: string;
  slug: string;
  lastReadChapterNumber?: number | null;
  isBookmarked?: boolean;
}

export function SeriesActions({
  seriesId,
  seriesTitle,
  slug,
  lastReadChapterNumber,
  isBookmarked = false,
}: SeriesActionsProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const firstChapterHref = `/series/${slug}/chapter-1`;
  const lastChapterHref = `/series/${slug}/chapter-${lastReadChapterNumber || 1}`;

  const handleBookmark = async () => {
    if (!seriesId) return;
    setLoading(true);
    try {
      const res = await ToggleBookmarkAction(seriesId);
      if (res.success) {
        setBookmarked(res.data?.isBookmarked ?? !bookmarked);
        toast.success(res.data?.isBookmarked ? "Added to bookmarks" : "Removed from bookmarks");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to toggle bookmark");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
    setShareOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Read buttons */}
      <div className="flex gap-2">
        <Link
          href={firstChapterHref}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Read First
        </Link>
        <Link
          href={lastChapterHref}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg glass glass-hover text-foreground font-semibold text-sm transition-all"
        >
          Continue
        </Link>
      </div>

      {/* Bookmark + Share + Report */}
      <div className="flex gap-2 relative" ref={shareRef}>
        <button
          onClick={handleBookmark}
          disabled={loading || !seriesId}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-semibold text-sm transition-all disabled:opacity-50 ${
            bookmarked
              ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
              : "glass glass-hover text-foreground/70"
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-cyan-400" : ""}`} />}
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>

        <button 
          onClick={() => setShareOpen(!shareOpen)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg glass glass-hover text-foreground/70 transition-all font-semibold text-sm"
          title="Share Series"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setReportOpen(true)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg glass glass-hover text-foreground/70 hover:text-red-400 hover:border-red-500/30 transition-all font-semibold text-sm"
          title="Report Series"
        >
          <Flag className="w-4 h-4" />
        </button>

        {/* Share Menu */}
        {shareOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-48 p-2 rounded-xl glass border border-white/10 shadow-2xl z-50 flex flex-col gap-1 bg-[#15151b]">
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600/20 hover:text-blue-500 transition-colors text-sm"
            >
              <FacebookIcon className="w-4 h-4" /> Facebook
            </a>
            <a 
              href={`fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-sm md:hidden"
            >
              <MessageCircle className="w-4 h-4" /> Messenger
            </a>
            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-500/20 hover:text-green-500 transition-colors text-sm"
            >
              <Send className="w-4 h-4" /> WhatsApp
            </a>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-sm w-full text-left"
            >
              <LinkIcon className="w-4 h-4" /> Copy Link
            </button>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {seriesId && (
        <ReportModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="series"
          targetId={seriesId}
          targetTitle={seriesTitle}
        />
      )}
    </div>
  );
}
