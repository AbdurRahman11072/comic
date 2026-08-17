"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, ListOrdered, UploadCloud, Link as LinkIcon, FileText, Check, Trash2 } from "lucide-react";
import { CreateChapterAction, UpdateChapterAction } from "@/actions/chapter";
import { seriesService } from "@/services/series.service";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/api";
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

export function ChapterForm({ initialData }: ChapterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [seriesList, setSeriesList] = useState<{ id: string; title: string }[]>([]);

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

  const [formData, setFormData] = useState({
    seriesId: initialData?.seriesId || "",
    number: initialData?.number || 1,
    title: initialData?.title || "",
    isLocked: initialData?.isLocked ?? false,
    isFastPass: initialData?.isFastPass ?? false,
    publishAt: initialData?.publishAt ? new Date(initialData.publishAt).toISOString().slice(0, 16) : "",
    coinCost: initialData?.coinCost || 0
  });

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await seriesService.getSeriesList();
        setSeriesList(res.data);
        if (!formData.seriesId && res.data.length > 0) {
          setFormData(prev => ({ ...prev, seriesId: res.data[0].id }));
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
      setPages(prev => [
        ...prev,
        {
          id: `url-${Date.now()}-${prev.length}`,
          previewUrl: trimmed,
          existingUrl: trimmed,
          order: prev.length + 1,
        }
      ]);
      setImageUrlInput("");
      toast.success("Page URL added to chapter list");
    }
  };

  const removePage = (index: number) => {
    setPages(prev => {
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

  // Instant local preview without uploading to Cloudinary
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ChapterPageItem[] = Array.from(files).map((file, idx) => ({
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${idx}`,
      file,
      previewUrl: URL.createObjectURL(file),
      order: pages.length + idx + 1,
    }));

    setPages(prev => [...prev, ...newItems].map((p, i) => ({ ...p, order: i + 1 })));
    toast.success(`${files.length} page(s) loaded into preview.`);
    e.target.value = "";
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
    setUploadProgress("Preparing chapter images...");

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
          setUploadProgress(`Uploading page ${uploadedCounter} of ${pendingFiles.length} to Cloudinary...`);
          const res = await uploadImage(page.file);
          if (!res.data?.url) {
            throw new Error(`Failed to upload page ${i + 1}`);
          }
          finalImages.push({ url: res.data.url, order: i + 1 });
        }
      }

      setUploadProgress("Saving chapter details...");

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
      setUploadProgress("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {initialData ? "Edit Chapter" : "Upload New Chapter"}
          </h1>
          <p className="text-muted-foreground">
            {initialData ? `Updating Chapter ${initialData.number}` : "Upload pages and configure release settings."}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="grid gap-8 md:grid-cols-2">
          {/* Chapter Details */}
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
                  {seriesList.map(s => (
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

          {/* Chapter Pages Preview & Reorder */}
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
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => !loading && document.getElementById('pageUpload')?.click()}
                className="relative w-full h-28 rounded-xl overflow-hidden border-2 border-dashed border-white/20 bg-background/50 hover:bg-white/5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
                  <UploadCloud className="w-7 h-7" />
                  <span className="text-xs font-semibold">Click to choose pages (Select Multiple)</span>
                  <span className="text-[10px] text-white/40">Instant local preview & drag-to-reorder</span>
                </div>
                <input
                  id="pageUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              {/* URL Input Helper */}
              <div className="flex gap-2">
                <Input
                  placeholder="Or paste external image URL..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                  className="text-xs h-9"
                />
                <Button type="button" variant="outline" size="sm" onClick={addImageUrl} className="shrink-0 h-9">
                  <LinkIcon className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {/* Pages Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {pages.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground text-xs border-2 border-dashed border-white/5 rounded-xl">
                    No pages added yet. Select image files above to build the chapter.
                  </div>
                ) : (
                  pages.map((img, idx) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      onDragEnd={() => setDraggedItemIdx(null)}
                      className={`relative aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group bg-black/20 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                        draggedItemIdx === idx ? 'opacity-50 scale-95 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-100 hover:ring-2 hover:ring-white/20'
                      }`}
                    >
                      <img src={img.previewUrl} alt={`Page ${img.order}`} className="object-cover w-full h-full" />
                      <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-sm text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                        {img.order}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePage(idx); }}
                        className="absolute top-1.5 right-1.5 bg-red-500/90 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {pages.length > 0 && (
                <div className="text-[11px] text-center text-muted-foreground">
                  Total {pages.length} pages. Drag any page thumbnail to reorder reading sequence.
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Status Indicator */}
          {uploadProgress && (
            <div className="md:col-span-2 p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center gap-3 text-primary text-sm font-medium animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              <span>{uploadProgress}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="secondary" type="button" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={loading}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
            >
              <FileText className="w-4 h-4 mr-2" /> Save as Draft
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 px-8 font-bold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
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
