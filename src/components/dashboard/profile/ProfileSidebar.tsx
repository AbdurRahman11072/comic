"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  Gift,
  History,
  Lock,
  User as UserIcon,
  Settings,
  Coins,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ProfileSidebarProps {
  profile: any;
  name: string;
  image: string;
  onImageUploaded?: (url: string) => void;
}

export function ProfileSidebar({
  profile,
  name,
  image,
  onImageUploaded,
}: ProfileSidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      label: "Personal Info",
      href: "/profile",
      icon: UserIcon,
      isActive: pathname === "/profile",
    },
    {
      label: "Referrals & Rewards",
      href: "/profile/referrals",
      icon: Gift,
      iconColor: "text-purple-400",
      isActive: pathname === "/profile/referrals",
    },
    {
      label: "Transactions & Cashout",
      href: "/transactions",
      icon: History,
      isActive: pathname === "/transactions",
    },
    {
      label: "Earn Free Points",
      href: "/rewards",
      icon: Coins,
      iconColor: "text-amber-400",
      isActive: pathname === "/rewards",
    },
    {
      label: "Security & Password",
      href: "/profile/security",
      icon: Lock,
      isActive: pathname === "/profile/security",
    },
    {
      label: "App Settings",
      href: "/settings",
      icon: Settings,
      isActive: pathname === "/settings",
    },
  ];

  return (
    <aside className="w-full md:w-72 space-y-3 shrink-0">
      {/* Profile Card Header */}
      <div className="glass p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
        <div className="relative group mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 p-1 bg-background">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          {onImageUploaded && (
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
                    toast.success("Image uploaded! Click Save Changes.");
                  } else {
                    toast.error("Failed to upload image");
                  }
                }}
              />
            </label>
          )}
        </div>

        <h2 className="font-bold text-lg text-white">{name || profile?.name}</h2>
        <p className="text-xs text-muted-foreground">{profile?.email}</p>
        <div className="mt-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs capitalize flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {profile?.role || "Reader"}
        </div>

        {/* User Stats Summary */}
        <div className="grid grid-cols-2 gap-2 w-full mt-5 pt-5 border-t border-white/5">
          <Link
            href="/rewards"
            className="bg-white/5 hover:bg-white/10 transition p-2.5 rounded-2xl flex flex-col items-center group"
          >
            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
              {profile?.points?.toLocaleString() ?? 0}
            </span>
            <span className="text-[10px] font-medium uppercase text-muted-foreground">Points</span>
          </Link>
          <Link
            href="/bookmarks"
            className="bg-white/5 hover:bg-white/10 transition p-2.5 rounded-2xl flex flex-col items-center group"
          >
            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
              {profile?.bookmarks?.length ?? 0}
            </span>
            <span className="text-[10px] font-medium uppercase text-muted-foreground">Bookmarks</span>
          </Link>
        </div>
      </div>

      {/* Navigation List Links */}
      <div className="glass p-2.5 rounded-[2rem] border border-white/5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                item.isActive
                  ? "bg-primary text-white font-bold shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${item.isActive ? "text-white" : item.iconColor || ""}`} />
                <span className="text-sm">{item.label}</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 opacity-60 transition-transform ${
                  item.isActive ? "translate-x-0.5 text-white" : ""
                }`}
              />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
