"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, FileText, FileUp, Loader2 } from "lucide-react";
import { CreateChapterAction, UpdateChapterAction } from "@/actions/chapter";
import { seriesService } from "@/services/series.service";
import { chapterService } from "@/services/chapter.service";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/api";
import { extractImagesFromZip, naturalNumericalSort } from "@/lib/zipExtractor";
import { downloadChapterImagesAsZip } from "@/lib/zipDownloader";
import { toast } from "react-hot-toast";

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

  const handleDragOver = (e: React.DragEvent, _idx: number) => {
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

      const newItems: ChapterPageItemData[] = extractedFiles.map((f, idx) => ({
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

    const newItems: ChapterPageItemData[] = sortedFiles.map((file, idx) => ({
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
      const res = await chapterService.extractWebpageImages(trimmed);
      if (!res.success || !res.data?.images || res.data.images.length === 0) {
        throw new Error(res.message || "No comic images found on the provided webpage.");
      }

      const extractedUrls: string[] = res.data.images;
      const newItems: ChapterPageItemData[] = extractedUrls.map((url, idx) => ({
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
      const newItems: ChapterPageItemData[] = sortedFiles.map((file, idx) => ({
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
              {initialData?.id ? `Edit Chapter ${initialData.number}` : "Upload New Chapter"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add chapter pages, configure release schedule, and monetize with coins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" type="button" onClick={() => router.back()} disabled={isBusy} className="rounded-xl text-xs h-9 cursor-pointer">
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={isBusy}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 rounded-xl text-xs h-9 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Save Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isBusy}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 rounded-xl text-xs h-9 px-5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving ({progressInfo?.percent || 0}%)...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  {initialData?.id ? "Save Changes" : "Publish Chapter"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Real-time Percentage Progress Bar */}
        <ChapterProgressBar progressInfo={progressInfo} />

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN: Chapter Details & Release Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <ChapterMetadataFields
              formData={formData}
              seriesList={seriesList}
              onInputChange={handleInputChange}
            />
          </div>

          {/* RIGHT COLUMN: Chapter Pages & Media Ingestion Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-5 bg-neutral-900/40 backdrop-blur-xl">
              {/* Media Ingestion Mode Switcher */}
              <ChapterExternalImporters
                activeTab={activeTab}
                isDragOverDropzone={isDragOverDropzone}
                isBusy={isBusy}
                isScrapingUrl={isScrapingUrl}
                webpageUrlInput={webpageUrlInput}
                imageUrlInput={imageUrlInput}
                onActiveTabChange={setActiveTab}
                onDragOver={(e) => { e.preventDefault(); setIsDragOverDropzone(true); }}
                onDragLeave={() => setIsDragOverDropzone(false)}
                onDrop={handleDropzoneDrop}
                onOpenImageInput={() => imageInputRef.current?.click()}
                onOpenZipInput={() => zipInputRef.current?.click()}
                onWebpageUrlChange={setWebpageUrlInput}
                onImageUrlChange={setImageUrlInput}
                onScrapeWebpageUrl={handleScrapeWebpageUrl}
                onAddImageUrl={addImageUrl}
              />

              {/* Pages Grid & Workspace Toolbar */}
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
    </div>
  );
}
