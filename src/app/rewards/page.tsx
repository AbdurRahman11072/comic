"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { EarnFromAdAction } from "@/actions/points";
import { useSession } from "@/lib/auth-client";
import { redirect, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "react-hot-toast";
import {
  Loader2, Play, Gift, AlertCircle,
  X, ExternalLink, CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";

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

export default function RewardsPage() {
  return (
    <Suspense fallback={null}>
      <RewardsContent />
    </Suspense>
  );
}

function RewardsContent() {
  const { data: session, isPending } = useSession();
  const searchParams = useSearchParams();

  // Ad Pack State
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
  const [customAd, setCustomAd] = useState<CustomAd | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  const generateTarget = useCallback(() => Math.floor(Math.random() * 11) + 5, []);

  useEffect(() => {
    setTargetAds(generateTarget());
  }, [generateTarget]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Payment successful! Your points have been added.");
      if ((window as any).__refreshNavPoints) (window as any).__refreshNavPoints();
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isPending && !session) redirect("/");
  }, [session, isPending]);

  // Fetch custom ad on mount
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await api.get("/ads/active");
        if (res.data.success && res.data.data) {
          setCustomAd(res.data.data);
        }
      } catch (err) {
        // Silently fall back to no custom ad
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
        setWatchedAds((prev) => prev + 1);
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
    // If there's a custom ad, show it based on type
    if (customAd) {
      if (customAd.adType === "VIDEO" && customAd.videoUrl) {
        setVideoModalOpen(true);
      } else if (customAd.adType === "SOCIAL") {
        // Open the social page for subscription
        window.open(customAd.linkUrl, "_blank");
        startVerification();
      } else {
        // BANNER - open the link
        setClaiming(true);
      }
    } else {
      // No custom ad - go directly to claiming flow
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

  const completeReward = async () => {
    setVerifying(false);
    const adBonus = customAd ? customAd.points : 0;
    const basePoints = targetAds * 10;
    const totalPoints = basePoints + adBonus;

    try {
      const res = await EarnFromAdAction(totalPoints);
      if (!res.success) throw new Error(res.message);

      if ((window as any).__refreshNavPoints) (window as any).__refreshNavPoints();

      setPointsEarned(totalPoints);
      setDone(true);
      toast.success(`🎉 You earned ${totalPoints} points!`, { duration: 5000 });
    } catch (error) {
      console.error("Failed to earn points:", error);
      toast.error("Error earning points. Please try again.");
      setDone(false);
    }
  };

  const resetFlow = () => {
    setTargetAds(generateTarget());
    setWatchedAds(0);
    setProgress(0);
    setClaiming(false);
    setVerifying(false);
    setDone(false);
    setPointsEarned(0);
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

      {/* Background blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-1 max-w-[48rem] w-full mx-auto px-4 py-12 relative z-10 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading tracking-tight mb-4">Rewards Center</h1>
          <p className="text-muted-foreground text-lg">
            Complete the Ad Pack to earn massive points for your favorite series!
          </p>
        </div>

        {/* Dynamic Ad Pack Card */}
        <div className="w-full max-w-lg glass p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[60px] pointer-events-none" />

          {done ? (
            // ✅ Done State
            <div className="flex flex-col items-center text-center space-y-6 py-4">
              <CheckCircle2 className="w-20 h-20 text-emerald-400" />
              <div>
                <h2 className="text-3xl font-black text-emerald-400">+{pointsEarned} Points!</h2>
                <p className="text-muted-foreground mt-2">Points have been added to your account.</p>
              </div>
              <button
                onClick={resetFlow}
                className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Watch Another Pack
              </button>
            </div>

          ) : claiming ? (
            // State 2: Final Ad Click
            <div className="flex flex-col items-center text-center space-y-6">
              <Gift className="w-16 h-16 text-yellow-500 animate-bounce" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Final Step!</h2>
                <p className="text-muted-foreground text-sm">
                  Click the sponsored banner below to claim your {targetAds * 10 + (customAd?.points || 0)} points.
                </p>
              </div>

              {customAd ? (
                <button
                  onClick={handleFinalAdClick}
                  className="w-full aspect-video rounded-xl overflow-hidden relative group border-2 border-primary/30 hover:border-primary transition-colors"
                >
                  <img
                    src={customAd.imageUrl}
                    alt={customAd.title}
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
                  className="w-full py-4 rounded-2xl border-2 border-primary/30 hover:border-primary text-primary font-bold flex items-center justify-center gap-2 transition-all hover:bg-primary/5"
                >
                  <ExternalLink className="w-5 h-5" /> Visit Sponsor & Claim
                </button>
              )}
            </div>

          ) : verifying ? (
            // State 3: Verifying
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
            // State 1: Watching Ads
            <div className="flex flex-col items-center space-y-8">
              {/* Progress Circle */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                    className="text-primary transition-all duration-500 ease-out"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - watchedAds / targetAds)}`}
                  />
                </svg>
                <div className="flex flex-col items-center text-center">
                  <span className="text-4xl font-bold">{watchedAds}</span>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">of {targetAds}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Ads Watched</span>
                </div>
              </div>

              {/* Reward preview */}
              <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                <p className="text-xs text-muted-foreground mb-1">Pack Reward</p>
                <p className="text-2xl font-black text-yellow-400">
                  {targetAds * 10 + (customAd?.points || 0)} Points
                </p>
                {customAd && customAd.points > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ({targetAds * 10} ad pack + {customAd.points} bonus from sponsor)
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="w-full space-y-4">
                {isReadyToClaim ? (
                  <button
                    onClick={handleClaimClick}
                    className="w-full py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-black text-lg shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Gift className="w-6 h-6" /> Claim {targetAds * 10 + (customAd?.points || 0)} Points!
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleWatchAd}
                      disabled={watching}
                      className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {watching ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Watching...</>
                      ) : (
                        <><Play className="w-5 h-5 fill-current" /> Watch Next Ad</>
                      )}
                    </button>

                    {/* Watch Progress Bar */}
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-75 ease-linear"
                        style={{ width: `${watching ? progress : 0}%` }}
                      />
                    </div>

                    {/* Custom Ad preview (if SOCIAL type) */}
                    {customAd && customAd.adType === "SOCIAL" && (
                      <div className="glass border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                        <div className="text-primary">{socialIcon(customAd.socialPlatform)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Bonus Action Available</p>
                          <p className="text-sm font-bold text-white">{socialActionLabel(customAd.socialPlatform)}</p>
                        </div>
                        <span className="text-yellow-400 text-xs font-bold shrink-0">+{customAd.points}pts</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-2 text-muted-foreground text-sm max-w-md text-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          You can earn points continuously by completing Ad Packs. The number of required ads is randomized between 5 and 15!
        </div>
      </main>

      {/* VIDEO AD MODAL */}
      {videoModalOpen && customAd?.videoUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-neutral-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <p className="text-sm font-bold text-white">Watch this video to earn your bonus reward</p>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition text-muted-foreground hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {customAd.videoUrl.includes("youtube.com") || customAd.videoUrl.includes("youtu.be") ? (
                <iframe
                  src={customAd.videoUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video
                  src={customAd.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="p-4 flex justify-end">
              <button
                onClick={handleVideoWatched}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <CheckCircle2 className="w-4 h-4" /> I&apos;ve Watched — Claim Reward
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
