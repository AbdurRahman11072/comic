"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  User as UserIcon,
  Gift,
  Coins,
  History,
  Lock,
  Settings,
  Bookmark,
  Clock,
  LayoutDashboard,
  LogOut,
  LogIn,
  Sparkles,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { usePoints } from "@/providers/PointsProvider";
import { useSiteConfig } from "@/providers/SiteConfigProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { FlagIcon } from "@/components/ui/FlagIcon";

interface MobileUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginOpen: () => void;
  onChatOpen?: () => void;
}

export function MobileUserDrawer({
  open,
  onOpenChange,
  onLoginOpen,
  onChatOpen,
}: MobileUserDrawerProps) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const { points } = usePoints();
  const { config } = useSiteConfig();
  const { currentLanguageOption } = useLanguage();

  const isLoggedIn = !isPending && !!session?.user;
  const userRole = (session?.user as any)?.role || "user";
  const isStaff = ["creator", "moderator", "admin"].includes(userRole);

  // Close drawer on route change or ESC
  useEffect(() => {
    onOpenChange(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  const handleSignOut = async () => {
    onOpenChange(false);
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-[320px] bg-[#0f0f11] border-l border-white/10 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white uppercase tracking-wider">Account & Menu</span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card or Guest Banner */}
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          {isLoggedIn ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 p-0.5 bg-background shrink-0">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-white truncate">{session.user.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{session.user.email}</div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 border border-primary/20 capitalize">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {userRole}
                  </div>
                </div>
              </div>

              {/* Quick Points & Language Bar */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/shop"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"
                >
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    <span>Points:</span>
                  </div>
                  <span>{(points ?? 0).toLocaleString()}</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => onOpenChange(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 text-xs text-muted-foreground font-semibold hover:text-white"
                >
                  <FlagIcon code={currentLanguageOption.code} className="w-4 h-3 rounded-xs" />
                  <span className="uppercase text-[11px]">{currentLanguageOption.code}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-1">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> Welcome to Comic BD
                </h3>
                <p className="text-xs text-muted-foreground">Sign in to sync bookmarks, unlock chapters, and earn free points.</p>
              </div>
              <button
                onClick={() => {
                  onOpenChange(false);
                  onLoginOpen();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Sign In / Register
              </button>
            </div>
          )}
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-white/5">
          {/* Main User Actions */}
          <div className="space-y-1 pb-2">
            {isLoggedIn && (
              <Link
                href="/profile"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/profile"
                    ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span>My Profile & Info</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            )}

            <Link
              href="/rewards"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname === "/rewards"
                  ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                  : "text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 font-bold"
              }`}
            >
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Rewards & Free Points</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-black uppercase">
                Free
              </span>
            </Link>

            {/* Community Global Chat Button */}
            {config?.enableGlobalChat !== false && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  if (onChatOpen) onChatOpen();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-neutral-300 hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>Community Global Chat</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </button>
            )}

            {isLoggedIn && (
              <Link
                href="/profile/referrals"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/profile/referrals"
                    ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Coins className="w-4 h-4 text-purple-400" />
                  <span>Referrals & Earnings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            )}

            {isLoggedIn && (
              <Link
                href="/transactions"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/transactions"
                    ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4" />
                  <span>Transactions & Cashout</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            )}

            <Link
              href="/bookmarks"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname === "/bookmarks"
                  ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4" />
                <span>Bookmarks</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <Link
              href="/history"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname === "/history"
                  ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Reading History</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          </div>

          {/* Settings & Security */}
          <div className="space-y-1 pt-2">
            <Link
              href="/settings"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname === "/settings"
                  ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>App Settings & Language</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            {isLoggedIn && (
              <Link
                href="/profile/security"
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/profile/security"
                    ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4" />
                  <span>Security & Password</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            )}

            {isLoggedIn && userRole === "user" && config?.allowCreatorApplications !== false && (
              <Link
                href="/creator-benefits"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4" />
                  <span>Be a Creator</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            )}

            {isStaff && (
              <Link
                href="/dashboard"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Staff Dashboard</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            )}
          </div>
        </div>

        {/* Drawer Footer (Sign Out) */}
        {isLoggedIn && (
          <div className="p-3 border-t border-white/5 bg-white/[0.01]">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
