"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  CreditCard,
  Lock,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

interface BalanceOverviewCardProps {
  balance: number;
  pointRate: number;
  isFrozen: boolean;
  isCashOutDisabled: boolean;
  isCreator: boolean;
  allowCreatorApplications: boolean;
  userRole: string;
  onOpenCashoutModal: () => void;
}

export function BalanceOverviewCard({
  balance,
  pointRate,
  isFrozen,
  isCashOutDisabled,
  isCreator,
  allowCreatorApplications,
  userRole,
  onOpenCashoutModal,
}: BalanceOverviewCardProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-5 sm:p-8 rounded-[2rem] glass border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left: Title & Description */}
      <div className="space-y-1.5 max-w-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Wallet & Payouts
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight text-white">
          Transaction History
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
          Monitor your point rewards, unlocks, referral earnings, and request cashouts directly.
        </p>
      </div>

      {/* Right: Balance Summary & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
        {/* Current Balance Card */}
        <div className="p-3.5 sm:px-5 sm:py-3.5 rounded-2xl bg-white/[0.03] border border-amber-500/20 flex items-center gap-3.5 shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">
              Current Balance
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {balance.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">pts</span>
              <span className="text-xs text-neutral-400 font-medium whitespace-nowrap">
                (≈ ${(balance * pointRate).toFixed(2)})
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Cashout / Creator Application / Shop */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isFrozen ? (
            <button
              disabled
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
            >
              <Lock className="w-4 h-4" />
              <span>Cashout Frozen</span>
            </button>
          ) : isCashOutDisabled ? (
            <button
              disabled
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
            >
              <Lock className="w-4 h-4" />
              <span>Cashout Paused</span>
            </button>
          ) : !isCreator ? (
            allowCreatorApplications && userRole === "user" ? (
              <Link
                href="/creator-benefits"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/10 cursor-pointer text-center"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Be Creator to Cash Out</span>
              </Link>
            ) : (
              <Link
                href="/shop"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition cursor-pointer text-center"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Buy Points</span>
              </Link>
            )
          ) : (
            <button
              id="request-cashout-btn"
              onClick={onOpenCashoutModal}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-primary/25 hover:bg-primary/90 active:scale-95 transition cursor-pointer text-center"
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Request Cashout</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
