"use client";

import { useEffect, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  Loader2,
  ListOrdered,
  UploadCloud,
  Link as LinkIcon,
  FileText,
  Check,
  Trash2,
  Archive,
  Image as ImageIcon,
  Sparkles,
  Globe,
  Download,
  DownloadCloud,
  FileUp,
  Layers,
  Coins,
  Calendar,
  Lock,
  Zap,
} from "lucide-react";
import { CreateChapterAction, UpdateChapterAction } from "@/actions/chapter";
import { seriesService } from "@/services/series.service";
import { useRouter } from "next/navigation";
import api, { uploadImage } from "@/lib/api";
import { extractImagesFromZip, naturalNumericalSort } from "@/lib/zipExtractor";
import { downloadChapterImagesAsZip } from "@/lib/zipDownloader";
import { toast } from "react-hot-toast";

interface ChapterFormProps {
  initialData?: any;
}

interface ChapterPageItem {
  id: string;
  file?: File;
  previewUrl: string;
  existingUrl?: string;
  order: number;
}

interface ProgressState {
  title: string;
  current: number;
  total: number;
  percent: number;
  statusText?: string;
}

type IngestionMode = "files" | "zip" | "scraper" | "url";

export function ChapterForm({ initialData }: ChapterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [progressInfo, setProgressInfo] = useState<ProgressState | null>(null);
  const [seriesList, setSeriesList] = useState<{ id: string; title: string; coverUrl?: string }[]>([]);
  const [activeTab, setActiveTab] = useState<IngestionMode>("files");

  const zipInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [pages, setPages] = useState<ChapterPageItem[]>(
    initialData?.images?.map((img: any, idx: number) => ({
      id: `existing-${img.id || idx}`,
      previewUrl: img.url,
      existingUrl: img.url,
      order: img.order || idx + 1,
    })) || []
  );

  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [webpageUrlInput, setWebpageUrlInput] = useState("");
  const [isDragOverDropzone, setIsDragOverDropzone] = useState(false);

  const [formData, setFormData] = useState({
    seriesId: initialData?.seriesId || "",
    number: initialData?.number || 1,
    title: initialData?.title || "",
    isLocked: initialData?.isLocked ?? false,
    isFastPass: initialData?.isFastPass ?? false,
    publishAt: initialData?.publishAt ? new Date(initialData.publishAt).toISOString().slice(0, 16) : "",
    coinCost: initialData?.coinCost || 0,
  });

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await seriesService.getSeriesList();
        setSeriesList(res.data);
        if (!formData.seriesId && res.data.length > 0) {
          setFormData((prev) => ({ ...prev, seriesId: res.data[0].id }));
        }
      } catch (error) {
        console.error("Failed to fetch series list:", error);
      }
    };
    fetchSeries();
  }, []);

  const addImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (trimmed) {
      setPages((prev) => [
        ...prev,
        {
          id: `url-${Date.now()}-${prev.length}`,
          previewUrl: trimmed,
          existingUrl: trimmed,
          order: prev.length + 1,
        },
      ]);
      setImageUrlInput("");
      toast.success("Page URL added to chapter list");
    }
  };

  const removePage = (index: number) => {
    setPages((prev) => {
      const removed = prev[index];
      if (removed.file && removed.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, order: i + 1 }));
    });
  };

  const clearAllPages = () => {
    pages.forEach((p) => {
      if (p.file && p.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(p.previewUrl);
      }
    });
    setPages([]);
    toast.success("All pages cleared");
  };

  const handleDragStart = (idx: number) => {
    setDraggedItemIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = (idx: number) => {
    if (draggedItemIdx === null || draggedItemIdx === idx) return;

    const newPages = [...pages];
    const draggedItem = newPages[draggedItemIdx];
    newPages.splice(draggedItemIdx, 1);
    newPages.splice(idx, 0, draggedItem);

    const updated = newPages.map((p, i) => ({ ...p, order: i + 1 }));
    setPages(updated);
    setDraggedItemIdx(null);
  };

  // Process ZIP / CBZ Archive
  const handleZipFile = async (file: File) => {
    if (!file) return;

    setIsProcessingZip(true);
    setProgressInfo({
      title: "Unpacking Chapter ZIP Archive",
      current: 0,
      total: 100,
      percent: 0,
      statusText: "Analyzing archive contents...",
    });

    try {
      const extractedFiles = await extractImagesFromZip(file, (progress) => {
        setProgressInfo({
          title: "Extracting Chapter Pages",
          current: progress.current,
          total: progress.total,
          percent: progress.percent,
          statusText: `Extracting ${progress.currentFileName} (${progress.current}/${progress.total})...`,
        });
      });

      const newItems: ChapterPageItem[] = extractedFiles.map((f, idx) => ({
        id: `zip-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        order: pages.length + idx + 1,
      }));

      setPages((prev) => [...prev, ...newItems].map((p, i) => ({ ...p, order: i + 1 })));
      toast.success(`Successfully unpacked ${extractedFiles.length} pages sorted in number order!`);
    } catch (err: any) {
      console.error("ZIP extraction error:", err);
      toast.error(err?.message || "Failed to extract images from ZIP file.");
    } finally {
      setIsProcessingZip(false);
      setProgressInfo(null);
      if (zipInputRef.current) zipInputRef.current.value = "";
    }
  };

  // Direct multi-image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const sortedFiles = Array.from(files).sort((a, b) => naturalNumericalSort(a.name, b.name));

    const newItems: ChapterPageItem[] = sortedFiles.map((file, idx) => ({
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${idx}`,
      file,
      previewUrl: URL.createObjectURL(file),
      order: pages.length + idx + 1,
    }));

    setPages((prev) => [...prev, ...newItems].map((p, i) => ({ ...p, order: i + 1 })));
    toast.success(`${sortedFiles.length} page(s) loaded into preview.`);
    e.target.value = "";
  };

  // Scrape all images from an external chapter webpage URL
  const handleScrapeWebpageUrl = async () => {
    const trimmed = webpageUrlInput.trim();
    if (!trimmed || (!trimmed.startsWith("http://") && !trimmed.startsWith("https://"))) {
      toast.error("Please enter a valid HTTP or HTTPS webpage URL.");
      return;
    }

    setIsScrapingUrl(true);
    setProgressInfo({
      title: "Scraping Webpage Images",
      current: 0,
      total: 100,
      percent: 30,
      statusText: `Connecting to ${new URL(trimmed).hostname} and parsing comic reader panels...`,
    });

    try {
      const res = await api.post("/api/v1/chapters/extract-webpage-images", { url: trimmed });
      if (!res.data.success || !res.data.data?.images || res.data.data.images.length === 0) {
        throw new Error(res.data.message || "No comic images found on the provided webpage.");
      }

      const extractedUrls: string[] = res.data.data.images;
      const newItems: ChapterPageItem[] = extractedUrls.map((url, idx) => ({
        id: `scraped-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        previewUrl: url,
        existingUrl: url,
        order: pages.length + idx + 1,
      }));

      setPages((prev) => [...prev, ...newItems].map((p, i) => ({ ...p, order: i + 1 })));
      setWebpageUrlInput("");
      toast.success(`Successfully extracted ${extractedUrls.length} pages sorted in number order!`);
    } catch (err: any) {
      console.error("Webpage scrape error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to extract images from URL.");
    } finally {
      setIsScrapingUrl(false);
      setProgressInfo(null);
    }
  };

  // Download all currently loaded pages as a single ZIP archive
  const handleDownloadZip = async () => {
    if (pages.length === 0) {
      toast.error("No images loaded to download.");
      return;
    }

    setIsDownloadingZip(true);
    const chapterNum = formData.number || 1;
    const filename = `chapter_${chapterNum}_images.zip`;

    try {
      await downloadChapterImagesAsZip(pages, filename, (progress) => {
        setProgressInfo({
          title: "Packaging Chapter ZIP",
          current: progress.current,
          total: progress.total,
          percent: progress.percent,
          statusText: progress.statusText,
        });
      });
      toast.success(`Downloaded all ${pages.length} pages as ${filename}`);
    } catch (err: any) {
      console.error("ZIP download error:", err);
      toast.error(err?.message || "Failed to generate ZIP download.");
    } finally {
      setIsDownloadingZip(false);
      setProgressInfo(null);
    }
  };

  // Handle Drag & Drop on the Dropzone
  const handleDropzoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverDropzone(false);

    if (loading || isProcessingZip || isScrapingUrl || isDownloadingZip) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const zipFile = files.find(
      (f) =>
        f.name.endsWith(".zip") ||
        f.name.endsWith(".cbz") ||
        f.type === "application/zip" ||
        f.type === "application/x-zip-compressed"
    );

    if (zipFile) {
      handleZipFile(zipFile);
      return;
    }

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length > 0) {
      const sortedFiles = imageFiles.sort((a, b) => naturalNumericalSort(a.name, b.name));
      const newItems: ChapterPageItem[] = sortedFiles.map((file, idx) => ({
        id: `drop-${Date.now()}-${idx}`,
        file,
        previewUrl: URL.createObjectURL(file),
        order: pages.length + idx + 1,
      }));
      setPages((prev) => [...prev, ...newItems].map((p, i) => ({ ...p, order: i + 1 })));
      toast.success(`${sortedFiles.length} page(s) added.`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [id]: val }));
  };

  const handleSave = async (isDraft: boolean = false) => {
    if (pages.length === 0) {
      toast.error("Please add at least one page image to the chapter.");
      return;
    }
    if (!formData.seriesId) {
      toast.error("Please select a series.");
      return;
    }

    setLoading(true);
    setProgressInfo({
      title: "Preparing Chapter Upload",
      current: 0,
      total: pages.length,
      percent: 0,
      statusText: "Validating images and payload...",
    });

    try {
      const finalImages: { url: string; order: number }[] = [];
      const pendingUploads = pages.filter((p) => p.file || (p.existingUrl && !p.existingUrl.includes("cloudinary.com")));
      let uploadedCounter = 0;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        if (page.file) {
          uploadedCounter++;
          const percent = Math.round((uploadedCounter / (pendingUploads.length || 1)) * 100);
          setProgressInfo({
            title: "Uploading Pages to CDN",
            current: uploadedCounter,
            total: pendingUploads.length,
            percent,
            statusText: `Uploading page ${uploadedCounter} of ${pendingUploads.length} to Cloudinary...`,
          });

          const res = await uploadImage(page.file);
          if (!res.data?.url) {
            throw new Error(`Failed to upload page ${i + 1}`);
          }
          finalImages.push({ url: res.data.url, order: i + 1 });
        } else if (page.existingUrl && !page.existingUrl.includes("cloudinary.com")) {
          uploadedCounter++;
          const percent = Math.round((uploadedCounter / (pendingUploads.length || 1)) * 100);
          setProgressInfo({
            title: "Archiving Remote Image to CDN",
            current: uploadedCounter,
            total: pendingUploads.length,
            percent,
            statusText: `Saving remote page ${uploadedCounter} of ${pendingUploads.length} to Cloudinary...`,
          });

          try {
            let blob: Blob;
            try {
              const fetchRes = await fetch(page.existingUrl);
              blob = await fetchRes.blob();
            } catch {
              const proxyRes = await fetch(`/api/v1/upload/proxy-image?url=${encodeURIComponent(page.existingUrl)}`);
              blob = await proxyRes.blob();
            }

            const file = new File([blob], `page_${i + 1}.jpg`, { type: blob.type || "image/jpeg" });
            const res = await uploadImage(file);
            finalImages.push({ url: res.data?.url || page.existingUrl, order: i + 1 });
          } catch {
            finalImages.push({ url: page.existingUrl, order: i + 1 });
          }
        } else {
          finalImages.push({ url: page.existingUrl || page.previewUrl, order: i + 1 });
        }
      }

      setProgressInfo({
        title: "Saving Chapter",
        current: 100,
        total: 100,
        percent: 100,
        statusText: "Finalizing chapter database records...",
      });

      const payload = {
        ...formData,
        number: Number(formData.number),
        coinCost: isDraft ? 0 : Number(formData.coinCost),
        isLocked: isDraft ? false : Boolean(formData.isLocked),
        isFastPass: isDraft ? false : Boolean(formData.isFastPass),
        publishAt: formData.publishAt ? new Date(formData.publishAt).toISOString() : null,
        images: finalImages,
      };

      if (initialData && initialData.id) {
        const res = await UpdateChapterAction(initialData.id, payload);
        if (!res.success) throw new Error(res.message);
        toast.success(isDraft ? "Draft chapter saved!" : "Chapter updated successfully!");
      } else {
        const res = await CreateChapterAction(payload);
        if (!res.success) throw new Error(res.message);
        toast.success(isDraft ? "Draft chapter saved!" : "Chapter published successfully!");
      }

      router.push(`/dashboard/series/${formData.seriesId}`);
      router.refresh();
    } catch (error: any) {
      console.error("Failed to save chapter:", error);
      toast.error(error?.message || "Failed to save chapter.");
    } finally {
      setLoading(false);
      setProgressInfo(null);
    }
  };

  const isBusy = loading || isProcessingZip || isScrapingUrl || isDownloadingZip;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Hidden File Inputs */}
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip,.cbz,application/zip,application/x-zip-compressed"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleZipFile(file);
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageSelect}
      />

      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <FileUp className="w-5 h-5" />
              </span>
              {initialData ? `Edit Chapter ${initialData.number}` : "Upload New Chapter"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add chapter pages, configure release schedule, and monetize with coins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" type="button" onClick={() => router.back()} disabled={isBusy} className="rounded-xl text-xs h-9">
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={isBusy}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 rounded-xl text-xs h-9"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Save Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isBusy}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 rounded-xl text-xs h-9 px-5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving ({progressInfo?.percent || 0}%)...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  {initialData ? "Save Changes" : "Publish Chapter"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Real-time Percentage Progress Bar */}
        {progressInfo && (
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
        )}

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN: Chapter Details & Release Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
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
                  onChange={handleInputChange as any}
                  className="w-full bg-background/60 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-10"
                  required
                >
                  {seriesList.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              {/* Chapter Number & Coin Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="number" className="text-xs font-semibold">Chapter #</Label>
                  <Input
                    id="number"
                    type="number"
                    step="0.1"
                    required
                    value={formData.number}
                    onChange={handleInputChange}
                    className="bg-background/60 rounded-xl h-10 text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="coinCost" className="text-xs font-semibold flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-400" /> Coin Cost
                  </Label>
                  <Input
                    id="coinCost"
                    type="number"
                    value={formData.coinCost}
                    onChange={handleInputChange}
                    className="bg-background/60 rounded-xl h-10 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Chapter Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">Chapter Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g. The Awakening Part 1"
                  value={formData.title}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                    onChange={handleInputChange as any}
                    className="w-4 h-4 rounded border-white/10 bg-background/50 text-primary focus:ring-primary/50"
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
                    onChange={handleInputChange as any}
                    className="w-4 h-4 rounded border-white/10 bg-background/50 text-amber-400 focus:ring-amber-400/50"
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
          </div>

          {/* RIGHT COLUMN: Chapter Pages & Media Ingestion Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-5 bg-neutral-900/40 backdrop-blur-xl">
              {/* Media Ingestion Mode Switcher */}
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
                    onClick={() => setActiveTab("files")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                    onClick={() => setActiveTab("zip")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                    onClick={() => setActiveTab("scraper")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                    onClick={() => setActiveTab("url")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                      onDragOver={(e) => { e.preventDefault(); setIsDragOverDropzone(true); }}
                      onDragLeave={() => setIsDragOverDropzone(false)}
                      onDrop={handleDropzoneDrop}
                      onClick={() => !isBusy && imageInputRef.current?.click()}
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
                      onDragOver={(e) => { e.preventDefault(); setIsDragOverDropzone(true); }}
                      onDragLeave={() => setIsDragOverDropzone(false)}
                      onDrop={handleDropzoneDrop}
                      onClick={() => !isBusy && zipInputRef.current?.click()}
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
                          onChange={(e) => setWebpageUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleScrapeWebpageUrl();
                            }
                          }}
                          className="text-xs h-9 bg-background/60 rounded-xl"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={isBusy || !webpageUrlInput.trim()}
                          onClick={handleScrapeWebpageUrl}
                          className="shrink-0 h-9 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl px-4 shadow-md"
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
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addImageUrl();
                            }
                          }}
                          className="text-xs h-9 bg-background/60 rounded-xl"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isBusy || !imageUrlInput.trim()}
                          onClick={addImageUrl}
                          className="shrink-0 h-9 rounded-xl text-xs font-semibold"
                        >
                          <LinkIcon className="w-3.5 h-3.5 mr-1" /> Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pages Grid & Workspace Toolbar */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">Chapter Pages</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-primary/20 text-primary border border-primary/30">
                      {pages.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {pages.length > 0 && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isBusy}
                          onClick={handleDownloadZip}
                          className="text-xs text-primary hover:text-primary/80 hover:bg-primary/10 h-8 px-3 rounded-xl flex items-center gap-1.5 font-semibold transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download ZIP
                        </Button>
                        <button
                          type="button"
                          onClick={clearAllPages}
                          disabled={isBusy}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition disabled:opacity-50 h-8 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear All
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Pages Grid Display */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[440px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {pages.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-muted-foreground text-xs border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2.5">
                      <Archive className="w-8 h-8 text-white/20" />
                      <span className="font-medium">No pages added yet. Select an ingestion mode above.</span>
                    </div>
                  ) : (
                    pages.map((img, idx) => (
                      <div
                        key={img.id}
                        draggable={!isBusy}
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={() => handleDrop(idx)}
                        onDragEnd={() => setDraggedItemIdx(null)}
                        className={`relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 group bg-black/40 cursor-grab active:cursor-grabbing transition-all duration-200 shadow-md ${
                          draggedItemIdx === idx
                            ? "opacity-50 scale-95 ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "opacity-100 hover:ring-2 hover:ring-white/20 hover:scale-[1.02]"
                        }`}
                      >
                        <img src={img.previewUrl} alt={`Page ${img.order}`} className="object-cover w-full h-full" />
                        <div className="absolute top-1.5 left-1.5 bg-black/85 backdrop-blur-sm text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-md border border-white/10">
                          #{img.order}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePage(idx);
                          }}
                          disabled={isBusy}
                          className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-lg disabled:hidden"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {pages.length > 0 && (
                  <div className="text-[11px] text-center text-muted-foreground flex items-center justify-between px-1 pt-1">
                    <span>{pages.length} pages in reading order.</span>
                    <span className="text-white/40">Drag page thumbnails to adjust sequence</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
