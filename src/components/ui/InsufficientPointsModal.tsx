"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, Gift, ShoppingBag, Sparkles, X, ArrowRight, Play } from "lucide-react";
import Link from "next/link";

interface InsufficientPointsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPoints: number;
  currentBalance: number;
  title?: string;
  description?: string;
}

export function InsufficientPointsModal({
  open,
  onOpenChange,
  requiredPoints,
  currentBalance,
  title = "Need More Points",
  description = "You don't have enough points to complete this unlock.",
}: InsufficientPointsModalProps) {
  const shortfall = Math.max(0, requiredPoints - currentBalance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md w-full rounded-3xl overflow-hidden border-white/10 bg-[#0f0f13] shadow-2xl">
        <div className="relative p-6 sm:p-8 space-y-6 text-center">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Coin Badge */}
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10">
            <Coins className="w-10 h-10 text-amber-400 animate-bounce" />
            <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-primary text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                {title}
              </DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Points Comparison Card */}
          <div className="glass p-4 rounded-2xl border border-white/5 grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
                Your Balance
              </span>
              <div className="flex items-center gap-1.5 font-bold text-white text-base">
                <Coins className="w-4 h-4 text-white/50" />
                <span>{currentBalance} pts</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block mb-1">
                Required / Shortfall
              </span>
              <div className="flex items-center gap-1.5 font-bold text-amber-400 text-base">
                <span>{requiredPoints} pts</span>
                <span className="text-[10px] text-red-400 font-normal">(-{shortfall})</span>
              </div>
            </div>
          </div>

          {/* Two Ways to Get Points Options */}
          <div className="space-y-3 pt-1 text-left">
            {/* Option 1: Free Rewards */}
            <Link
              href="/rewards"
              onClick={() => onOpenChange(false)}
              className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 hover:border-primary/60 transition-all shadow-md shadow-primary/10 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Earn Free Points</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[9px] border border-emerald-500/30">
                      100% FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Watch short interactive ad packs to earn up to 150 pts
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>

            {/* Option 2: Buy Coins */}
            <Link
              href="/shop"
              onClick={() => onOpenChange(false)}
              className="group flex items-center justify-between p-4 rounded-2xl glass hover:bg-white/[0.04] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Coin Store</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[9px] border border-amber-500/30">
                      INSTANT
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Purchase coin packs with secure Stripe checkout
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 group-hover:text-amber-400 transition-all shrink-0" />
            </Link>
          </div>

          {/* Close button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full py-2.5 rounded-xl glass text-xs font-semibold text-muted-foreground hover:text-white transition cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
