"use client";

import { useState, useEffect } from "react";
import { PlayCircle, Loader2 } from "lucide-react";

interface AdPlayerProps {
  onAdComplete: () => void;
}

export function AdPlayer({ onAdComplete }: AdPlayerProps) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [adStarted, setAdStarted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // automatically complete or let them click skip
    }
    return () => clearInterval(timer);
  }, [adStarted, timeLeft]);

  if (!adStarted) {
    return (
      <div className="w-full max-w-2xl mx-auto aspect-video bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4">
        <PlayCircle className="w-16 h-16 text-primary mb-2" />
        <h3 className="text-xl font-bold">Advertisement</h3>
        <p className="text-muted-foreground text-sm">Please watch this short ad to support the creator and unlock this free chapter.</p>
        <button 
          onClick={() => setAdStarted(true)}
          className="mt-4 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20"
        >
          Watch Ad
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto aspect-video bg-black border border-white/10 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
      {/* Fake Video Ad Content */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
        <h2 className="text-4xl font-black text-white/50 animate-pulse tracking-widest uppercase">SPONSOR MESSAGE</h2>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {timeLeft > 0 ? (
          <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium flex items-center gap-2 text-white">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Reward in {timeLeft}s
          </div>
        ) : (
          <button 
            onClick={onAdComplete}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-sm font-bold text-white transition flex items-center gap-2"
          >
            Skip Ad & Read
          </button>
        )}
      </div>
    </div>
  );
}
