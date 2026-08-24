"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  CreditCard,
  Lock,
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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Wallet & Payouts
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-white">
          Transaction History
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Keep track of your earnings, rewards, unlock history, and cashout requests.
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Current Balance Card */}
        <div className="glass p-5 rounded-3xl border border-coin/20 flex flex-col items-center justify-center min-w-[200px] shadow-xl">
          <span className="text-[10px] uppercase font-bold tracking-widest text-coin/70 mb-1 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-coin" /> Current Balance
          </span>
          <div className="flex items-center gap-2 text-2xl font-extrabold text-coin">
            <span>{balance.toLocaleString()}</span>
            <span className="text-xs font-normal text-muted-foreground">pts</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            ≈ ${(balance * pointRate).toFixed(2)} USD
          </span>
        </div>

        {/* Cashout / Withdrawal Action Button */}
        {isFrozen ? (
          <button
            disabled
            className="px-6 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-75"
            title="Your account has been frozen"
          >
            <Lock className="w-4 h-4" />
            Cashout Disabled (Frozen)
          </button>
        ) : isCashOutDisabled ? (
          <button
            disabled
            className="px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-75"
            title="Cashout is currently turned off by administration"
          >
            <Lock className="w-4 h-4" />
            Cashout Is Turned Off
          </button>
        ) : !isCreator ? (
          <div className="flex items-center gap-2">
            {allowCreatorApplications && userRole === "user" ? (
              <Link
                href="/dashboard/channel"
                className="px-6 py-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 font-bold text-xs flex items-center gap-2 transition shadow-xl shadow-emerald-500/10 cursor-pointer"
                title="Become a Creator to unlock cashout withdrawals"
              >
                <Sparkles className="w-4 h-4" />
                Be Creator to Cash Out
              </Link>
            ) : (
              <button
                disabled
                className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-75"
                title="Only creators are eligible to withdraw money"
              >
                <Lock className="w-4 h-4" />
                Cashout (Creators Only)
              </button>
            )}
          </div>
        ) : (
          <button
            id="request-cashout-btn"
            onClick={onOpenCashoutModal}
            className="px-6 py-4 rounded-2xl bg-primary text-white font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition shadow-xl shadow-primary/25 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            Request Cashout <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
