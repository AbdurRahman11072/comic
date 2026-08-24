"use client";

import React from "react";
import {
  Check,
  Clock,
  Coins,
  Copy,
  Loader2,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReferralStatsData } from "@/services/referral.service";

interface ReferralsTabProps {
  referralStats: ReferralStatsData | null;
  referralLoading: boolean;
  referralCode: string;
  shareableUrl: string;
  copiedCode: boolean;
  copiedLink: boolean;
  onCopy: (text: string, isLink?: boolean) => void;
}

export function ReferralsTab({
  referralStats,
  referralLoading,
  referralCode,
  shareableUrl,
  copiedCode,
  copiedLink,
  onCopy,
}: ReferralsTabProps) {
  return (
    <div className="space-y-6">
      {/* Header Hero Banner */}
      <div className="relative overflow-hidden rounded-[2rem] border border-purple-500/20 bg-gradient-to-br from-purple-900/30 via-popover to-background p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Invite Friends & Earn Free Points
          </div>
          <h3 className="text-3xl font-black tracking-tight text-white">
            Share Your Link, Earn Points Forever
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl">
            Invite your friends to Comic BD. When they sign up with your link, they receive{" "}
            <strong className="text-emerald-400">
              +{referralStats?.referralSignupBonus || 50} free points
            </strong>{" "}
            immediately, and you earn{" "}
            <strong className="text-purple-400">
              {referralStats?.referralBonusPercent || 10}%
            </strong>{" "}
            of all ad points they earn for their first{" "}
            {referralStats?.referralActiveMonths || 3} months!
          </p>
        </div>
      </div>

      {/* Referral Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {referralLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                referralStats?.totalReferrals || 0
              )}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Total Friends Invited</div>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">
              {referralLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                (referralStats?.totalPointsEarned || 0).toLocaleString()
              )}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Referral Points Earned</div>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">
              {referralLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                referralStats?.activeReferrals || 0
              )}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Active Earning Friends</div>
          </div>
        </div>
      </div>

      {/* Referral Link & Code Sharing Box */}
      <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-6">
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" /> Your Exclusive Referral Link
          </h4>
          <p className="text-xs text-muted-foreground">
            Anyone who clicks your unique link will have your referral code pre-filled automatically
            upon signup.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            readOnly
            value={shareableUrl}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-muted-foreground font-mono truncate select-all"
          />
          <Button
            type="button"
            onClick={() => onCopy(shareableUrl, true)}
            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-11 shrink-0 cursor-pointer"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 mr-2 text-emerald-300" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copiedLink ? "Link Copied!" : "Copy Link"}
          </Button>
        </div>

        {/* Quick Referral Code Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Referral Code
            </div>
            <div className="text-xl font-mono font-black text-purple-400 tracking-wider mt-0.5">
              {referralCode}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onCopy(referralCode, false)}
            className="border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl h-9 cursor-pointer"
          >
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1.5" />
            )}
            {copiedCode ? "Code Copied" : "Copy Code"}
          </Button>
        </div>

        {/* 1-Click Social Share */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Share to Social Networks
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Join me on Comic BD and read trending comics! Use my referral code ${referralCode} to get free points: ${shareableUrl}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Read high-quality manhwa & comics on Comic BD! Sign up with my referral code ${referralCode} for free bonus points:`
              )}&url=${encodeURIComponent(shareableUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              Twitter / X
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(
                shareableUrl
              )}&text=${encodeURIComponent(
                `Sign up on Comic BD using my referral code ${referralCode} for free points!`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              Telegram
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      {/* Invited Friends List */}
      <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-4">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Invited Friends (
          {referralStats?.recentReferrals?.length || 0})
        </h4>

        {!referralStats?.recentReferrals || referralStats.recentReferrals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs">
            No friends invited yet. Share your referral link to get your first bonus!
          </div>
        ) : (
          <div className="space-y-2.5">
            {referralStats.recentReferrals.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                    {friend.image ? (
                      <img
                        src={friend.image}
                        alt={friend.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      friend.name?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{friend.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Joined {new Date(friend.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {friend.isActive ? (
                    <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Active Bonus
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold bg-white/10 text-muted-foreground px-2.5 py-0.5 rounded-full">
                      Expired
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
