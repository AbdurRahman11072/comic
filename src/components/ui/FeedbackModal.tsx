"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FeedbackState {
  type: "success" | "error" | "info";
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

interface FeedbackModalProps {
  feedback: FeedbackState | null;
  onClose: () => void;
}

export function FeedbackModal({ feedback, onClose }: FeedbackModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!feedback || !mounted) return null;

  const isSuccess = feedback.type === "success";
  const isError = feedback.type === "error";

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border text-card-foreground shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-center relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition p-1 rounded-lg hover:bg-muted cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Status Icon */}
        <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center">
          {isSuccess && (
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          )}
          {isError && (
            <div className="w-14 h-14 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
          )}
          {!isSuccess && !isError && (
            <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
              <Info className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title & Message */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-foreground">
            {feedback.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed px-2 whitespace-pre-line">
            {feedback.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {feedback.secondaryActionText && (
            <Button
              type="button"
              variant="outline"
              onClick={feedback.onSecondaryAction || onClose}
              className="rounded-xl text-xs h-9 px-4 cursor-pointer"
            >
              {feedback.secondaryActionText}
            </Button>
          )}
          <Button
            type="button"
            onClick={feedback.onAction || onClose}
            className={`rounded-xl text-xs font-bold h-9 px-6 cursor-pointer ${
              isError
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {feedback.actionText || "OK"}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
