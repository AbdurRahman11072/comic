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
    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 space-y-2.5 shadow-lg animate-in fade-in duration-300">
      <div className="flex items-center justify-between text-xs font-semibold text-primary">
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
          <span>{progressInfo.title}</span>
        </span>
        <span className="font-bold text-xs bg-primary/20 px-2.5 py-0.5 rounded-full text-primary border border-primary/30">
          {progressInfo.percent}%
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden p-0.5">
        <div
          className="bg-gradient-to-r from-primary to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(var(--primary),0.5)]"
          style={{ width: `${Math.max(5, progressInfo.percent)}%` }}
        />
      </div>
      {progressInfo.statusText && (
        <p className="text-[11px] text-muted-foreground font-mono truncate">
          {progressInfo.statusText}
        </p>
      )}
    </div>
  );
}
