"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Calendar,
  Coins,
  Globe,
  Layers,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "bn", name: "Bangla", flag: "🇧🇩" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
];

interface ChapterMetadataFieldsProps {
  formData: {
    seriesId: string;
    number: number | string;
    title: string;
    language?: string;
    isLocked: boolean;
    isFastPass: boolean;
    publishAt: string;
    coinCost: number;
  };
  seriesList: { id: string; title: string; coverUrl?: string }[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function ChapterMetadataFields({
  formData,
  seriesList,
  onInputChange,
}: ChapterMetadataFieldsProps) {
  const selectedSeries = seriesList.find((s) => s.id === formData.seriesId);
  const currentLang = formData.language || "en";

  return (
    <div className="space-y-5">
      {/* 1. Series & Language Configuration */}
      <div className="glass p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4 bg-neutral-900/60 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
            <BookOpen className="w-4 h-4 text-primary" />
            Series & Language
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            Step 1
          </span>
        </div>

        {/* Series Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="seriesId" className="text-xs font-semibold text-zinc-300">
            Target Comic Series
          </Label>
          <div className="relative">
            <select
              id="seriesId"
              value={formData.seriesId}
              onChange={onInputChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none transition"
              required
            >
              {seriesList.map((s) => (
                <option key={s.id} value={s.id} className="bg-neutral-900 text-white">
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          {selectedSeries && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Selected: <strong className="text-white font-medium truncate max-w-[200px]">{selectedSeries.title}</strong>
            </p>
          )}
        </div>

        {/* Translation Language Selector with Quick Pills */}
        <div className="space-y-2 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between">
            <Label htmlFor="language" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" /> Translation Language
            </Label>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
              {currentLang.toUpperCase()}
            </span>
          </div>

          {/* Quick Language Selection Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const syntheticEvent = {
                  target: { id: "language", value: "en", type: "select" },
                } as any;
                onInputChange(syntheticEvent);
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                currentLang === "en"
                  ? "bg-primary/15 border-primary text-primary shadow-sm ring-1 ring-primary/30"
                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base">🇬🇧</span>
              <span>English (EN)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const syntheticEvent = {
                  target: { id: "language", value: "bn", type: "select" },
                } as any;
                onInputChange(syntheticEvent);
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                currentLang === "bn"
                  ? "bg-primary/15 border-primary text-primary shadow-sm ring-1 ring-primary/30"
                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base">🇧🇩</span>
              <span>Bangla (BN)</span>
            </button>
          </div>

          {/* Full Language Selector for other languages */}
          <select
            id="language"
            value={currentLang}
            onChange={onInputChange}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                {lang.flag} {lang.name} ({lang.code.toUpperCase()})
              </option>
            ))}
          </select>

          <p className="text-[10px] text-muted-foreground flex items-center gap-1 leading-relaxed">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            Upload English and Bangla versions under the same chapter number seamlessly.
          </p>
        </div>
      </div>

      {/* 2. Chapter Metadata Card */}
      <div className="glass p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4 bg-neutral-900/60 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Layers className="w-4 h-4 text-primary" />
            Chapter Details
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            Step 2
          </span>
        </div>

        {/* Chapter Number */}
        <div className="space-y-1.5">
          <Label htmlFor="number" className="text-xs font-semibold text-zinc-300">
            Chapter Number <span className="text-rose-400">*</span>
          </Label>
          <div className="relative">
            <Input
              id="number"
              type="number"
              step="0.1"
              required
              value={formData.number}
              onChange={onInputChange}
              className="bg-black/40 border-white/10 rounded-xl h-11 text-base font-bold text-white pl-4 focus:ring-primary/50"
              placeholder="e.g. 1 or 1.5"
            />
          </div>
        </div>

        {/* Chapter Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs font-semibold text-zinc-300">
            Chapter Title <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g. The Return of the Shadow Lord"
            value={formData.title}
            onChange={onInputChange}
            className="bg-black/40 border-white/10 rounded-xl h-10 text-sm text-white focus:ring-primary/50"
          />
        </div>

        {/* Scheduled Release */}
        <div className="space-y-1.5 pt-1">
          <Label htmlFor="publishAt" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Scheduled Release
          </Label>
          <Input
            id="publishAt"
            type="datetime-local"
            value={formData.publishAt}
            onChange={onInputChange}
            className="bg-black/40 border-white/10 rounded-xl h-10 text-xs text-white focus:ring-primary/50"
          />
          <p className="text-[10px] text-muted-foreground">
            Leave blank to publish immediately upon saving.
          </p>
        </div>
      </div>

      {/* 3. Monetization & Access Card */}
      <div className="glass p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4 bg-neutral-900/60 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Coins className="w-4 h-4 text-amber-400" />
            Monetization & Access
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            Step 3
          </span>
        </div>

        <div className="space-y-3">
          {/* Lock Chapter Toggle */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition cursor-pointer">
            <input
              type="checkbox"
              id="isLocked"
              checked={formData.isLocked}
              onChange={onInputChange}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black/60 text-primary focus:ring-primary/50 cursor-pointer"
            />
            <div className="space-y-0.5 flex-1">
              <span className="text-xs font-bold flex items-center gap-1.5 text-white">
                <Lock className="w-3 h-3 text-primary" /> Lock Chapter (Coin Paywall)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Readers must spend coins to unlock and read this chapter.
              </p>
            </div>
          </label>

          {/* Coin Cost Input (conditional appearance) */}
          {formData.isLocked && (
            <div className="p-3.5 rounded-2xl bg-primary/[0.04] border border-primary/20 space-y-1.5 animate-in fade-in duration-200">
              <Label htmlFor="coinCost" className="text-xs font-bold text-primary flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> Coin Unlock Price
              </Label>
              <div className="relative">
                <Input
                  id="coinCost"
                  type="number"
                  min="1"
                  value={formData.coinCost}
                  onChange={onInputChange}
                  className="bg-black/60 border-primary/30 rounded-xl h-10 text-sm font-bold text-white pl-3 pr-12 focus:ring-primary/50"
                  placeholder="20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                  COINS
                </span>
              </div>
            </div>
          )}

          {/* FastPass Early Access */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/[0.03] border border-amber-500/15 hover:border-amber-500/25 transition cursor-pointer">
            <input
              type="checkbox"
              id="isFastPass"
              checked={formData.isFastPass}
              onChange={onInputChange}
              className="mt-0.5 w-4 h-4 rounded border-amber-500/30 bg-black/60 text-amber-400 focus:ring-amber-400/50 cursor-pointer"
            />
            <div className="space-y-0.5 flex-1">
              <span className="text-xs font-bold flex items-center gap-1.5 text-amber-300">
                <Zap className="w-3 h-3 text-amber-400" /> FastPass Early Access
              </span>
              <p className="text-[11px] text-muted-foreground">
                Offer ahead-of-schedule early reading for passionate fans.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
