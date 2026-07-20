"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Image as ImageIcon, Loader2, UploadCloud, Link as LinkIcon } from "lucide-react";
import { type Series } from "@/types";
import { CreateSeriesAction, UpdateSeriesAction } from "@/actions/series";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/api";
import { toast } from "react-hot-toast";

interface SeriesFormProps {
  initialData?: Series;
}

export function SeriesForm({ initialData }: SeriesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [genres, setGenres] = useState<string[]>(initialData?.genres.map(g => g.name) || []);
  const [genreInput, setGenreInput] = useState("");
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    altTitles: initialData?.altTitles || "",
    type: initialData?.type?.toLowerCase() || "manhwa",
    status: initialData?.status || "ONGOING",
    description: initialData?.description || "",
    coverUrl: initialData?.coverUrl || "",
    bgUrl: initialData?.bgUrl || ""
  });

  const addGenre = () => {
    if (genreInput && !genres.includes(genreInput)) {
      setGenres([...genres, genreInput]);
      setGenreInput("");
    }
  };

  const removeGenre = (genre: string) => {
    setGenres(genres.filter((g) => g !== genre));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "coverUrl" | "bgUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setFormData(prev => ({ ...prev, [field]: res.data.url }));
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        const res = await UpdateSeriesAction(initialData.id, {
          ...formData,
          genres
        });
        if (!res.success) throw new Error(res.message);
      } else {
        const res = await CreateSeriesAction({
          ...formData,
          genres
        });
        if (!res.success) throw new Error(res.message);
      }
      router.push("/dashboard/series");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to save series:", error);
      toast.error(error.message || "Failed to save series. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {initialData ? "Edit Series" : "Add New Series"}
          </h1>
          <p className="text-muted-foreground">
            {initialData ? `Updating ${initialData.title}` : "Fill in the details below to create a new series entry."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
          {/* Main Info */}
          <div className="space-y-6 glass p-6 rounded-2xl border border-white/5">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Basic Information
              </h2>
              <div className="space-y-2">
                <Label htmlFor="title">Series Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Solo Leveling" 
                  required 
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altTitles">Alternative Titles</Label>
                <Input 
                  id="altTitles" 
                  placeholder="e.g. Na Honjaman Level Up" 
                  value={formData.altTitles}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select 
                    id="type" 
                    value={formData.type} 
                    onChange={handleInputChange as any}
                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-10"
                  >
                    <option value="manhwa">Manhwa</option>
                    <option value="manga">Manga</option>
                    <option value="manhua">Manhua</option>
                    <option value="comic">Comic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status" 
                    value={formData.status} 
                    onChange={handleInputChange as any}
                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-10"
                  >
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="HIATUS">Hiatus</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Write a brief summary..." 
                  className="min-h-[120px] bg-background/50 border-white/10" 
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Media & Genres */}
          <div className="space-y-6 glass p-6 rounded-2xl border border-white/5">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Media & Tags
              </h2>
              <div className="space-y-3">
                <Label>Cover Image</Label>
                <div 
                  onClick={() => !uploading && document.getElementById('coverUpload')?.click()}
                  className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-dashed border-white/20 bg-background/50 hover:bg-white/5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group"
                >
                  {formData.coverUrl ? (
                    <>
                      <img src={formData.coverUrl} alt="Cover" className="object-cover w-full h-full opacity-80 group-hover:opacity-60 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm text-white flex items-center gap-2 text-sm font-medium">
                          <UploadCloud className="w-4 h-4" /> Change Image
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                      {uploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : <UploadCloud className="w-8 h-8" />}
                      <span className="text-sm font-medium">{uploading ? "Uploading..." : "Click to upload Cover Image"}</span>
                    </div>
                  )}
                  <input 
                    id="coverUpload"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, "coverUrl")} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Background Image</Label>
                <div 
                  onClick={() => !uploading && document.getElementById('bgUpload')?.click()}
                  className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-dashed border-white/20 bg-background/50 hover:bg-white/5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group"
                >
                  {formData.bgUrl ? (
                    <>
                      <img src={formData.bgUrl} alt="Background" className="object-cover w-full h-full opacity-80 group-hover:opacity-60 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm text-white flex items-center gap-2 text-sm font-medium">
                          <UploadCloud className="w-4 h-4" /> Change Image
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                      {uploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : <UploadCloud className="w-8 h-8" />}
                      <span className="text-sm font-medium">{uploading ? "Uploading..." : "Click to upload Background Image"}</span>
                    </div>
                  )}
                  <input 
                    id="bgUpload"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, "bgUrl")} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Genres</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add genre..." 
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGenre())}
                    className="bg-background/50 border-white/10"
                  />
                  <Button type="button" variant="secondary" onClick={addGenre}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {genres.map((genre) => (
                    <span key={genre} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30">
                      {genre}
                      <X className="w-3 h-3 cursor-pointer hover:text-foreground" onClick={() => removeGenre(genre)} />
                    </span>
                  ))}
                </div>
              </div>
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
                "Save Series"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
