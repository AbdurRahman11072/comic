"use client";

import { useState, useRef } from "react";
import { Sparkles, Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

interface BrandingSettingsSectionProps {
  form: any;
  updateField: (key: string, value: any) => void;
}

export function BrandingSettingsSection({ form, updateField }: BrandingSettingsSectionProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo image size must be under 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const uploadUrl =
        typeof window !== "undefined"
          ? ""
          : (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "");
      const res = await fetch(`${uploadUrl}/api/v1/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        updateField("appLogoUrl", data.data.url);
        toast.success("Logo uploaded successfully!");
      } else {
        toast.error(data.message || "Failed to upload logo.");
      }
    } catch {
      toast.error("Failed to upload logo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" /> App Identity & Hero Copy
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Application Name
          </label>
          <input
            type="text"
            value={form.appName}
            onChange={(e) => updateField("appName", e.target.value)}
            placeholder="Comic BD"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-primary/50 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            App Tagline / Slogan
          </label>
          <input
            type="text"
            value={form.appTagline}
            onChange={(e) => updateField("appTagline", e.target.value)}
            placeholder="Read Trending Webtoons, Manga & Comics"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-primary/50 outline-none"
          />
        </div>

        {/* Logo Image Upload & URL */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Brand Logo (Optional)
          </label>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            {/* Logo Preview */}
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative group">
              {form.appLogoUrl ? (
                <>
                  <img
                    src={form.appLogoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain p-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => updateField("appLogoUrl", "")}
                    className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400 cursor-pointer"
                    title="Remove Logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <ImageIcon className="w-6 h-6 text-white/30" />
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {uploading ? "Uploading to Cloud..." : "Upload Logo File"}
                </button>
                {form.appLogoUrl && (
                  <button
                    type="button"
                    onClick={() => updateField("appLogoUrl", "")}
                    className="text-xs text-white/40 hover:text-red-400 transition cursor-pointer"
                  >
                    Clear Logo
                  </button>
                )}
              </div>
              <input
                type="text"
                value={form.appLogoUrl}
                onChange={(e) => updateField("appLogoUrl", e.target.value)}
                placeholder="Or enter direct image URL: https://..."
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-primary/50 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Hero Headline
          </label>
          <input
            type="text"
            value={form.heroHeadline}
            onChange={(e) => updateField("heroHeadline", e.target.value)}
            placeholder="Discover Unlimited Stories & Comics"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-primary/50 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Hero Subtitle
          </label>
          <textarea
            rows={3}
            value={form.heroSubtitle}
            onChange={(e) => updateField("heroSubtitle", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none resize-none text-sm"
          />
        </div>
      </div>
    </div>
  );
}

