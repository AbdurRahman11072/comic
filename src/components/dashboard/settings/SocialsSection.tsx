"use client";

import React from "react";
import { Share2 } from "lucide-react";

interface SocialsSectionProps {
  form: any;
  updateField: (key: string, value: any) => void;
}

export function SocialsSection({ form, updateField }: SocialsSectionProps) {
  const socialChannels = [
    { key: "discord", label: "Discord Community Invite", placeholder: "https://discord.gg/..." },
    { key: "twitter", label: "X / Twitter URL", placeholder: "https://twitter.com/..." },
    { key: "telegram", label: "Telegram Channel URL", placeholder: "https://t.me/..." },
    { key: "youtube", label: "YouTube Channel URL", placeholder: "https://youtube.com/@..." },
    { key: "instagram", label: "Instagram Profile URL", placeholder: "https://instagram.com/..." },
    { key: "facebook", label: "Facebook Page URL", placeholder: "https://facebook.com/..." },
    { key: "reddit", label: "Reddit Subreddit URL", placeholder: "https://reddit.com/r/..." },
  ];

  return (
    <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Share2 className="w-5 h-5 text-primary" /> Official Social Channels
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialChannels.map((s) => (
          <div key={s.key}>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              {s.label}
            </label>
            <input
              type="text"
              value={form[s.key] || ""}
              onChange={(e) => updateField(s.key, e.target.value)}
              placeholder={s.placeholder}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
