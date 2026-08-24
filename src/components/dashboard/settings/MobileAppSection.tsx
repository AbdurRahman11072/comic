"use client";

import React from "react";
import { Smartphone } from "lucide-react";

interface MobileAppSectionProps {
  form: any;
  updateField: (key: string, value: any) => void;
}

export function MobileAppSection({ form, updateField }: MobileAppSectionProps) {
  return (
    <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Smartphone className="w-5 h-5 text-primary" /> Mobile App Download Links
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Google Play Store URL
          </label>
          <input
            type="text"
            value={form.playStoreUrl}
            onChange={(e) => updateField("playStoreUrl", e.target.value)}
            placeholder="https://play.google.com/..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Apple App Store URL
          </label>
          <input
            type="text"
            value={form.appStoreUrl}
            onChange={(e) => updateField("appStoreUrl", e.target.value)}
            placeholder="https://apps.apple.com/..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
}
