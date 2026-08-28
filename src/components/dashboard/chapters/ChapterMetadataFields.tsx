"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Coins, Globe, Layers, Lock, Zap } from "lucide-react";

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
  seriesList: { id: string; title: string }[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function ChapterMetadataFields({
  formData,
  seriesList,
  onInputChange,
}: ChapterMetadataFieldsProps) {
  return (
    <div className="glass p-6 rounded-3xl border border-white/10 space-y-5 bg-neutral-900/40 backdrop-blur-xl">
      <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
        <Layers className="w-4 h-4 text-primary" />
        Chapter Settings
      </h2>

      {/* Select Series */}
      <div className="space-y-2">
        <Label htmlFor="seriesId" className="text-xs font-semibold">Select Series</Label>
        <select
          id="seriesId"
          value={formData.seriesId}
          onChange={onInputChange}
          className="w-full bg-background/60 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-10"
          required
        >
          {seriesList.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {/* Chapter Language & Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="language" className="text-xs font-semibold flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" /> Translation Language
          </Label>
          <select
            id="language"
            value={formData.language || "en"}
            onChange={onInputChange}
            className="w-full bg-background/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 h-10 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                {lang.flag} {lang.name} ({lang.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="number" className="text-xs font-semibold">Chapter #</Label>
          <Input
            id="number"
            type="number"
            step="0.1"
            required
            value={formData.number}
            onChange={onInputChange}
            className="bg-background/60 rounded-xl h-10 text-sm font-semibold"
          />
        </div>
      </div>

      {/* Coin Cost */}
      <div className="space-y-1.5">
        <Label htmlFor="coinCost" className="text-xs font-semibold flex items-center gap-1">
          <Coins className="w-3 h-3 text-amber-400" /> Coin Cost
        </Label>
        <Input
          id="coinCost"
          type="number"
          value={formData.coinCost}
          onChange={onInputChange}
          className="bg-background/60 rounded-xl h-10 text-sm font-semibold"
        />
      </div>

      {/* Chapter Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-semibold">Chapter Title (Optional)</Label>
        <Input
          id="title"
          placeholder="e.g. The Awakening Part 1"
          value={formData.title}
          onChange={onInputChange}
          className="bg-background/60 rounded-xl h-10 text-sm"
        />
      </div>

      {/* Schedule Release */}
      <div className="space-y-1.5">
        <Label htmlFor="publishAt" className="text-xs font-semibold flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Scheduled Release
        </Label>
        <Input
          id="publishAt"
          type="datetime-local"
          value={formData.publishAt}
          onChange={onInputChange}
          className="bg-background/60 rounded-xl h-10 text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Leave empty to publish immediately.
        </p>
      </div>

      {/* Monetization Switches */}
      <div className="pt-3 border-t border-white/5 space-y-3">
        <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer">
          <input
            type="checkbox"
            id="isLocked"
            checked={formData.isLocked}
            onChange={onInputChange}
            className="w-4 h-4 rounded border-white/10 bg-background/50 text-primary focus:ring-primary/50 cursor-pointer"
          />
          <div className="space-y-0.5 text-left">
            <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
              <Lock className="w-3 h-3 text-primary" /> Lock Chapter
            </span>
            <p className="text-[10px] text-muted-foreground">Requires readers to spend coins to unlock</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 hover:border-amber-500/20 transition cursor-pointer">
          <input
            type="checkbox"
            id="isFastPass"
            checked={formData.isFastPass}
            onChange={onInputChange}
            className="w-4 h-4 rounded border-white/10 bg-background/50 text-amber-400 focus:ring-amber-400/50 cursor-pointer"
          />
          <div className="space-y-0.5 text-left">
            <span className="text-xs font-bold flex items-center gap-1.5 text-amber-300">
              <Zap className="w-3 h-3 text-amber-400" /> FastPass Early Access
            </span>
            <p className="text-[10px] text-muted-foreground">Unlock ahead of free schedule</p>
          </div>
        </label>
      </div>
    </div>
  );
}
