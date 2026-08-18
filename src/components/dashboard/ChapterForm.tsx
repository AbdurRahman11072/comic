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
} from "lucide-react";
import { CreateChapterAction, UpdateChapterAction } from "@/actions/chapter";
import { seriesService } from "@/services/series.service";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/api";
import { extractImagesFromZip, naturalNumericalSort } from "@/lib/zipExtractor";
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

export function ChapterForm({ initialData }: ChapterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [progressInfo, setProgressInfo] = useState<ProgressState | null>(null);
  const [seriesList, setSeriesList] = useState<{ id: string; title: string }[]>([]);

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

  // Process ZIP / CBZ Archive with Natural Numerical Order Sorting & Percentage Progress
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

  // Direct multi-image selection (also naturally sorted)
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

  // Handle Drag & Drop on the Dropzone (accepts both images and .zip/.cbz archives)
  const handleDropzoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverDropzone(false);

    if (loading || isProcessingZip) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Check if any dropped file is a ZIP or CBZ
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

    // Otherwise handle dropped images
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
      const pendingFiles = pages.filter((p) => p.file);
      let uploadedCounter = 0;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (page.existingUrl) {
          finalImages.push({ url: page.existingUrl, order: i + 1 });
        } else if (page.file) {
          uploadedCounter++;
          const percent = Math.round((uploadedCounter / (pendingFiles.length || 1)) * 100);
          setProgressInfo({
            title: "Uploading Pages to CDN",
            current: uploadedCounter,
            total: pendingFiles.length,
            percent,
            statusText: `Uploading page ${uploadedCounter} of ${pendingFiles.length} to Cloudinary...`,
          });

          const res = await uploadImage(page.file);
          if (!res.data?.url) {
            throw new Error(`Failed to upload page ${i + 1}`);
          }
          finalImages.push({ url: res.data.url, order: i + 1 });
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

      router.push("/dashboard/chapters");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to save chapter:", error);
      toast.error(error?.message || "Failed to save chapter.");
    } finally {
      setLoading(false);
      setProgressInfo(null);
    }
  };

  const isBusy = loading || isProcessingZip;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {initialData ? "Edit Chapter" : "Upload New Chapter"}
          </h1>
          <p className="text-muted-foreground">
            {initialData
              ? `Updating Chapter ${initialData.number}`
              : "Upload pages via ZIP archive or image picker and configure release settings."}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="grid gap-8 md:grid-cols-2">
          {/* Chapter Details Column */}
          <div className="space-y-6 glass p-6 rounded-2xl border border-white/5">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Chapter Details
              </h2>

              <div className="space-y-2">
                <Label htmlFor="seriesId">Select Series</Label>
                <select
                  id="seriesId"
                  value={formData.seriesId}
                  onChange={handleInputChange as any}
                  className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-10"
                  required
                >
                  {seriesList.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Chapter Number</Label>
                  <Input
                    id="number"
                    type="number"
                    step="0.1"
                    required
                    value={formData.number}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coinCost">Coin Cost</Label>
                  <Input
                    id="coinCost"
                    type="number"
                    value={formData.coinCost}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Chapter Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g. The Beginning"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishAt">Scheduled Release Date/Time (Optional)</Label>
                <Input
                  id="publishAt"
                  type="datetime-local"
                  value={formData.publishAt}
                  onChange={handleInputChange}
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave empty to publish immediately. If set, this chapter will unlock automatically at the chosen time.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isLocked"
                    checked={formData.isLocked}
                    onChange={handleInputChange as any}
                    className="w-4 h-4 rounded border-white/10 bg-background/50 text-primary focus:ring-primary/50"
                  />
                  <Label htmlFor="isLocked" className="cursor-pointer">Lock this chapter (Requires coins)</Label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFastPass"
                    checked={formData.isFastPass}
                    onChange={handleInputChange as any}
                    className="w-4 h-4 rounded border-white/10 bg-background/50 text-amber-400 focus:ring-amber-400/50"
                  />
                  <Label htmlFor="isFastPass" className="cursor-pointer text-amber-300 font-medium">
                    FastPass Early Access (Special coin tier)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter Pages Preview & Reorder Column */}
          <div className="space-y-6 glass p-6 rounded-2xl border border-white/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-primary" />
                  Chapter Pages ({pages.length})
                </h2>
                {pages.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllPages}
                    disabled={isBusy}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
              </div>

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

              {/* Enhanced Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverDropzone(true);
                }}
                onDragLeave={() => setIsDragOverDropzone(false)}
                onDrop={handleDropzoneDrop}
                className={`relative w-full rounded-2xl p-5 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center ${
                  isDragOverDropzone
                    ? "border-primary bg-primary/10 scale-[1.01]"
                    : "border-white/15 bg-background/50 hover:bg-white/5"
                }`}
              >
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Drop Chapter ZIP archive or multiple images here
                  </span>
                  <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    ZIP images are automatically extracted and sorted in numerical order (1, 2, 10...)
                  </span>
                </div>

                {/* Upload Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 w-full">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => zipInputRef.current?.click()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md text-xs h-9 px-4 rounded-xl"
                  >
                    <Archive className="w-4 h-4 mr-1.5" />
                    Upload ZIP / CBZ
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => imageInputRef.current?.click()}
                    className="bg-white/10 hover:bg-white/15 text-white font-medium text-xs h-9 px-4 rounded-xl border border-white/10"
                  >
                    <ImageIcon className="w-4 h-4 mr-1.5" />
                    Select Multiple Images
                  </Button>
                </div>
              </div>

              {/* URL Input Helper */}
              <div className="flex gap-2">
                <Input
                  placeholder="Or paste external image URL..."
                  value={imageUrlInput}
                  disabled={isBusy}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                  className="text-xs h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={addImageUrl}
                  className="shrink-0 h-9"
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {/* Pages Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {pages.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground text-xs border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-2">
                    <Archive className="w-8 h-8 text-white/20" />
                    <span>No pages added yet. Click &quot;Upload ZIP / CBZ&quot; or select image files.</span>
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
                      className={`relative aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group bg-black/20 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                        draggedItemIdx === idx
                          ? "opacity-50 scale-95 ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "opacity-100 hover:ring-2 hover:ring-white/20"
                      }`}
                    >
                      <img src={img.previewUrl} alt={`Page ${img.order}`} className="object-cover w-full h-full" />
                      <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-sm text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                        {img.order}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePage(idx);
                        }}
                        disabled={isBusy}
                        className="absolute top-1.5 right-1.5 bg-red-500/90 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg disabled:hidden"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {pages.length > 0 && (
                <div className="text-[11px] text-center text-muted-foreground">
                  Total {pages.length} pages. Drag any page thumbnail to adjust the reading sequence.
                </div>
              )}
            </div>
          </div>

          {/* Real-time Animated Percentage Progress Bar */}
          {progressInfo && (
            <div className="md:col-span-2 p-5 rounded-2xl bg-primary/10 border border-primary/30 space-y-3 shadow-lg animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs font-semibold text-primary">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <span>{progressInfo.title}</span>
                </span>
                <span className="font-bold text-sm bg-primary/20 px-2.5 py-0.5 rounded-full text-primary border border-primary/30">
                  {progressInfo.percent}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5">
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

          {/* Submit Actions */}
          <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="secondary" type="button" onClick={() => router.back()} disabled={isBusy}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={isBusy}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
            >
              <FileText className="w-4 h-4 mr-2" /> Save as Draft
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 px-8 font-bold" disabled={isBusy}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving ({progressInfo?.percent || 0}%)...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {initialData ? "Save Changes" : "Publish Chapter"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
