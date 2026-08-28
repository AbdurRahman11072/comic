"use client";

import React from "react";
import { CheckCircle2, Loader2, Sparkles, UploadCloud } from "lucide-react";

export interface ProgressState {
  title: string;
  current: number;
  total: number;
  percent: number;
  statusText?: string;
}

interface ChapterProgressBarProps {
  progressInfo: ProgressState | null;
}

export function ChapterProgressBar({ progressInfo }: ChapterProgressBarProps) {
  if (!progressInfo) return null;

  const isCompleted = progressInfo.percent >= 100;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0e0e14] border border-white/15 shadow-2xl space-y-6 text-center overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central Circular Animated Spinner */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          {/* Outer Pulsing Ring */}
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-25" />
          <div className="absolute inset-1 rounded-full border border-primary/30" />

          {/* SVG Circular Progress Track */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-white/10"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-primary transition-all duration-300 ease-out"
              strokeWidth="6"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * Math.max(5, progressInfo.percent)) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Percent & Icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isCompleted ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-in zoom-in-50 duration-200" />
            ) : (
              <span className="text-xl font-black text-white tracking-tight">
                {progressInfo.percent}%
              </span>
            )}
          </div>
        </div>

        {/* Title & Status Info */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-white tracking-tight flex items-center justify-center gap-2">
            {!isCompleted && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            {progressInfo.title}
          </h3>
          {progressInfo.statusText && (
            <p className="text-xs text-zinc-400 font-medium px-2 leading-relaxed truncate">
              {progressInfo.statusText}
            </p>
          )}
        </div>

        {/* Horizontal Linear Progress Track */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden p-0.5 shadow-inner">
            <div
              className="bg-gradient-to-r from-primary via-emerald-400 to-primary h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(var(--primary),0.8)]"
              style={{ width: `${Math.max(5, progressInfo.percent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>
              {progressInfo.current > 0 ? `Item ${progressInfo.current} of ${progressInfo.total}` : "Processing..."}
            </span>
            <span>{progressInfo.percent}% Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
