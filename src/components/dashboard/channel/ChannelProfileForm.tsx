"use client";

import React from "react";
import { FileText, Loader2, Save, Type } from "lucide-react";

interface ChannelProfileFormProps {
  channelName: string;
  description: string;
  saving: boolean;
  onChannelNameChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChannelProfileForm({
  channelName,
  description,
  saving,
  onChannelNameChange,
  onDescriptionChange,
  onSubmit,
}: ChannelProfileFormProps) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
      {/* Channel Name */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Type className="w-4 h-4 text-muted-foreground" /> Channel Name
        </label>
        <input
          type="text"
          value={channelName}
          onChange={(e) => onChannelNameChange(e.target.value)}
          placeholder="My Awesome Channel"
          required
          maxLength={60}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white placeholder:text-muted-foreground text-sm"
        />
        <p className="text-[11px] text-muted-foreground mt-1.5 flex justify-between">
          <span>This is the public name displayed on your creator profile.</span>
          <span>{channelName.length}/60</span>
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <FileText className="w-4 h-4 text-muted-foreground" /> Channel Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Tell readers about your channel, your style, and what series you publish..."
          rows={5}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white placeholder:text-muted-foreground resize-none text-sm"
        />
        <p className="text-[11px] text-muted-foreground mt-1.5 text-right">
          {description.length}/500 characters
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end -mt-4">
        <button
          type="submit"
          onClick={onSubmit}
          disabled={saving || !channelName.trim()}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
