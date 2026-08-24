"use client";

import React from "react";
import {
  Camera,
  Gift,
  History,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";

export type ProfileTabType = "info" | "referrals" | "history" | "security";

interface ProfileSidebarProps {
  profile: any;
  name: string;
  image: string;
  tab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
  onImageUploaded: (url: string) => void;
}

export function ProfileSidebar({
  profile,
  name,
  image,
  tab,
  onTabChange,
  onImageUploaded,
}: ProfileSidebarProps) {
  return (
    <aside className="w-full md:w-64 space-y-2">
      <div className="glass p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center mb-6">
        <div className="relative group mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 p-1 bg-background">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
            title="Upload new image"
          >
            <Camera className="w-4 h-4" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append("image", file);

                const url =
                  typeof window !== "undefined"
                    ? ""
                    : process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:5000";
                const res = await fetch(`${url}/api/v1/upload`, {
                  method: "POST",
                  body: formData,
                  credentials: "include",
                });
                const data = await res.json();
                if (data.success && data.data?.url) {
                  onImageUploaded(data.data.url);
                  toast.success("Image uploaded! Click Save Changes below.");
                } else {
                  toast.error("Failed to upload image");
                }
              }}
            />
          </label>
        </div>
        <h2 className="font-bold text-lg">{profile?.name}</h2>
        <p className="text-xs text-muted-foreground">{profile?.email}</p>
        <div className="mt-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs capitalize flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {profile?.role}
        </div>

        {/* User Stats Summary */}
        <div className="grid grid-cols-2 gap-2 w-full mt-6 pt-6 border-t border-white/5">
          <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center">
            <span className="text-sm font-bold">{profile?.points.toLocaleString()}</span>
            <span className="text-[10px] font-medium uppercase opacity-60">Points</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center">
            <span className="text-sm font-bold">{profile?.bookmarks?.length || 0}</span>
            <span className="text-[10px] font-medium uppercase opacity-60">Saved</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onTabChange("info")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
          tab === "info"
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : "glass glass-hover text-muted-foreground hover:text-white"
        }`}
      >
        <UserIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Personal Info</span>
      </button>

      <button
        onClick={() => onTabChange("referrals")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
          tab === "referrals"
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : "glass glass-hover text-muted-foreground hover:text-white"
        }`}
      >
        <Gift className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium">Referrals & Rewards</span>
      </button>

      <button
        onClick={() => onTabChange("history")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
          tab === "history"
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : "glass glass-hover text-muted-foreground hover:text-white"
        }`}
      >
        <History className="w-4 h-4" />
        <span className="text-sm font-medium">Transactions</span>
      </button>

      <button
        onClick={() => onTabChange("security")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
          tab === "security"
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : "glass glass-hover text-muted-foreground hover:text-white"
        }`}
      >
        <Lock className="w-4 h-4" />
        <span className="text-sm font-medium">Security</span>
      </button>
    </aside>
  );
}
