"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  CheckCircle2,
  DollarSign,
  LayoutDashboard,
  Palette,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { UpdateCreatorProfileAction } from "@/actions/creator";

interface CreatorUpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatorUpgradeModal({ open, onClose }: CreatorUpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!open) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await UpdateCreatorProfileAction({});
      if (res.success) {
        toast.success("Welcome to the Creator Program! 🎉");
        onClose();
        router.push("/dashboard/channel");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to initialize creator studio");
      }
    } catch (_err) {
      toast.error("Failed to initialize creator studio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#12121a] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/15 rounded-full blur-[70px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-pink-500 flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">Welcome to the Creator Program! 🎉</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You're about to unlock your official Creator Studio, series publishing tools, and revenue share payouts.
          </p>
        </div>

        {/* What You Get Highlights */}
        <div className="space-y-2.5 relative z-10">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">70% Direct Revenue Share</p>
              <p className="text-[10px] text-muted-foreground">Keep the lion's share of reader chapter coin unlocks.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Custom Creator Channel</p>
              <p className="text-[10px] text-muted-foreground">Banners, profile avatars, announcements, and promo codes.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Real-Time Reader Analytics</p>
              <p className="text-[10px] text-muted-foreground">Retention curves, quality reading tiers, and earnings breakdown.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 relative z-10">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-full text-xs font-bold text-muted-foreground hover:text-white glass transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full sm:flex-1 h-12 rounded-full font-bold text-xs sm:text-sm text-white shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
            style={{ background: "var(--primary)" }}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{loading ? "Initializing Studio..." : "Let's Go to Creator Dashboard"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
