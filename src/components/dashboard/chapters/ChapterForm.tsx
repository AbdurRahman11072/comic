"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  FileText,
  FileUp,
  Globe,
  Loader2,
  Sparkles,
} from "lucide-react";
import { CreateChapterAction, UpdateChapterAction } from "@/actions/chapter";
import { seriesService } from "@/services/series.service";
import { chapterService } from "@/services/chapter.service";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/api";
import { extractImagesFromZip, naturalNumericalSort } from "@/lib/zipExtractor";
import { downloadChapterImagesAsZip } from "@/lib/zipDownloader";
import { toast } from "react-hot-toast";
import Link from "next/link";

import { ChapterMetadataFields } from "./ChapterMetadataFields";
import { ChapterProgressBar, ProgressState } from "./ChapterProgressBar";
import { ChapterExternalImporters, IngestionMode } from "./ChapterExternalImporters";
import { ChapterPageGrid } from "./ChapterPageGrid";
import { ChapterPageItemData } from "./ChapterPageItem";

export interface ChapterFormProps {
  initialData?: any;
}

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

  const [pages, setPages] = useState<ChapterPageItemData[]>(
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
    language: initialData?.language || "en",
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

  // Auto-calculate next chapter number when series is selected (new chapter only)
  useEffect(() => {
    if (initialData?.id || !formData.seriesId) return;

    const fetchNextChapterNumber = async () => {
      try {
        const res = await chapterService.getAllChapters({ seriesId: formData.seriesId, limit: 50 });
        if (res.success && res.data && res.data.length > 0) {
          const numbers = res.data
            .map((c: any) => Number(c.number))
            .filter((n: number) => !isNaN(n));
          if (numbers.length > 0) {
            const maxNumber = Math.max(...numbers);
            const nextNumber = Math.floor(maxNumber) + 1;
            setFormData((prev) => ({
              ...prev,
              number: nextNumber,
            }));
          }
        }
      } catch (_e) {
        // Fallback silently
      }
    };

    fetchNextChapterNumber();
  }, [formData.seriesId, initialData?.id]);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const sortedFiles = [...files].sort((a, b) => naturalNumericalSort(a.name, b.name));

    const newPages: ChapterPageItemData[] = sortedFiles.map((file, idx) => ({
      id: `file-${Date.now()}-${idx}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
      order: pages.length + idx + 1,
    }));

    setPages((prev) => [...prev, ...newPages]);
    toast.success(`Loaded ${files.length} images!`);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleZipFile = async (file: File) => {
    setIsProcessingZip(true);
    setProgressInfo({
      title: "Extracting ZIP / CBZ Archive",
      current: 0,
      total: 100,
      percent: 0,
      statusText: "Decompressing pages client-side...",
    });

    try {
      const extractedImages = await extractImagesFromZip(file, ({ current, total, percent, currentFileName }) => {
        setProgressInfo({
          title: "Extracting Archive Pages",
          current,
          total,
          percent,
          statusText: `Unpacking ${currentFileName || "page"} (${current} of ${total})...`,
        });
      });

      if (extractedImages.length === 0) {
        toast.error("No valid image files found inside ZIP/CBZ.");
        return;
      }

      const newPages: ChapterPageItemData[] = extractedImages.map((file, idx) => ({
        id: `zip-${Date.now()}-${idx}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file),
        order: pages.length + idx + 1,
      }));

      setPages((prev) => [...prev, ...newPages]);
      toast.success(`Extracted and sorted ${extractedImages.length} pages from ${file.name}!`);
    } catch (err: any) {
      console.error("ZIP extraction error:", err);
      toast.error(err?.message || "Failed to extract ZIP file.");
    } finally {
      setIsProcessingZip(false);
      setProgressInfo(null);
      if (zipInputRef.current) {
        zipInputRef.current.value = "";
      }
    }
  };

  const handleDropzoneDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverDropzone(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const zipFile = files.find(
      (f) =>
        f.name.endsWith(".zip") ||
        f.name.endsWith(".cbz") ||
        f.type === "application/zip" ||
        f.type === "application/x-zip-compressed"
    );

    if (zipFile) {
      await handleZipFile(zipFile);
      return;
    }

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length > 0) {
      const sortedFiles = [...imageFiles].sort((a, b) => naturalNumericalSort(a.name, b.name));
      const newPages: ChapterPageItemData[] = sortedFiles.map((file, idx) => ({
        id: `drop-${Date.now()}-${idx}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file),
        order: pages.length + idx + 1,
      }));
      setPages((prev) => [...prev, ...newPages]);
      toast.success(`Loaded ${imageFiles.length} dropped images!`);
    }
  };

  const handleScrapeWebpageUrl = async () => {
    const trimmed = webpageUrlInput.trim();
    if (!trimmed) {
      toast.error("Please enter a valid webpage URL");
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      toast.error("Invalid URL format");
      return;
    }

    setIsScrapingUrl(true);
    setProgressInfo({
      title: "Scraping Webpage Images",
      current: 0,
      total: 100,
      percent: 30,
      statusText: "Analyzing webpage HTML for comic strip images...",
    });

    try {
      const res = await chapterService.extractWebpageImages(trimmed);
      const scrapedImages: string[] = res.data?.images || [];
      if (!res.success || scrapedImages.length === 0) {
        throw new Error(res.message || "No comic images found on the target webpage.");
      }

      const newPages: ChapterPageItemData[] = scrapedImages.map((url, idx) => ({
        id: `scraped-${Date.now()}-${idx}`,
        previewUrl: url,
        existingUrl: url,
        order: pages.length + idx + 1,
      }));

      setPages((prev) => [...prev, ...newPages]);
      setWebpageUrlInput("");
      toast.success(`Successfully extracted ${scrapedImages.length} images from webpage!`);
    } catch (err: any) {
      console.error("Webpage scrape error:", err);
      toast.error(err?.message || "Failed to scrape images from webpage.");
    } finally {
      setIsScrapingUrl(false);
      setProgressInfo(null);
    }
  };

  const removePage = (index: number) => {
    setPages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((p, idx) => ({ ...p, order: idx + 1 }));
    });
  };

  const clearAllPages = () => {
    if (pages.length === 0) return;
    if (confirm(`Remove all ${pages.length} pages from this chapter?`)) {
      setPages([]);
      toast.success("All pages cleared.");
    }
  };

  const handleDownloadZip = async () => {
    if (pages.length === 0) {
      toast.error("No pages to download.");
      return;
    }

    setIsDownloadingZip(true);
    setProgressInfo({
      title: "Creating ZIP Backup",
      current: 0,
      total: pages.length,
      percent: 0,
      statusText: "Bundling chapter pages into ZIP...",
    });

    try {
      const selectedSeriesTitle = seriesList.find((s) => s.id === formData.seriesId)?.title || "Series";
      const filename = `${selectedSeriesTitle}_Chapter_${formData.number}_Pages.zip`;

      const imagesToZip = pages.map((p, idx) => ({
        url: p.existingUrl || p.previewUrl,
        file: p.file,
        order: p.order || idx + 1,
        filename: `page_${String(idx + 1).padStart(3, "0")}.jpg`,
      }));

      await downloadChapterImagesAsZip(imagesToZip, filename, ({ current, total, percent, statusText }) => {
        setProgressInfo({
          title: "Downloading Chapter Pages",
          current,
          total,
          percent,
          statusText: statusText || `Packaging page ${current} of ${total}...`,
        });
      });

      toast.success("ZIP archive downloaded successfully!");
    } catch (err: any) {
      console.error("Zip download failed:", err);
      toast.error("Failed to generate ZIP archive.");
    } finally {
      setIsDownloadingZip(false);
      setProgressInfo(null);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIdx === null || draggedItemIdx === index) return;

    setPages((prev) => {
      const updated = [...prev];
      const draggedItem = updated[draggedItemIdx];
      updated.splice(draggedItemIdx, 1);
      updated.splice(index, 0, draggedItem);
      return updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
    setDraggedItemIdx(index);
  };

  const handleDrop = (index: number) => {
    setDraggedItemIdx(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSave = async (isDraft: boolean = false) => {
    if (!formData.seriesId) {
      toast.error("Please select a series first.");
      return;
    }
    if (!formData.number && formData.number !== 0) {
      toast.error("Chapter number is required.");
      return;
    }
    if (pages.length === 0 && !isDraft) {
      toast.error("Please upload at least one page for this chapter.");
      return;
    }

    setLoading(true);

    try {
      const finalImages: { url: string; order: number }[] = [];
      const totalPages = pages.length;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pct = Math.round(((i + 1) / totalPages) * 100);

        setProgressInfo({
          title: "Uploading Chapter Pages",
          current: i + 1,
          total: totalPages,
          percent: pct,
          statusText: `Uploading page ${i + 1} of ${totalPages} to cloud storage...`,
        });

        if (page.file) {
          try {
            const res = await uploadImage(page.file);
            const resolvedUrl = res.data?.url || page.existingUrl || page.previewUrl || "";
            finalImages.push({ url: resolvedUrl, order: i + 1 });
          } catch {
            const fallbackUrl = page.existingUrl || page.previewUrl || "";
            finalImages.push({ url: fallbackUrl, order: i + 1 });
          }
        } else {
          finalImages.push({ url: page.existingUrl || page.previewUrl || "", order: i + 1 });
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
  const currentSelectedSeries = seriesList.find((s) => s.id === formData.seriesId);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-8">
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

      {/* Top Studio Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {currentSelectedSeries && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-bold text-primary truncate max-w-[200px]">
                  {currentSelectedSeries.title}
                </span>
              </>
            )}

            <span className="text-zinc-600">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/10">
              {formData.language?.toUpperCase() || "EN"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
              <FileUp className="w-5 h-5" />
            </span>
            {initialData?.id ? `Edit Chapter ${initialData.number}` : "Chapter Publishing Studio"}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.back()}
            disabled={isBusy}
            className="rounded-xl text-xs h-10 px-4 text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={isBusy}
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-1.5" /> Save Draft
          </Button>

          <Button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isBusy}
            className="bg-primary hover:bg-primary/90 text-white font-extrabold shadow-xl shadow-primary/25 rounded-xl text-xs h-10 px-6 cursor-pointer transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving ({progressInfo?.percent || 0}%)...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {initialData?.id ? "Save Changes" : "Publish Chapter"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real-time Upload Progress Bar */}
      <ChapterProgressBar progressInfo={progressInfo} />

      {/* 2-Column Studio Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Metadata & Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ChapterMetadataFields
            formData={formData}
            seriesList={seriesList}
            onInputChange={handleInputChange}
          />
        </div>

        {/* RIGHT COLUMN: Media Ingestion Workspace & Live Page Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/10 space-y-6 bg-neutral-900/60 backdrop-blur-xl shadow-xl">
            {/* Media Importers Bar & Dropzone */}
            <ChapterExternalImporters
              activeTab={activeTab}
              isDragOverDropzone={isDragOverDropzone}
              isBusy={isBusy}
              isScrapingUrl={isScrapingUrl}
              webpageUrlInput={webpageUrlInput}
              imageUrlInput={imageUrlInput}
              onActiveTabChange={setActiveTab}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverDropzone(true);
              }}
              onDragLeave={() => setIsDragOverDropzone(false)}
              onDrop={handleDropzoneDrop}
              onOpenImageInput={() => imageInputRef.current?.click()}
              onOpenZipInput={() => zipInputRef.current?.click()}
              onWebpageUrlChange={setWebpageUrlInput}
              onImageUrlChange={setImageUrlInput}
              onScrapeWebpageUrl={handleScrapeWebpageUrl}
              onAddImageUrl={addImageUrl}
            />

            {/* Live Pages Workspace Grid */}
            <ChapterPageGrid
              pages={pages}
              draggedItemIdx={draggedItemIdx}
              isBusy={isBusy}
              onDownloadZip={handleDownloadZip}
              onClearAll={clearAllPages}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={() => setDraggedItemIdx(null)}
              onRemovePage={removePage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
