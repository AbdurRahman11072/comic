"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Archive,
  DownloadCloud,
  FileImage,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Plus,
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
    <div className="space-y-4">
      {/* Header & Feature Tip */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-primary" />
            Media Ingestion Workspace
          </Label>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary">
          <Sparkles className="w-3 h-3" />
          <span>Auto Numerical Sorting Active</span>
        </div>
      </div>

      {/* Segmented Mode Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-black/50 border border-white/10 shadow-inner">
        <button
          type="button"
          onClick={() => onActiveTabChange("files")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "files"
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image Files</span>
        </button>

        <button
          type="button"
          onClick={() => onActiveTabChange("zip")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "zip"
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>ZIP / CBZ</span>
        </button>

        <button
          type="button"
          onClick={() => onActiveTabChange("scraper")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "scraper"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Web Scraper</span>
        </button>

        <button
          type="button"
          onClick={() => onActiveTabChange("url")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "url"
              ? "bg-zinc-700 text-white shadow-lg shadow-zinc-700/30"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Direct URL</span>
        </button>
      </div>

      {/* Tab Specific Ingestion Panels */}
      {activeTab === "files" && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onOpenImageInput}
          className={`group relative p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3.5 text-center cursor-pointer ${
            isDragOverDropzone
              ? "border-primary bg-primary/10 scale-[1.01] shadow-xl shadow-primary/20"
              : "border-white/10 bg-black/25 hover:border-primary/50 hover:bg-white/[0.02]"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-md">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-white group-hover:text-primary transition">
              Drag & drop comic pages here, or <span className="underline decoration-primary">browse files</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PNG, JPG, WebP (Multi-selection enabled). Pages will sort automatically.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/5">
              High Resolution
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/5">
              Lossless Compression
            </span>
          </div>
        </div>
      )}

      {activeTab === "zip" && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onOpenZipInput}
          className={`group relative p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3.5 text-center cursor-pointer ${
            isDragOverDropzone
              ? "border-primary bg-primary/10 scale-[1.01] shadow-xl shadow-primary/20"
              : "border-white/10 bg-black/25 hover:border-primary/50 hover:bg-white/[0.02]"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all shadow-md">
            <Archive className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-white group-hover:text-amber-300 transition">
              Drop .ZIP or .CBZ chapter bundle here
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              Extracts images client-side and automatically arranges them in natural numerical reading order (01.jpg, 02.jpg, 10.jpg).
            </p>
          </div>

          <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Click to Browse .ZIP / .CBZ
          </span>
        </div>
      )}

      {activeTab === "scraper" && (
        <div className="p-6 rounded-3xl bg-blue-950/20 border border-blue-500/20 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-blue-400">
            <Globe className="w-5 h-5" />
            <h3 className="text-sm font-bold">External Webpage Scraper</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Enter the public URL of a manga chapter webpage. Our scraper will fetch all comic images and populate your chapter workspace instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <Input
              type="url"
              placeholder="https://example.com/manga/solo-leveling/chapter-1"
              value={webpageUrlInput}
              onChange={(e) => onWebpageUrlChange(e.target.value)}
              disabled={isBusy || isScrapingUrl}
              className="bg-black/50 border-white/10 rounded-xl text-xs h-11 text-white flex-1 focus:ring-blue-500/50"
            />
            <Button
              type="button"
              onClick={onScrapeWebpageUrl}
              disabled={isBusy || isScrapingUrl || !webpageUrlInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 px-5 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer shrink-0"
            >
              {isScrapingUrl ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scraping Pages...
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  Extract Pages
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "url" && (
        <div className="p-6 rounded-3xl bg-black/30 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-zinc-300">
            <LinkIcon className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold">Add Image via Direct URL</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste a direct URL to a hosted image (.jpg, .png, .webp) to append it to your chapter sequence.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <Input
              type="url"
              placeholder="https://cdn.example.com/chapter-pages/page-01.webp"
              value={imageUrlInput}
              onChange={(e) => onImageUrlChange(e.target.value)}
              disabled={isBusy}
              className="bg-black/50 border-white/10 rounded-xl text-xs h-11 text-white flex-1 focus:ring-primary/50"
            />
            <Button
              type="button"
              onClick={onAddImageUrl}
              disabled={isBusy || !imageUrlInput.trim()}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-5 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add to Chapter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
