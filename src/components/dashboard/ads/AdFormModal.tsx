"use client";

import React from "react";
import { Globe, Loader2, Smartphone, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomAdItem } from "@/services/ad.service";

interface AdFormModalProps {
  open: boolean;
  editAd: CustomAdItem | null;
  form: any;
  countriesInput: string;
  saving: boolean;
  onClose: () => void;
  onFormChange: (form: any) => void;
  onCountriesInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdFormModal({
  open,
  editAd,
  form,
  countriesInput,
  saving,
  onClose,
  onFormChange,
  onCountriesInputChange,
  onSubmit,
}: AdFormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass border border-white/10 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              {editAd ? "Edit Ad Unit" : "Create New Ad Placement"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure ad network parameters and rewards
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Title & Placement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">
                Campaign / Unit Title
              </label>
              <Input
                required
                placeholder="e.g. Header Leaderboard Sponsor"
                value={form.title}
                onChange={(e) => onFormChange({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">Placement Slot</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                value={form.placement}
                onChange={(e) => onFormChange({ ...form, placement: e.target.value })}
              >
                <option value="home_top" className="bg-neutral-900">
                  Home Top Banner
                </option>
                <option value="home_bottom" className="bg-neutral-900">
                  Home Bottom Banner
                </option>
                <option value="reader_bottom" className="bg-neutral-900">
                  Reader Bottom Banner
                </option>
                <option value="reader_interstitial" className="bg-neutral-900">
                  Reader Interstitial (Every X chapters)
                </option>
                <option value="rewarded_unlock" className="bg-neutral-900">
                  Rewarded Video (Free points / unlock)
                </option>
                <option value="browse_banner" className="bg-neutral-900">
                  Browse / Catalog Banner
                </option>
              </select>
            </div>
          </div>

          {/* Provider & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">Ad Provider</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                value={form.provider}
                onChange={(e) => onFormChange({ ...form, provider: e.target.value as any })}
              >
                <option value="CUSTOM" className="bg-neutral-900">
                  Custom Sponsor / Direct
                </option>
                <option value="ADSENSE" className="bg-neutral-900">
                  Google AdSense (Web)
                </option>
                <option value="ADMOB" className="bg-neutral-900">
                  Google AdMob (Mobile)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">Ad Format</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                value={form.format}
                onChange={(e) => onFormChange({ ...form, format: e.target.value as any })}
              >
                <option value="BANNER" className="bg-neutral-900">
                  Banner Display
                </option>
                <option value="REWARDED" className="bg-neutral-900">
                  Rewarded Video
                </option>
                <option value="INTERSTITIAL" className="bg-neutral-900">
                  Interstitial Full-screen
                </option>
                <option value="NATIVE" className="bg-neutral-900">
                  Native In-feed
                </option>
              </select>
            </div>
          </div>

          {/* Provider Specific Settings */}
          {form.provider === "ADSENSE" && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-3">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Google AdSense Configuration
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Ad Client ID</label>
                  <Input
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    value={form.adClient}
                    onChange={(e) => onFormChange({ ...form, adClient: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Ad Slot ID</label>
                  <Input
                    placeholder="1234567890"
                    value={form.adSlotId}
                    onChange={(e) => onFormChange({ ...form, adSlotId: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {form.provider === "ADMOB" && (
            <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 space-y-3">
              <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" /> Google AdMob (React Native App)
              </span>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">AdMob Unit ID</label>
                <Input
                  placeholder="ca-app-pub-3940256099942544/5224354917"
                  value={form.adUnitId}
                  onChange={(e) => onFormChange({ ...form, adUnitId: e.target.value })}
                />
              </div>
            </div>
          )}

          {form.provider === "CUSTOM" && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Custom Sponsor Media
              </span>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Banner Image URL</label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={form.imageUrl}
                    onChange={(e) => onFormChange({ ...form, imageUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">
                    Click-through Destination URL
                  </label>
                  <Input
                    placeholder="https://sponsor.com/offer"
                    value={form.linkUrl}
                    onChange={(e) => onFormChange({ ...form, linkUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">
                    Video URL (Optional for video ads)
                  </label>
                  <Input
                    placeholder="https://cdn.example.com/ad.mp4"
                    value={form.videoUrl}
                    onChange={(e) => onFormChange({ ...form, videoUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reward Points & Country Geo-targeting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">
                Points Awarded on Completion
              </label>
              <Input
                type="number"
                min={0}
                value={form.points}
                onChange={(e) => onFormChange({ ...form, points: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">
                Target Countries (comma separated ISO)
              </label>
              <Input
                placeholder="e.g. US, CA, GB, BD (leave empty for Global)"
                value={countriesInput}
                onChange={(e) => onCountriesInputChange(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white glass cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editAd ? "Update Ad Unit" : "Save Placement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
