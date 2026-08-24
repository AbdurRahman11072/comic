"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface SeriesBasicInfoSectionProps {
  formData: {
    title: string;
    altTitles: string;
    type: string;
    status: string;
    description: string;
  };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export function SeriesBasicInfoSection({
  formData,
  onInputChange,
}: SeriesBasicInfoSectionProps) {
  return (
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
            onChange={onInputChange}
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
            onChange={onInputChange}
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
              onChange={onInputChange}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
            >
              <option value="MANHWA" className="bg-neutral-900">
                Manhwa (Webtoon)
              </option>
              <option value="MANGA" className="bg-neutral-900">
                Manga (Japanese)
              </option>
              <option value="MANHUA" className="bg-neutral-900">
                Manhua (Chinese)
              </option>
              <option value="COMIC" className="bg-neutral-900">
                Comic (Western)
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Release Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={onInputChange}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
            >
              <option value="ONGOING" className="bg-neutral-900">
                Ongoing
              </option>
              <option value="COMPLETED" className="bg-neutral-900">
                Completed
              </option>
              <option value="HIATUS" className="bg-neutral-900">
                Hiatus / Draft
              </option>
              <option value="DROPPED" className="bg-neutral-900">
                Dropped
              </option>
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
            onChange={onInputChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}
