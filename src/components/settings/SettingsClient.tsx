"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Bell,
  BookOpen,
  Lock,
  Moon,
  Volume2,
  Shield,
  LogOut,
  Check,
  ChevronRight,
  Sparkles,
  Gift,
  Coins
} from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "react-hot-toast";

interface UserPreferences {
  notifyBookmarks: boolean;
  notifyRewards: boolean;
  notifyComments: boolean;
  readerMode: "webtoon" | "paginated";
  autoNextChapter: boolean;
  readerTheme: "dark" | "oled" | "slate";
}

const DEFAULT_PREFS: UserPreferences = {
  notifyBookmarks: true,
  notifyRewards: true,
  notifyComments: true,
  readerMode: "webtoon",
  autoNextChapter: true,
  readerTheme: "dark",
};

export function SettingsClient() {
  const { language, setLanguage, languages } = useLanguage();
  const { data: session } = useSession();

  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user_app_preferences");
      if (saved) {
        setPrefs(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      localStorage.setItem("user_app_preferences", JSON.stringify(updated));
      toast.success("Preferences updated", { id: "pref-saved", duration: 1500 });
    } catch {
      // Ignore
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          App Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your language, reading preferences, notifications, and account security.
        </p>
      </div>

      {/* 1. Language Preference */}
      <section className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Language & Translation</h2>
            <p className="text-xs text-muted-foreground">Select your preferred comic reading and interface language.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.map((l) => {
            const isSelected = language.toLowerCase() === l.code.toLowerCase();
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  toast.success(`Language set to ${l.name}`);
                }}
                className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary text-white shadow-lg shadow-primary/10"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20 text-muted-foreground hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <FlagIcon code={l.code} className="w-6 h-4 rounded-sm shadow-sm" />
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {l.name}
                      <span className="text-xs text-muted-foreground font-normal">({l.nativeName})</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground uppercase font-mono mt-0.5">
                      Code: {l.code}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-primary border-primary text-white"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Reading Preferences */}
      <section className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Reader Experience</h2>
            <p className="text-xs text-muted-foreground">Configure default viewer modes and continuous scroll behavior.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Reader Layout Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div>
              <div className="font-bold text-sm text-white">Default Reading Mode</div>
              <div className="text-xs text-muted-foreground mt-0.5">Continuous vertical scroll optimized for mobile webtoons.</div>
            </div>
            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => updatePref("readerMode", "webtoon")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  prefs.readerMode === "webtoon"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Webtoon (Scroll)
              </button>
              <button
                type="button"
                onClick={() => updatePref("readerMode", "paginated")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  prefs.readerMode === "paginated"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Single Page
              </button>
            </div>
          </div>

          {/* Auto Next Chapter */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div>
              <div className="font-bold text-sm text-white">Auto-Advance Chapters</div>
              <div className="text-xs text-muted-foreground mt-0.5">Seamlessly load the next chapter when reaching bottom scroll.</div>
            </div>
            <button
              type="button"
              onClick={() => updatePref("autoNextChapter", !prefs.autoNextChapter)}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer border ${
                prefs.autoNextChapter
                  ? "bg-primary border-primary"
                  : "bg-white/10 border-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.autoNextChapter ? "translate-x-5.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Notification Preferences */}
      <section className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Notifications & Alerts</h2>
            <p className="text-xs text-muted-foreground">Manage notifications for new releases, rewards, and comments.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div>
              <div className="font-bold text-sm text-white">Bookmark Release Alerts</div>
              <div className="text-xs text-muted-foreground">Get notified immediately when bookmarked series upload a new chapter.</div>
            </div>
            <button
              type="button"
              onClick={() => updatePref("notifyBookmarks", !prefs.notifyBookmarks)}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer border ${
                prefs.notifyBookmarks ? "bg-primary border-primary" : "bg-white/10 border-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.notifyBookmarks ? "translate-x-5.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div>
              <div className="font-bold text-sm text-white">Rewards & Free Points Notices</div>
              <div className="text-xs text-muted-foreground">Receive updates for daily ad watch resets and new promo codes.</div>
            </div>
            <button
              type="button"
              onClick={() => updatePref("notifyRewards", !prefs.notifyRewards)}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer border ${
                prefs.notifyRewards ? "bg-primary border-primary" : "bg-white/10 border-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.notifyRewards ? "translate-x-5.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Account Security & Quick Links */}
      {session?.user && (
        <section className="glass rounded-[2rem] border border-white/5 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Account & Security</h2>
              <p className="text-xs text-muted-foreground">Manage your credentials, referrals, and active sessions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/profile/security"
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/70 group-hover:text-white">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Change Password</div>
                  <div className="text-xs text-muted-foreground">Update your account login password</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/profile/referrals"
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Referrals & Rewards</div>
                  <div className="text-xs text-muted-foreground">Invite friends and earn free points</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out of Account
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
