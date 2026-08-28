"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, BookOpen, Check, FileText, Loader2 } from "lucide-react";
import { type Series } from "@/types";
import { CreateSeriesAction, UpdateSeriesAction } from "@/actions/series";
import { uploadImage } from "@/lib/api";

import { SeriesBasicInfoSection } from "./SeriesBasicInfoSection";
import { SeriesVisualsSection } from "./SeriesVisualsSection";
import { SeriesGenreSelector } from "./SeriesGenreSelector";
import { LoadingProgressModal, ProgressState } from "@/components/ui/LoadingProgressModal";

interface SeriesFormProps {
  initialData?: Series;
}

export function SeriesForm({ initialData }: SeriesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progressInfo, setProgressInfo] = useState<ProgressState | null>(null);
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
    setProgressInfo({
      title: "Preparing Series Assets",
      percent: 10,
      statusText: "Preparing series details...",
    });

    try {
      let finalCoverUrl = formData.coverUrl;
      let finalBgUrl = formData.bgUrl;

      // Upload cover file only on publish/save
      if (coverFile) {
        setProgressInfo({
          title: "Uploading Cover Poster",
          percent: 35,
          statusText: "Uploading cover image to cloud storage...",
        });
        const res = await uploadImage(coverFile);
        if (res.data?.url) {
          finalCoverUrl = res.data.url;
        }
      }

      // Upload background file only on publish/save
      if (bgFile) {
        setProgressInfo({
          title: "Uploading Banner Image",
          percent: 70,
          statusText: "Uploading banner image to cloud storage...",
        });
        const res = await uploadImage(bgFile);
        if (res.data?.url) {
          finalBgUrl = res.data.url;
        }
      }

      setProgressInfo({
        title: isDraft ? "Saving Draft" : "Publishing Series",
        percent: 90,
        statusText: "Writing series records to database...",
      });

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
        setProgressInfo({
          title: "Complete",
          percent: 100,
          statusText: isDraft ? "Draft saved successfully!" : "Series updated successfully!",
        });
        toast.success(isDraft ? "Draft saved successfully!" : "Series updated successfully!");
      } else {
        const res = await CreateSeriesAction(payload);
        if (!res.success) throw new Error(res.message);
        setProgressInfo({
          title: "Complete",
          percent: 100,
          statusText: isDraft ? "Draft saved successfully!" : "Series published successfully!",
        });
        toast.success(isDraft ? "Draft saved successfully!" : "Series published successfully!");
      }
      router.push("/dashboard/series");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to save series:", error);
      toast.error(error.message || "Failed to save series.");
    } finally {
      setLoading(false);
      setProgressInfo(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Shared Progress Modal */}
      <LoadingProgressModal progressInfo={progressInfo} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition mb-2 cursor-pointer"
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(false);
        }}
        className="space-y-8"
      >
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column: Basic Information (7 cols) */}
          <SeriesBasicInfoSection formData={formData} onInputChange={handleInputChange} />

          {/* Right Column: Visuals & Tags (5 cols) */}
          <SeriesVisualsSection
            coverPreview={coverPreview}
            bgPreview={bgPreview}
            onFileSelect={handleFileSelect}
            onRemoveCover={handleRemoveCover}
            onRemoveBg={handleRemoveBg}
          />
        </div>

        {/* Full-width Genre Tag Selector */}
        <SeriesGenreSelector
          genres={genres}
          genreInput={genreInput}
          onToggleGenre={toggleGenre}
          onGenreInputChange={setGenreInput}
          onAddCustomGenre={addCustomGenre}
        />


        {/* Submit Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white/70 hover:text-white glass cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {initialData ? "Save Changes" : "Publish Series"}
          </button>
        </div>
      </form>
    </div>
  );
}
