"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Check,
  ChevronDown,
  ExternalLink,
  Flame,
  Globe,
  LayoutDashboard,
  LogOut,
  Palette,
  Plus,
  Search,
  Settings,
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react";
import { authClient, signOut, useSession } from "@/lib/auth-client";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "earning" | "system" | "series";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Reader Engagement Milestone",
    message: "Your series achieved high-quality readership retention in the latest period.",
    time: "2 hours ago",
    read: false,
    type: "earning",
  },
  {
    id: "2",
    title: "System Update",
    message: "New 70% direct revenue sharing and ad distribution tools are now active.",
    time: "1 day ago",
    read: false,
    type: "system",
  },
];

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user as any;
  const userRole = (user?.role || "user").toLowerCase();
  const isCreatorOrAdmin = ["creator", "admin"].includes(userRole);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/dashboard/series?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    await signOut();
    window.location.href = "/";
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-[90] gap-4">
      {/* ── LEFT: SEARCH BAR ── */}
      <div className="flex items-center gap-3 flex-1 max-w-md ml-10 md:ml-0">
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full flex items-center"
        >
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search series, chapters..."
            className="w-full h-9 pl-9 pr-8 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-0.5 text-muted-foreground hover:text-white transition"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>
      </div>

      {/* ── RIGHT: ACTIONS & USER PROFILE ── */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        {/* CREATE SERIES CTA (Creator & Admin Only) */}
        {isCreatorOrAdmin && (
          <Link
            href="/dashboard/series/add"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-lg shadow-primary/25 transition hover:scale-105 active:scale-95 cursor-pointer"
            style={{ background: "var(--primary)" }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Create Series</span>
          </Link>
        )}

        {/* NOTIFICATION BELL */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-full text-muted-foreground hover:text-white hover:bg-white/5 transition cursor-pointer border border-transparent hover:border-white/10"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-[#0a0a0a]" />
            )}
          </button>

          {/* Notifications Popover */}
          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[300px] sm:w-[340px] rounded-2xl border border-white/10 bg-[#121217] backdrop-blur-2xl shadow-2xl p-4 space-y-3 z-[110] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-muted-foreground hover:text-primary transition flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs space-y-1 transition ${
                      n.read
                        ? "bg-white/[0.01] border-white/5 text-muted-foreground"
                        : "bg-primary/[0.04] border-primary/20 text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[11px] text-white flex items-center gap-1.5">
                        {n.type === "earning" ? (
                          <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <Flame className="w-3 h-3 text-primary shrink-0" />
                        )}
                        {n.title}
                      </p>
                      <span className="text-[9px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE & LOGOUT DROPDOWN */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full glass hover:bg-white/10 transition border border-white/10 cursor-pointer"
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white/20"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-pink-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
                {user?.name || "Account"}
              </p>
              <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-primary">
                {userRole}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {/* User Menu Popover */}
          {userDropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] rounded-2xl border border-white/10 bg-[#121217] backdrop-blur-2xl shadow-2xl p-2 z-[110] space-y-1 animate-in fade-in zoom-in-95 duration-150">
              {/* User Info Header */}
              <div className="p-2.5 border-b border-white/5 space-y-0.5">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-primary font-mono">
                  {userRole}
                </span>
              </div>

              {/* Navigation Links */}
              <div className="py-1 space-y-0.5">
                <Link
                  href="/"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span>Return to Website</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </Link>

                {isCreatorOrAdmin && (
                  <Link
                    href="/dashboard/channel"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition"
                  >
                    <Palette className="w-3.5 h-3.5 text-pink-400" />
                    <span>Channel Profile</span>
                  </Link>
                )}

                {userRole === "admin" && (
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>System Settings</span>
                  </Link>
                )}
              </div>

              {/* Logout Button */}
              <div className="border-t border-white/5 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
