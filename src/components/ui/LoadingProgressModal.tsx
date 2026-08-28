"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ProgressState {
  title: string;
  current?: number;
  total?: number;
  percent?: number;
  statusText?: string;
}

export interface LoadingProgressModalProps {
  open?: boolean;
  progressInfo?: ProgressState | null;
  title?: string;
  percent?: number;
  current?: number;
  total?: number;
  statusText?: string;
}

export function LoadingProgressModal({
  open,
  progressInfo,
  title: directTitle,
  percent: directPercent,
  current: directCurrent,
  total: directTotal,
  statusText: directStatusText,
}: LoadingProgressModalProps) {
  // Determine if modal should be visible
  const isVisible = open !== undefined ? open : Boolean(progressInfo);
  if (!isVisible) return null;

  const title = progressInfo?.title || directTitle || "Processing...";
  const percent = progressInfo?.percent !== undefined ? progressInfo.percent : directPercent;
  const current = progressInfo?.current !== undefined ? progressInfo.current : directCurrent;
  const total = progressInfo?.total !== undefined ? progressInfo.total : directTotal;
  const statusText = progressInfo?.statusText || directStatusText;

  const hasPercent = percent !== undefined && percent !== null;
  const safePercent = hasPercent ? Math.max(0, Math.min(100, percent)) : 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-card border border-border text-card-foreground shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
        {/* Spinner Area */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          {hasPercent ? (
            <>
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
                  strokeDashoffset={251.2 - (251.2 * safePercent) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              {/* Percentage */}
              <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-foreground">
                {safePercent}%
              </span>
            </>
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            {title}
          </h3>
          {statusText && (
            <p className="text-xs text-muted-foreground truncate">
              {statusText}
            </p>
          )}
        </div>

        {/* Solid Primary Linear Progress Bar (Global CSS color) */}
        {hasPercent && (
          <div className="space-y-1">
            <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-200 ease-out"
                style={{ width: `${safePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {total && total > 0 ? `${current || 0} / ${total}` : ""}
              </span>
              <span>{safePercent}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
