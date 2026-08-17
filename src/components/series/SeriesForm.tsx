"use client";

import { useState } from "react";
import {
  Plus, X, Image as ImageIcon, Loader2, UploadCloud,
  Sparkles, BookOpen, Layers, Check, ArrowLeft, FileText, Trash2
} from "lucide-react";
import { type Series } from "@/types";
import { CreateSeriesAction, UpdateSeriesAction } from "@/actions/series";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/api";
import { toast } from "react-hot-toast";

interface SeriesFormProps {
  initialData?: Series;
}

const PRESET_GENRES = [
  "Action", "Romance", "Fantasy", "Martial Arts", "Comedy",
  "Drama", "Slice of Life", "Sci-Fi", "Horror", "Isekai",
  "Adventure", "Supernatural", "Mystery", "School Life"
];

export function SeriesForm({ initialData }: SeriesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [genres, setGenres] = useState<string[]>(initialData?.genres.map((g) => g.name) || []);
  const [genreInput, setGenreInput] = useState("");

  // Local file handles for deferred upload
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(initialData?.coverUrl || "");
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string>(initialData?.bgUrl || "");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    altTitles: initialData?.altTitles || "",
    type: (initialData?.type || "MANHWA").toUpperCase(),
    status: (initialData?.status || "ONGOING").toUpperCase(),
    description: initialData?.description || "",
    coverUrl: initialData?.coverUrl || "",
    bgUrl: initialData?.bgUrl || "",
  });

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  };

  const addCustomGenre = () => {
    const trimmed = genreInput.trim();
    if (trimmed && !genres.includes(trimmed)) {
      setGenres([...genres, trimmed]);
      setGenreInput("");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Instant local preview without uploading to Cloudinary
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "coverUrl" | "bgUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (field === "coverUrl") {
      setCoverFile(file);
      setCoverPreview(previewUrl);
    } else {
      setBgFile(file);
      setBgPreview(previewUrl);
    }
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverFile(null);
    setCoverPreview("");
    setFormData((prev) => ({ ...prev, coverUrl: "" }));
  };

  const handleRemoveBg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBgFile(null);
    setBgPreview("");
    setFormData((prev) => ({ ...prev, bgUrl: "" }));
  };

  const handleSave = async (isDraft: boolean = false) => {
    if (!formData.title.trim()) {
      toast.error("Series title is required.");
      return;
    }

    setLoading(true);
    setUploadStatus("Preparing assets...");

    try {
      let finalCoverUrl = formData.coverUrl;
      let finalBgUrl = formData.bgUrl;

      // Upload cover file only on publish/save
      if (coverFile) {
        setUploadStatus("Uploading cover poster to Cloudinary...");
        const res = await uploadImage(coverFile);
        if (res.data?.url) {
          finalCoverUrl = res.data.url;
        }
      }

      // Upload background file only on publish/save
      if (bgFile) {
        setUploadStatus("Uploading banner image to Cloudinary...");
        const res = await uploadImage(bgFile);
        if (res.data?.url) {
          finalBgUrl = res.data.url;
        }
      }

      setUploadStatus("Saving series publication details...");

      const payload = {
        ...formData,
        coverUrl: finalCoverUrl,
        bgUrl: finalBgUrl,
        type: (formData.type || "MANHWA").toUpperCase(),
        status: isDraft ? "HIATUS" : (formData.status || "ONGOING").toUpperCase(),
        isHidden: isDraft ? true : ((initialData as any)?.isHidden || false),
        genres: genres.length > 0 ? genres : ["Action"],
      };

      if (initialData) {
        const res = await UpdateSeriesAction(initialData.id, payload);
        if (!res.success) throw new Error(res.message);
        toast.success(isDraft ? "Draft saved successfully!" : "Series updated successfully!");
      } else {
        const res = await CreateSeriesAction(payload);
        if (!res.success) throw new Error(res.message);
        toast.success(isDraft ? "Draft saved successfully!" : "Series published successfully!");
      }
      router.push("/dashboard/series");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to save series:", error);
      toast.error(error.message || "Failed to save series.");
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Series List
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <BookOpen className="w-6 h-6 text-primary" />
            {initialData ? "Edit Series Details" : "Create New Series"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {initialData
              ? `Updating "${initialData.title}" publication details.`
              : "Publish a new manga, manhwa, or comic series to your studio channel."}
          </p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column: Basic Information (7 cols) */}
          <div className="md:col-span-7 space-y-6 glass p-6 sm:p-8 rounded-3xl border border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Series Title *
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Solo Leveling"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-primary/50 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Alternative Titles (Comma separated)
                </label>
                <input
                  id="altTitles"
                  type="text"
                  placeholder="e.g. Na Honjaman Level Up, Only I Level Up"
                  value={formData.altTitles}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Format / Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={handleInputChange as any}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
                  >
                    <option value="MANHWA" className="bg-neutral-900">Manhwa (Webtoon)</option>
                    <option value="MANGA" className="bg-neutral-900">Manga (Japanese)</option>
                    <option value="MANHUA" className="bg-neutral-900">Manhua (Chinese)</option>
                    <option value="COMIC" className="bg-neutral-900">Comic (Western)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Release Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange as any}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
                  >
                    <option value="ONGOING" className="bg-neutral-900">Ongoing</option>
                    <option value="COMPLETED" className="bg-neutral-900">Completed</option>
                    <option value="HIATUS" className="bg-neutral-900">Hiatus / Draft</option>
                    <option value="DROPPED" className="bg-neutral-900">Dropped</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Synopsis / Description
                </label>
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Write an engaging synopsis to hook readers..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Visuals & Tags (5 cols) */}
          <div className="md:col-span-5 space-y-6 glass p-6 sm:p-8 rounded-3xl border border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> Cover & Visuals
            </h2>

            {/* Cover Upload Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Cover Poster (3:4)
                </label>
                {coverPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>

              <div
                onClick={() => document.getElementById("coverUpload")?.click()}
                className="relative w-full h-44 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col items-center justify-center group"
              >
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Cover"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-primary" /> Replace Poster
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-white transition-colors p-4 text-center">
                    <UploadCloud className="w-7 h-7 text-primary" />
                    <span className="text-xs font-semibold">
                      Click to choose Poster Cover
                    </span>
                    <span className="text-[10px] text-white/40">Instant preview (Uploads on Publish)</span>
                  </div>
                )}
                <input
                  id="coverUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "coverUrl")}
                />
              </div>
            </div>

            {/* Background Banner Upload Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Header Banner (16:9)
                </label>
                {bgPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveBg}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>

              <div
                onClick={() => document.getElementById("bgUpload")?.click()}
                className="relative w-full h-28 rounded-2xl overflow-hidden border-2 border-dashed border-white/15 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col items-center justify-center group"
              >
                {bgPreview ? (
                  <>
                    <img
                      src={bgPreview}
                      alt="Banner"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-primary" /> Replace Banner
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground group-hover:text-white transition-colors p-4 text-center">
                    <UploadCloud className="w-6 h-6 text-primary" />
                    <span className="text-xs font-semibold">
                      Click to choose Wide Banner
                    </span>
                    <span className="text-[10px] text-white/40">Instant preview (Uploads on Publish)</span>
                  </div>
                )}
                <input
                  id="bgUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "bgUrl")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Genre Tag Selector */}
        <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Genre Categories & Tags
          </h2>
          <p className="text-xs text-muted-foreground">
            Select matching genre tags to help readers discover your series in browse & category filters.
          </p>

          {/* Preset Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {PRESET_GENRES.map((preset) => {
              const selected = genres.includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => toggleGenre(preset)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selected
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {preset}
                </button>
              );
            })}
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2 pt-2 max-w-md">
            <input
              type="text"
              placeholder="Add custom tag..."
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomGenre();
                }
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={addCustomGenre}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
            >
              Add Tag
            </button>
          </div>

          {/* Selected Custom Tags (if not in preset) */}
          {genres.filter((g) => !PRESET_GENRES.includes(g)).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {genres
                .filter((g) => !PRESET_GENRES.includes(g))
                .map((g) => (
                  <span
                    key={g}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/20 text-primary text-xs font-bold border border-primary/30"
                  >
                    {g}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-white"
                      onClick={() => toggleGenre(g)}
                    />
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Upload Progress Status Indicator */}
        {uploadStatus && (
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center gap-3 text-primary text-sm font-medium animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white/70 hover:text-white glass"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {initialData ? "Save Changes" : "Publish Series"}
          </button>
        </div>
      </form>
    </div>
  );
}
