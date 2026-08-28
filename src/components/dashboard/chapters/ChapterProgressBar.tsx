"use client";

import React from "react";
import { Loader2 } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-card border border-border text-card-foreground shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
        {/* Clean Spinner with Percentage */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          {/* Background Track */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-muted/30"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Active Primary Track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-primary transition-all duration-200 ease-out"
              strokeWidth="6"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * Math.max(0, Math.min(100, progressInfo.percent))) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Percentage */}
          <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-foreground">
            {progressInfo.percent}%
          </span>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            {progressInfo.title}
          </h3>
          {progressInfo.statusText && (
            <p className="text-xs text-muted-foreground truncate">
              {progressInfo.statusText}
            </p>
          )}
        </div>

        {/* Solid Primary Linear Progress Bar (Global CSS color) */}
        <div className="space-y-1">
          <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-200 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, progressInfo.percent))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {progressInfo.total > 0 ? `${progressInfo.current} / ${progressInfo.total}` : ""}
            </span>
            <span>{progressInfo.percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
