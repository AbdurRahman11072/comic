"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { useSession } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "react-hot-toast";
import {
  Loader2, Play, Gift, AlertCircle,
  X, ExternalLink, CheckCircle2, Sparkles, Coins, Flame, Users, Copy, Check
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { adService, CustomAdItem } from "@/services/ad.service";
import { useEarnFromAdMutation, useGetPointsBalanceQuery } from "@/redux/api/pointsApi";
import { useRedeemPromoCodeMutation } from "@/redux/api/promoApi";
import { useGetReferralStatsQuery } from "@/redux/api/referralApi";
import { LoginDialog } from "@/components/home/LoginDialog";

const YoutubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

interface CustomAd {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  videoUrl?: string;
  adType: "BANNER" | "VIDEO" | "SOCIAL";
  socialPlatform?: string;
  socialActionUrl?: string;
  points: number;
}

export function RewardsClient() {
  return (
    <Suspense fallback={null}>
      <RewardsContent />
    </Suspense>
  );
}

function RewardsContent() {
  const { data: session, isPending } = useSession();
  const searchParams = useSearchParams();

  // Login Dialog state for rewards page
  const [loginOpen, setLoginOpen] = useState(false);

  // Live Database Points & Daily Ad Stats
  const { data: balanceData } = useGetPointsBalanceQuery(undefined, { skip: !session });
  const totalDailyViews = balanceData?.data?.dailyAdViews ?? 0;
  const totalDailyPoints = balanceData?.data?.dailyAdPointsEarned ?? 0;

  // Storage key for persisting active ad pack across page refreshes
  const storageKey = `comic_reward_pack_${session?.user?.id || "guest"}`;
  const todayStr = typeof window !== "undefined" ? new Date().toISOString().split("T")[0] : "";

  const generateTarget = useCallback(() => Math.floor(Math.random() * 11) + 5, []);

  // Ad Pack State
  const [packId, setPackId] = useState(101);
  const [targetAds, setTargetAds] = useState(5);
  const [watchedAds, setWatchedAds] = useState(0);
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);

  // Claim & Verification State
  const [claiming, setClaiming] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationTimeLeft, setVerificationTimeLeft] = useState(0);
  const [done, setDone] = useState(false);

  // Custom Ad
  const [customAd, setCustomAd] = useState<CustomAdItem | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Helper to persist current pack progress in localStorage
  const persistPack = useCallback(
    (newWatched: number, newTarget: number = targetAds, newPackId: number = packId, isClaiming: boolean = claiming) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            targetAds: newTarget,
            watchedAds: newWatched,
            packId: newPackId,
            date: todayStr,
            claiming: isClaiming,
          })
        );
      } catch (e) {
        // Ignore storage quotas or restrictions
      }
    },
    [storageKey, todayStr, targetAds, packId, claiming]
  );

  // Restore or initialize active ad pack from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr && typeof parsed.targetAds === "number") {
          setTargetAds(parsed.targetAds);
          setWatchedAds(parsed.watchedAds || 0);
          if (parsed.packId) setPackId(parsed.packId);
          if (parsed.claiming) setClaiming(true);
          return;
        }
      }
    } catch (e) {
      // Fall through to initial generation
    }

    const initialTarget = generateTarget();
    const initialPackId = Math.floor(Math.random() * 899) + 100;
    setTargetAds(initialTarget);
    setWatchedAds(0);
    setPackId(initialPackId);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          targetAds: initialTarget,
          watchedAds: 0,
          packId: initialPackId,
          date: todayStr,
          claiming: false,
        })
      );
    } catch (e) {}
  }, [storageKey, todayStr, generateTarget]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Payment successful! Your points have been added.");
      if ((window as any).__refreshNavPoints) (window as any).__refreshNavPoints();
    }
  }, [searchParams]);

  // Fetch custom ad on mount
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await adService.getAdByPlacement("rewarded_unlock");
        if (res.success && res.data) {
          setCustomAd(res.data);
        }
      } catch (err) {
        // Silently fall back
      }
    };
    fetchAd();
  }, []);

  // Watch Ad Logic
  const handleWatchAd = () => {
    if (watching || watchedAds >= targetAds) return;
    setWatching(true);
    setProgress(0);

    const duration = 5000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);
      if (currentStep >= steps) {
        clearInterval(timer);
        setWatching(false);
        setWatchedAds((prev) => {
          const next = prev + 1;
          persistPack(next, targetAds, packId, next >= targetAds);
          return next;
        });
        toast.success("Ad watched! Keep going!");
      }
    }, interval);
  };

  // Verification Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (verifying && verificationTimeLeft > 0) {
      timer = setInterval(() => setVerificationTimeLeft((p) => p - 1), 1000);
    } else if (verifying && verificationTimeLeft === 0) {
      completeReward();
    }
    return () => clearInterval(timer);
  }, [verifying, verificationTimeLeft]);

  const handleClaimClick = () => {
    persistPack(watchedAds, targetAds, packId, true);
    if (customAd) {
      if (customAd.adType === "VIDEO" && customAd.videoUrl) {
        setVideoModalOpen(true);
      } else if (customAd.adType === "SOCIAL" && customAd.linkUrl) {
        window.open(customAd.linkUrl, "_blank");
        startVerification();
      } else {
        setClaiming(true);
      }
    } else {
      setClaiming(true);
    }
  };

  const startVerification = () => {
    const randomWait = Math.floor(Math.random() * 51) + 10; // 10-60s
    setVerificationTimeLeft(randomWait);
    setVerifying(true);
    setClaiming(false);
    setVideoModalOpen(false);
    toast("Verifying your visit... Please wait.", { icon: "⏳", duration: 4000 });
  };

  const handleFinalAdClick = () => {
    const adLink = customAd?.linkUrl || "https://example.com/sponsor";
    window.open(adLink, "_blank");
    startVerification();
  };

  const handleVideoWatched = () => {
    setVideoModalOpen(false);
    startVerification();
  };

  const [earnFromAdMutate] = useEarnFromAdMutation();

  const completeReward = async () => {
    setVerifying(false);
    const adBonus = customAd ? customAd.points : 0;
    const basePoints = targetAds * 10;
    const totalPoints = Math.min(basePoints + adBonus, 150);

    try {
      const res = await earnFromAdMutate({ amount: totalPoints, adsCount: targetAds }).unwrap();
      if (!res.success) throw new Error(res.message);

      setPointsEarned(totalPoints);
      setDone(true);
      
      // Clear completed pack from local storage
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}

      toast.success(`🎉 You earned ${totalPoints} points!`, { duration: 5000 });
    } catch (error: any) {
      console.error("Failed to earn points:", error);
      toast.error(error?.data?.message || "Error earning points. Please try again.");
      setDone(false);
    }
  };

  const resetFlow = () => {
    const newTarget = generateTarget();
    const newPackId = Math.floor(Math.random() * 899) + 100;
    setTargetAds(newTarget);
    setWatchedAds(0);
    setPackId(newPackId);
    setProgress(0);
    setClaiming(false);
    setVerifying(false);
    setDone(false);
    setPointsEarned(0);
    persistPack(0, newTarget, newPackId, false);
  };

  if (isPending) return null;

  const isReadyToClaim = watchedAds >= targetAds;

  const socialIcon = (platform?: string) => {
    if (platform === "youtube") return <YoutubeIcon className="w-5 h-5" />;
    if (platform === "instagram") return <InstagramIcon className="w-5 h-5" />;
    if (platform === "facebook") return <FacebookIcon className="w-5 h-5" />;
    return <ExternalLink className="w-5 h-5" />;
  };

  const socialActionLabel = (platform?: string) => {
    if (platform === "youtube") return "Subscribe on YouTube";
    if (platform === "instagram") return "Follow on Instagram";
    if (platform === "facebook") return "Follow on Facebook";
    return "Complete Action";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <div className="fixed -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-1 max-w-[48rem] w-full mx-auto px-4 py-12 relative z-10 flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading tracking-tight mb-3">Rewards Center</h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Complete the Ad Pack to earn free points for your favorite series!
          </p>

          {/* User Live Daily Stats from Database */}
          {session && (
            <div className="inline-flex items-center gap-3 px-4 py-2 mt-4 rounded-2xl glass border border-white/10 shadow-lg text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Coins className="w-4 h-4" />
                <span>{balanceData?.data?.points ?? (session?.user as any)?.points ?? 0} Points</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Flame className="w-4 h-4" />
                <span>Today: {totalDailyViews} Ads Watched ({totalDailyPoints} P earned)</span>
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Ad Pack Card */}
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
                  Watch quick interactive ads and complete sponsored packs to earn free points for your favorite series.
                </p>
              </div>
              <button
                onClick={() => setLoginOpen(true)}
                className="w-full max-w-xs py-3.5 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 cursor-pointer"
              >
                Log In / Register
              </button>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center text-center space-y-6 py-4">
              <CheckCircle2 className="w-20 h-20 text-emerald-400" />
              <div>
                <h2 className="text-3xl font-black text-emerald-400">+{pointsEarned} Points!</h2>
                <p className="text-muted-foreground mt-2">Points have been added to your account.</p>
              </div>
              <button
                onClick={resetFlow}
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
                  Click the sponsored banner below to claim your {targetAds * 10 + (customAd?.points || 0)} points.
                </p>
              </div>

              {customAd && customAd.imageUrl ? (
                <button
                  onClick={handleFinalAdClick}
                  className="w-full aspect-video rounded-xl overflow-hidden relative group border-2 border-primary/30 hover:border-primary transition-colors"
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
                  onClick={handleFinalAdClick}
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
                  Earn up to {targetAds * 10 + (customAd ? customAd.points : 0)} points upon completion!
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Pack Progress</span>
                  <span className="text-primary font-mono">{watchedAds} / {targetAds} Ads</span>
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
                    onClick={handleClaimClick}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 animate-bounce cursor-pointer"
                  >
                    <Gift className="w-5 h-5" /> Claim Points Now!
                  </button>
                ) : (
                  <button
                    onClick={handleWatchAd}
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

        {/* Bottom Reward Options (Promo Code & Referral Program) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-8">
          <PromoRedeemBox />
          <ReferralRewardsCard onOpenLogin={() => setLoginOpen(true)} />
        </div>
      </main>

      <Footer />

      {/* Direct Login Modal on Rewards Page */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onAuthSuccess={() => setLoginOpen(false)}
      />
    </div>
  );
}

function PromoRedeemBox() {
  const [code, setCode] = useState("");
  const [redeemMutate, { isLoading }] = useRedeemPromoCodeMutation();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      const res = await redeemMutate({ code: code.trim() }).unwrap();
      toast.success(`🎉 Code redeemed! You got ${res.data.pointsAwarded} points.`);
      setCode("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid or expired promo code.");
    }
  };

  return (
    <div className="w-full glass p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-amber-400" />
        <h3 className="text-base font-bold text-white">Have a Promo Code?</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Redeem codes from creators or special events to get instant free coins.
      </p>
      <form onSubmit={handleRedeem} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ENTER PROMO CODE"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-400/50 outline-none text-white font-mono font-bold uppercase text-xs tracking-wider"
        />
        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition disabled:opacity-50 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
        </button>
      </form>
    </div>
  );
}

function ReferralRewardsCard({ onOpenLogin }: { onOpenLogin: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: referralRes, isLoading } = useGetReferralStatsQuery(undefined, { skip: !user });
  const referralStats = referralRes?.data;
  const [copied, setCopied] = useState(false);

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

