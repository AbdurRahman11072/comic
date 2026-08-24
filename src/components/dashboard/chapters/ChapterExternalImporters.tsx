"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Archive,
  DownloadCloud,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";

export type IngestionMode = "files" | "zip" | "scraper" | "url";

interface ChapterExternalImportersProps {
  activeTab: IngestionMode;
  isDragOverDropzone: boolean;
  isBusy: boolean;
  isScrapingUrl: boolean;
  webpageUrlInput: string;
  imageUrlInput: string;
  onActiveTabChange: (tab: IngestionMode) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onOpenImageInput: () => void;
  onOpenZipInput: () => void;
  onWebpageUrlChange: (val: string) => void;
  onImageUrlChange: (val: string) => void;
  onScrapeWebpageUrl: () => void;
  onAddImageUrl: () => void;
}

export function ChapterExternalImporters({
  activeTab,
  isDragOverDropzone,
  isBusy,
  isScrapingUrl,
  webpageUrlInput,
  imageUrlInput,
  onActiveTabChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpenImageInput,
  onOpenZipInput,
  onWebpageUrlChange,
  onImageUrlChange,
  onScrapeWebpageUrl,
  onAddImageUrl,
}: ChapterExternalImportersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Upload & Ingestion Mode
        </Label>
        <span className="text-[11px] text-primary font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Auto Numerical Sorting
        </span>
      </div>

      {/* Segmented Tab Buttons */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/5">
        <button
          type="button"
          onClick={() => onActiveTabChange("files")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "files"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Images</span>
        </button>

        <button
          type="button"
          onClick={() => onActiveTabChange("zip")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "zip"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ZIP / CBZ</span>
        </button>

        <button
          type="button"
          onClick={() => onActiveTabChange("scraper")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "scraper"
              ? "bg-blue-600 text-white shadow-md"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">URL Scraper</span>
        </button>

        <button
          type="button"
          onClick={() => onActiveTabChange("url")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "url"
              ? "bg-white/20 text-white shadow-md"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Direct Link</span>
        </button>
      </div>

      {/* Active Tab Panel Content */}
      <div className="pt-1">
        {/* TAB 1: Images Dropzone */}
        {activeTab === "files" && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !isBusy && onOpenImageInput()}
            className={`relative w-full rounded-2xl p-6 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer ${
              isDragOverDropzone
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-white/15 bg-background/50 hover:bg-white/5"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">Click or drag & drop multiple images here</p>
              <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP, AVIF — Auto-sorted numerically</p>
            </div>
          </div>
        )}

        {/* TAB 2: ZIP / CBZ Archive */}
        {activeTab === "zip" && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !isBusy && onOpenZipInput()}
            className={`relative w-full rounded-2xl p-6 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer ${
              isDragOverDropzone
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-purple-500/20 bg-purple-500/[0.03] hover:bg-purple-500/[0.07]"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
              <Archive className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">Choose or drop a .ZIP or .CBZ chapter package</p>
              <p className="text-[10px] text-purple-300/80">Unpacks directly in your browser and arranges pages (01, 02...)</p>
            </div>
          </div>
        )}

        {/* TAB 3: Webpage URL Scraper */}
        {activeTab === "scraper" && (
          <div className="p-4 rounded-2xl bg-blue-500/[0.04] border border-blue-500/15 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="webpageUrl" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Webtoon / Manga Webpage Scraper
              </Label>
              <span className="text-[10px] text-muted-foreground">Auto-extracts comic reader panels</span>
            </div>
            <div className="flex gap-2">
              <Input
                id="webpageUrl"
                placeholder="Paste chapter URL (e.g. https://site.com/series/ch-1)..."
                value={webpageUrlInput}
                disabled={isBusy}
                onChange={(e) => onWebpageUrlChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onScrapeWebpageUrl();
                  }
                }}
                className="text-xs h-9 bg-background/60 rounded-xl"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isBusy || !webpageUrlInput.trim()}
                onClick={onScrapeWebpageUrl}
                className="shrink-0 h-9 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl px-4 shadow-md cursor-pointer"
              >
                {isScrapingUrl ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <DownloadCloud className="w-3.5 h-3.5 mr-1" /> Extract
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* TAB 4: Direct Image URL */}
        {activeTab === "url" && (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <Label htmlFor="directUrl" className="text-xs font-semibold text-foreground">
              Single Direct Image URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="directUrl"
                placeholder="Paste direct image link (e.g. https://cdn.com/page1.jpg)..."
                value={imageUrlInput}
                disabled={isBusy}
                onChange={(e) => onImageUrlChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddImageUrl();
                  }
                }}
                className="text-xs h-9 bg-background/60 rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy || !imageUrlInput.trim()}
                onClick={onAddImageUrl}
                className="shrink-0 h-9 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
