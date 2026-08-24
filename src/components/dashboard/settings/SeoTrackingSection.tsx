"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

interface SeoTrackingSectionProps {
  form: any;
  updateField: (key: string, value: any) => void;
}

export function SeoTrackingSection({ form, updateField }: SeoTrackingSectionProps) {
  return (
    <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" /> Search Engine Optimization & Tracking
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Default Meta Title
          </label>
          <input
            type="text"
            value={form.seoTitle}
            onChange={(e) => updateField("seoTitle", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Default Meta Description
          </label>
          <textarea
            rows={3}
            value={form.seoDescription}
            onChange={(e) => updateField("seoDescription", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Meta Keywords (comma separated)
          </label>
          <input
            type="text"
            value={form.seoKeywords}
            onChange={(e) => updateField("seoKeywords", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Google Analytics / Tag Manager Tracking ID
          </label>
          <input
            type="text"
            value={form.gaTrackingId}
            onChange={(e) => updateField("gaTrackingId", e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Google AdSense Publisher / Client ID
          </label>
          <input
            type="text"
            value={form.adClient}
            onChange={(e) => updateField("adClient", e.target.value)}
            placeholder="ca-pub-8848458851675460"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono"
          />
        </div>
      </div>
    </div>
  );
}
