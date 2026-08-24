"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Coins, Flame } from "lucide-react";
import { adService, CustomAdItem } from "@/services/ad.service";
import { EarnFromAdAction } from "@/actions/points";
import { usePoints } from "@/providers/PointsProvider";
import { LoginDialog } from "@/components/home/LoginDialog";

import { AdPackCard } from "./AdPackCard";
import { PromoRedeemBox } from "./PromoRedeemBox";
import { ReferralRewardsCard } from "./ReferralRewardsCard";

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
  const {
    points: userPoints,
    dailyAdViews: totalDailyViews,
    dailyAdPointsEarned: totalDailyPoints,
    updateBalance,
    refreshPoints,
  } = usePoints();

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
  const [pointsEarned, setPointsEarned] = useState(0);

  // Helper to persist current pack progress in localStorage
  const persistPack = useCallback(
    (
      newWatched: number,
      newTarget: number = targetAds,
      newPackId: number = packId,
      isClaiming: boolean = claiming
    ) => {
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

  const completeReward = async () => {
    setVerifying(false);
    const adBonus =
      customAd && typeof customAd.points === "number" && !isNaN(customAd.points)
        ? customAd.points
        : 0;
    const basePoints = (Number(targetAds) || 5) * 10;
    const totalPoints = Number.isFinite(basePoints + adBonus)
      ? Math.min(basePoints + adBonus, 150)
      : 50;

    try {
      const res = await EarnFromAdAction({ amount: totalPoints, adsCount: targetAds });
      if (!res.success) throw new Error(res.message || "Failed to earn points");

      if (res.data?.points !== undefined) {
        updateBalance(res.data.points, res.data.dailyAdViews);
      } else {
        refreshPoints();
      }

      setPointsEarned(totalPoints);
      setDone(true);

      // Clear completed pack from local storage
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}

      toast.success(`🎉 You earned ${totalPoints} points!`, { duration: 5000 });
    } catch (error: any) {
      console.error("Failed to earn points:", error);
      toast.error(error?.message || "Error earning points. Please try again.");
      setDone(false);
    }
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

  const startVerification = () => {
    const randomWait = Math.floor(Math.random() * 51) + 10; // 10-60s
    setVerificationTimeLeft(randomWait);
    setVerifying(true);
    setClaiming(false);
    toast("Verifying your visit... Please wait.", { icon: "⏳", duration: 4000 });
  };

  const handleClaimClick = () => {
    persistPack(watchedAds, targetAds, packId, true);
    if (customAd && customAd.adType === "SOCIAL" && customAd.linkUrl) {
      window.open(customAd.linkUrl, "_blank");
      startVerification();
    } else {
      setClaiming(true);
    }
  };

  const handleFinalAdClick = () => {
    const adLink = customAd?.linkUrl || "https://example.com/sponsor";
    window.open(adLink, "_blank");
    startVerification();
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

  return (
    <div className="relative overflow-hidden w-full">
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[48rem] w-full mx-auto px-4 py-12 relative z-10 flex flex-col items-center">
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
                <span>{userPoints ?? (session?.user as any)?.points ?? 0} Points</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Flame className="w-4 h-4" />
                <span>
                  Today: {totalDailyViews} Ads Watched ({totalDailyPoints} P earned)
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Ad Pack Card */}
        <AdPackCard
          session={session}
          done={done}
          claiming={claiming}
          verifying={verifying}
          watching={watching}
          packId={packId}
          targetAds={targetAds}
          watchedAds={watchedAds}
          progress={progress}
          verificationTimeLeft={verificationTimeLeft}
          pointsEarned={pointsEarned}
          customAd={customAd}
          onOpenLogin={() => setLoginOpen(true)}
          onWatchAd={handleWatchAd}
          onClaimClick={handleClaimClick}
          onFinalAdClick={handleFinalAdClick}
          onResetFlow={resetFlow}
        />

        {/* Bottom Reward Options (Promo Code & Referral Program) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-8">
          <PromoRedeemBox />
          <ReferralRewardsCard onOpenLogin={() => setLoginOpen(true)} />
        </div>
      </div>

      {/* Direct Login Modal on Rewards Page */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onAuthSuccess={() => setLoginOpen(false)}
      />
    </div>
  );
}
