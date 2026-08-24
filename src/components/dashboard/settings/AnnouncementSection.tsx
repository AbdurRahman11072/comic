"use client";

import React from "react";
import { Megaphone } from "lucide-react";

interface AnnouncementSectionProps {
  form: any;
  updateField: (key: string, value: any) => void;
}

export function AnnouncementSection({ form, updateField }: AnnouncementSectionProps) {
  return (
    <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-primary" /> Top Banner Announcement
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Banner Text
          </label>
          <input
            type="text"
            value={form.announceText}
            onChange={(e) => updateField("announceText", e.target.value)}
            placeholder="🎉 New chapter releases are live! Join our Discord community."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Target Link
          </label>
          <input
            type="text"
            value={form.announceLink}
            onChange={(e) => updateField("announceLink", e.target.value)}
            placeholder="https://discord.gg/... or /series"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
          />
        </div>
      </div>
    </div>
  );
}
