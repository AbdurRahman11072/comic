"use client";

import Link from "next/link";
import { Lock, Coins, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { BuyChapterAction } from "@/actions/points";
import { toast } from "react-hot-toast";

interface ChapterRowProps {
  id?: string; // chapter id for purchase
  number: number;
  title: string;
  date: string;
  isNew?: boolean;
  isLocked?: boolean;
  isPurchased?: boolean;
  coinCost?: number;
  href?: string;
}

export function ChapterRow({
  id,
  number,
  title,
  date,
  isNew,
  isLocked: initialIsLocked,
  isPurchased: initialIsPurchased,
  coinCost,
  href = "#",
}: ChapterRowProps) {
  const { data: session } = useSession();
  const [isLocked, setIsLocked] = useState(initialIsLocked && !initialIsPurchased);
  const [loading, setLoading] = useState(false);

  const handleBuy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("Please sign in to unlock chapters.");
      return;
    }

    if (!id) {
      toast.error("Chapter ID missing. Cannot purchase.");
      return;
    }

    setLoading(true);
    try {
      const result = await BuyChapterAction(id);
      if (!result.success) {
        throw new Error(result.message || "Failed to unlock chapter");
      }
      setIsLocked(false);
      
      // Refresh points in navbar
      if ((window as any).__refreshNavPoints) {
        (window as any).__refreshNavPoints();
      }
      
      toast.success("Chapter unlocked successfully!");
    } catch (error: any) {
      console.error("Failed to buy chapter:", error);
      toast.error(error.message || "Failed to unlock chapter. Check your point balance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href={isLocked ? "#" : href}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
        isLocked ? "cursor-default opacity-90" : "glass-hover"
      }`}
      onClick={(e) => isLocked && e.preventDefault()}
    >
      {/* Left: number + title + badges */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-foreground/40 text-xs font-mono w-6 shrink-0">
          {number}
        </span>
        <span className={`text-sm font-medium transition-colors ${
          isLocked ? "text-foreground/50" : "text-foreground/90 group-hover:text-foreground"
        }`}>
          {title}
        </span>
        
        {isNew && (
          <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
            NEW
          </span>
        )}

        {initialIsPurchased && !isLocked && (
           <span className="shrink-0 flex items-center gap-1 text-green-400">
             <CheckCircle2 className="w-3.5 h-3.5" />
             <span className="text-[10px] font-bold">UNLOCKED</span>
           </span>
        )}

        {isLocked && (
          <button
            disabled={loading}
            onClick={handleBuy}
            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <>
                <Lock className="w-2.5 h-2.5" />
                <span>Unlock {coinCost} Pts</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Right: date */}
      <span className="text-xs text-foreground/40 shrink-0 ml-2">{date}</span>
    </Link>
  );
}
