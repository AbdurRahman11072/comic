"use client";

import { useState, useEffect, useRef } from "react";
import { PlayCircle, Loader2, Sparkles, CheckCircle2, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { useGetAdByPlacementQuery, useRecordAdImpressionMutation, useRecordAdClickMutation, useEarnAdPointsMutation } from "@/redux/api/adApi";
import { toast } from "react-hot-toast";

interface AdPlayerProps {
  onAdComplete: (rewardInfo?: any) => void;
  placement?: string;
  autoClaimPoints?: boolean;
}

export function AdPlayer({
  onAdComplete,
  placement = "rewarded_unlock",
  autoClaimPoints = true,
}: AdPlayerProps) {
  const { data: adRes, isLoading: adLoading } = useGetAdByPlacementQuery(placement);
  const [recordImpression] = useRecordAdImpressionMutation();
  const [recordClick] = useRecordAdClickMutation();
  const [earnPoints, { isLoading: claiming }] = useEarnAdPointsMutation();

  const [timeLeft, setTimeLeft] = useState(6);
  const [adStarted, setAdStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [muted, setMuted] = useState(true);
  const impressionLogged = useRef(false);

  const ad = adRes?.data;
  const rewardPoints = ad?.points || 10;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && adStarted && !completed) {
      setCompleted(true);
    }
    return () => clearInterval(timer);
  }, [adStarted, timeLeft, completed]);

  const handleStart = () => {
    setAdStarted(true);
    if (ad?.id && !impressionLogged.current) {
      impressionLogged.current = true;
      recordImpression(ad.id).catch(() => null);
    }
  };

  const handleFinish = async () => {
    if (autoClaimPoints) {
      try {
        const res = await earnPoints({ adId: ad?.id }).unwrap();
        if (res.success) {
          toast.success(`🎉 Earned +${res.data.earnedPoints} Points!`);
          if ((window as any).__refreshNavPoints) {
            (window as any).__refreshNavPoints();
          }
          onAdComplete(res.data);
          return;
        }
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to award ad points");
      }
    }
    onAdComplete();
  };

  if (!adStarted) {
    return (
      <div className="w-full max-w-2xl mx-auto aspect-video bg-gradient-to-br from-white/[0.05] to-black/40 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4 relative overflow-hidden shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
          <PlayCircle className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-bold text-white">Sponsored Interactive Ad</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
              +{rewardPoints} PTS
            </span>
          </div>
          <p className="text-muted-foreground text-xs max-w-md mx-auto leading-relaxed">
            Watch a quick 6-second sponsor message to earn free points and support creators.
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={adLoading}
          className="relative z-10 px-8 py-3.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/25 cursor-pointer flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Watch Ad & Earn {rewardPoints} Pts
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto aspect-video bg-black border border-white/15 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
      {/* Visual background / Video */}
      {ad?.videoUrl ? (
        <video
          src={ad.videoUrl}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : ad?.imageUrl ? (
        <img
          src={ad.imageUrl}
          alt={ad.title || "Sponsored"}
          className="w-full h-full object-cover animate-pulse duration-1000"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 via-black to-purple-900/40">
          <div className="text-center space-y-2 p-6">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
              SPONSORED PARTNER
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
              {ad?.title || "GENZ TOON PARTNER NETWORK"}
            </h2>
            <p className="text-xs text-white/70">Support quality manhwa translation and original creators.</p>
          </div>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white/80 border border-white/10 uppercase tracking-wider">
          {ad?.provider || "SPONSOR"} AD
        </span>

        <div className="flex items-center gap-2">
          {ad?.videoUrl && (
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white border border-white/10"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {timeLeft > 0 ? (
            <div className="px-4 py-1.5 bg-black/70 backdrop-blur-md border border-white/15 rounded-full text-xs font-semibold flex items-center gap-2 text-white shadow-lg">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              Reward in {timeLeft}s
            </div>
          ) : (
            <button
              onClick={handleFinish}
              disabled={claiming}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 backdrop-blur-md text-white font-bold text-xs rounded-full transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 cursor-pointer animate-bounce"
            >
              {claiming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Claim +{rewardPoints} Pts
            </button>
          )}
        </div>
      </div>

      {/* Bottom Sponsor Info & Action */}
      {ad?.linkUrl && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10">
          <div className="truncate mr-3">
            <div className="text-xs font-bold text-white truncate">{ad.title || "Learn More"}</div>
            <div className="text-[10px] text-muted-foreground truncate">{ad.linkUrl}</div>
          </div>
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (ad.id) recordClick(ad.id).catch(() => null);
            }}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-primary text-white text-[11px] font-bold transition-colors cursor-pointer"
          >
            <span>Visit</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
