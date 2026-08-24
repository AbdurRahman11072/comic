"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Copy, Sparkles, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import { referralService, ReferralStatsData } from "@/services/referral.service";

interface ReferralRewardsCardProps {
  onOpenLogin: () => void;
}

export function ReferralRewardsCard({ onOpenLogin }: ReferralRewardsCardProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [referralStats, setReferralStats] = useState<ReferralStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      setReferralStats(null);
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    setIsLoading(true);
    referralService.getReferralStats().then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setReferralStats(res.data);
        }
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user]);

  const referralCode = referralStats?.referralCode || (user as any)?.referralCode || "";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://comicbd.com";
  const shareableUrl = referralCode ? `${origin}/?ref=${referralCode}` : `${origin}/?ref=...`;

  const copyLink = () => {
    if (!user) {
      onOpenLogin();
      return;
    }
    if (!referralCode) {
      toast.error("Generating your referral link...");
      return;
    }
    navigator.clipboard.writeText(`${origin}/?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Referral link copied!");
  };

  return (
    <div className="w-full glass p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-popover space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">Refer Friends & Earn 10%</h3>
        </div>
        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          +{referralStats?.referralSignupBonus || 50} Pts Welcome
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Earn <strong className="text-purple-300">{referralStats?.referralBonusPercent || 10}% of all ad points</strong> your invited friends earn for {referralStats?.referralActiveMonths || 3} months, plus an instant <strong className="text-emerald-300">+{referralStats?.referralSignupBonus || 50} points</strong> welcome reward!
      </p>

      {user ? (
        <div className="space-y-2.5 pt-1">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={isLoading ? "Loading your referral link..." : shareableUrl}
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-muted-foreground font-mono text-xs truncate select-all"
            />
            <button
              type="button"
              onClick={copyLink}
              disabled={isLoading || !referralCode}
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
          <div className="flex justify-end">
            <Link
              href="/profile"
              className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
            >
              View Full Referral Hub & Stats →
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenLogin}
          className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Users className="w-4 h-4" /> Sign In to Get Your Referral Link
        </button>
      )}
    </div>
  );
}
