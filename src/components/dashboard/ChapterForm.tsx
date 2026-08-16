"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, ListOrdered, UploadCloud, Link as LinkIcon } from "lucide-react";
import { CreateChapterAction, UpdateChapterAction } from "@/actions/chapter";
import { seriesService } from "@/services/series.service";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/api";
import { toast } from "react-hot-toast";

interface ChapterFormProps {
  initialData?: any;
}

export function ChapterForm({ initialData }: ChapterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seriesList, setSeriesList] = useState<{ id: string; title: string }[]>([]);

  const [images, setImages] = useState<{ url: string; order: number }[]>(
    initialData?.images?.map((img: any) => ({ url: img.url, order: img.order })) || []
  );
  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const [formData, setFormData] = useState({
    seriesId: initialData?.seriesId || "",
    number: initialData?.number || 1,
    title: initialData?.title || "",
    isLocked: initialData?.isLocked ?? false,
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

  const addImage = () => {
    if (imageUrlInput) {
      setImages([...images, { url: imageUrlInput, order: images.length + 1 }]);
      setImageUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i + 1 }));
    setImages(updated);
  };

  const handleDragStart = (idx: number) => {
    setDraggedItemIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = (idx: number) => {
    if (draggedItemIdx === null || draggedItemIdx === idx) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedItemIdx];
    newImages.splice(draggedItemIdx, 1);
    newImages.splice(idx, 0, draggedItem);

    const updated = newImages.map((img, i) => ({ ...img, order: i + 1 }));
    setImages(updated);
    setDraggedItemIdx(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadImage(files[i]);
        newImages.push(res.data.url);
      }

      setImages(prev => {
        const startIdx = prev.length;
        return [
          ...prev,
          ...newImages.map((url, i) => ({ url, order: startIdx + i + 1 }))
        ];
      });
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload image(s)");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please add at least one image to the chapter.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        number: Number(formData.number),
        coinCost: Number(formData.coinCost),
        images
      };

      if (initialData && initialData.id) {
        await UpdateChapterAction(initialData.id, payload);
      } else {
        await CreateChapterAction(payload);
      }
      router.push("/dashboard/chapters");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to save chapter:", error);
      toast.error("Failed to save chapter. Check console for details.");
    } finally {
      setLoading(false);
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
            {initialData ? `Updating Chapter ${initialData.number}` : "Upload pages and set details for a new chapter."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
          {/* Main Info */}
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
                  value={(formData as any).publishAt || ""}
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
                    checked={(formData as any).isFastPass || false}
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

          {/* Images */}
          <div className="space-y-6 glass p-6 rounded-2xl border border-white/5">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-primary" />
                Chapter Pages
              </h2>
              <div className="space-y-4">
                <div
                  onClick={() => !uploading && document.getElementById('pageUpload')?.click()}
                  className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-dashed border-white/20 bg-background/50 hover:bg-white/5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                    {uploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : <UploadCloud className="w-8 h-8" />}
                    <span className="text-sm font-medium">{uploading ? "Uploading pages..." : "Click to upload pages (Select multiple)"}</span>
                  </div>
                  <input
                    id="pageUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {images.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-white/5 rounded-xl">
                    No pages added yet.
                  </div>
                ) : (
                  images.map((img, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      onDragEnd={() => setDraggedItemIdx(null)}
                      className={`relative aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group bg-black/20 cursor-grab active:cursor-grabbing transition-all duration-200 ${draggedItemIdx === idx ? 'opacity-50 scale-95 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-100 hover:ring-2 hover:ring-white/20'}`}
                    >
                      <img src={img.url} alt={`Page ${img.order}`} className="object-cover w-full h-full" />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                        {img.order}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {images.length > 0 && (
                <div className="text-[10px] text-center text-muted-foreground">
                  Total {images.length} pages. Images will be shown in the order listed above.
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-end gap-4 pt-4 border-t border-white/10">
            <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 px-8" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Chapter"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
