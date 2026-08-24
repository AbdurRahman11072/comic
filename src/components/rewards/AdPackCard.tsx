"use client";

import React from "react";
import { CheckCircle2, ExternalLink, Gift, Loader2, Play } from "lucide-react";
import { CustomAdItem } from "@/services/ad.service";

interface AdPackCardProps {
  session: any;
  done: boolean;
  claiming: boolean;
  verifying: boolean;
  watching: boolean;
  packId: number;
  targetAds: number;
  watchedAds: number;
  progress: number;
  verificationTimeLeft: number;
  pointsEarned: number;
  customAd: CustomAdItem | null;
  onOpenLogin: () => void;
  onWatchAd: () => void;
  onClaimClick: () => void;
  onFinalAdClick: () => void;
  onResetFlow: () => void;
}

export function AdPackCard({
  session,
  done,
  claiming,
  verifying,
  watching,
  packId,
  targetAds,
  watchedAds,
  progress,
  verificationTimeLeft,
  pointsEarned,
  customAd,
  onOpenLogin,
  onWatchAd,
  onClaimClick,
  onFinalAdClick,
  onResetFlow,
}: AdPackCardProps) {
  const isReadyToClaim = watchedAds >= targetAds;

  return (
    <div className="w-full max-w-lg glass p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[60px] pointer-events-none" />

      {!session ? (
        <div className="flex flex-col items-center text-center space-y-6 py-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl">
            <Gift className="w-10 h-10 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Sign in to Earn Points</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Watch quick interactive ads and complete sponsored packs to earn free points for your
              favorite series.
            </p>
          </div>
          <button
            onClick={onOpenLogin}
            className="w-full max-w-xs py-3.5 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 cursor-pointer"
          >
            Log In / Register
          </button>
        </div>
      ) : done ? (
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <CheckCircle2 className="w-20 h-20 text-emerald-400" />
          <div>
            <h2 className="text-3xl font-black text-emerald-400">
              +{Number(pointsEarned) || 50} Points!
            </h2>
            <p className="text-muted-foreground mt-2">Points have been added to your account.</p>
          </div>
          <button
            onClick={onResetFlow}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
          >
            Watch Another Pack
          </button>
        </div>
      ) : claiming ? (
        <div className="flex flex-col items-center text-center space-y-6">
          <Gift className="w-16 h-16 text-yellow-500 animate-bounce" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Final Step!</h2>
            <p className="text-muted-foreground text-sm">
              Click the sponsored banner below to claim your{" "}
              {(Number(targetAds) || 5) * 10 + (Number(customAd?.points) || 0)} points.
            </p>
          </div>

          {customAd && customAd.imageUrl ? (
            <button
              onClick={onFinalAdClick}
              className="w-full aspect-video rounded-xl overflow-hidden relative group border-2 border-primary/30 hover:border-primary transition-colors cursor-pointer"
            >
              <img
                src={customAd.imageUrl}
                alt={customAd.title || "Sponsored"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="bg-primary text-white font-bold px-6 py-3 rounded-full shadow-xl shadow-black/50 transform group-hover:scale-110 transition-transform">
                  Click to Claim Reward
                </span>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] text-white/70 uppercase">
                Sponsored
              </div>
            </button>
          ) : (
            <button
              onClick={onFinalAdClick}
              className="w-full py-4 rounded-2xl border-2 border-primary/30 hover:border-primary text-primary font-bold flex items-center justify-center gap-2 transition-all hover:bg-primary/5 cursor-pointer"
            >
              <ExternalLink className="w-5 h-5" /> Visit Sponsor & Claim
            </button>
          )}
        </div>
      ) : verifying ? (
        <div className="flex flex-col items-center text-center space-y-8 py-8">
          <div className="relative">
            <Loader2 className="w-20 h-20 text-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
              {verificationTimeLeft}s
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Verifying Visit</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Please stay on the sponsor page or wait here for the timer to finish...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              Ad Pack #{packId}
            </div>
            <h3 className="text-2xl font-bold text-white">Watch {targetAds} Short Ads</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Earn up to {(Number(targetAds) || 5) * 10 + (Number(customAd?.points) || 0)} points upon
              completion!
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Pack Progress</span>
              <span className="text-primary font-mono">
                {watchedAds} / {targetAds} Ads
              </span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(watchedAds / targetAds) * 100}%` }}
              />
            </div>
          </div>

          {/* Watch Action */}
          <div className="w-full flex flex-col items-center gap-4">
            {isReadyToClaim ? (
              <button
                onClick={onClaimClick}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 animate-bounce cursor-pointer"
              >
                <Gift className="w-5 h-5" /> Claim Points Now!
              </button>
            ) : (
              <button
                onClick={onWatchAd}
                disabled={watching}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {watching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Watching Ad ({Math.round(progress)}%)...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Watch Ad {watchedAds + 1} of {targetAds}
                  </>
                )}
              </button>
            )}

            {watching && (
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
