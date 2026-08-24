"use client";

import { Sparkles } from "lucide-react";

interface BrandingSettingsSectionProps {
  form: any;
  updateField: (key: string, value: any) => void;
}

export function BrandingSettingsSection({ form, updateField }: BrandingSettingsSectionProps) {
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

        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Logo Image URL (Optional)
          </label>
          <input
            type="text"
            value={form.appLogoUrl}
            onChange={(e) => updateField("appLogoUrl", e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none"
          />
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
