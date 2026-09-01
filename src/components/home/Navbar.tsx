"use client";

import { SITE_DEFAULTS } from "@/config/site";
import { signOut, useSession } from "@/lib/auth-client";
import { usePoints } from "@/providers/PointsProvider";
import { useSiteConfig } from "@/providers/SiteConfigProvider";
import {
  Bookmark,
  Gift,
  History,
  LayoutDashboard,
  MessageCircle,
  Search,
  Settings,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BottomNav } from "./BottomNav";
import { ChatDrawer } from "./ChatDrawer";
import { LoginDialog } from "./LoginDialog";
import { MobileUserDrawer } from "./MobileUserDrawer";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Series", href: "/series" },
  { label: "Latest", href: "/latest" },
  { label: "Shop", href: "/shop" },
];

// ── Icons ──────────────────────────────────────────────────────────────────────
const SignInIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
  </svg>
);

const SignOutIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

const TransactionIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);

export function Navbar() {
  const [mobileUserDrawerOpen, setMobileUserDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const { config } = useSiteConfig();
  const { points, isLoading: isPointsLoading, refreshPoints } = usePoints();

  const appName = config?.appName || SITE_DEFAULTS.appName;
  const appLogoUrl = config?.appLogoUrl || SITE_DEFAULTS.appLogoUrl;

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    const protectedPrefixes = [
      "/profile",
      "/bookmarks",
      "/history",
      "/transactions",
      "/dashboard",
      "/stripe-sandbox",
    ];
    const isCurrentProtected = protectedPrefixes.some((p) =>
      window.location.pathname.startsWith(p)
    );
    if (isCurrentProtected) {
      window.location.href = "/";
    } else {
      router.refresh();
    }
  };

  const handleSearchClick = () => {
    if (pathname === "/series") {
      const input = document.getElementById("series-search-input");
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      router.push("/series?focus=search");
    }
  };

  const isLoggedIn = !isPending && !!session?.user;
  const userRole = (session?.user as any)?.role || "user";
  const isStaff = ["creator", "moderator", "admin"].includes(userRole);

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-white/5 backdrop-blur-xl bg-background/80">
        <div className="max-w-[72rem] mx-auto px-4 flex items-center justify-between h-[60px] gap-6">

          {/* Left: Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-heading text-[1.6rem] tracking-[1px] whitespace-nowrap flex items-center gap-2"
              style={{
                background: "linear-gradient(90deg, #fff 60%, #e11d48)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {appLogoUrl ? (
                <img src={appLogoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
              ) : null}
              {appName}
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-[13px] font-medium pb-0.5 transition-colors duration-200 ${
                    pathname === link.href ? "text-white font-bold" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Search Icon + Points Pill + Chat + Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon Button (Desktop & Mobile) */}
              <button
              type="button"
              onClick={handleSearchClick}
              className="flex items-center justify-center w-[34px] sm:w-[38px] h-[34px] sm:h-[38px] rounded-full border glass glass-hover transition-all cursor-pointer text-muted-foreground hover:text-white hover:border-primary/40"
              title="Search Series"
              aria-label="Search Series"
            >
              <Search className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />
            </button>
            {/* Community Chat (Desktop & Mobile) */}
            {config?.enableGlobalChat !== false && (
              <button
                data-chat-trigger="true"
                onClick={() => setChatOpen((v) => !v)}
                className="flex items-center justify-center w-[34px] sm:w-[38px] h-[34px] sm:h-[38px] rounded-full border glass glass-hover transition-all cursor-pointer text-muted-foreground hover:text-white hover:border-primary/40 relative"
                title="Community Chat"
                aria-label="Community Chat"
              >
                <MessageCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
              </button>
            )}

            {/* Points Pill */}
            {isLoggedIn && !isPointsLoading && (
              <Link
                href="/shop"
                className="flex items-center gap-1.5 rounded-full px-3 py-[5px] border glass glass-hover text-[13px] font-semibold"
                style={{ color: "var(--coin)", borderColor: "rgba(245,158,11,0.25)" }}
                title="Your points — click to buy more"
              >
                {/* Coin SVG */}
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <text x="10" y="14.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">P</text>
                </svg>
                <span>{points?.toLocaleString()}</span>
              </Link>
            )}

            {/* Loading skeleton for points */}
            {isLoggedIn && isPointsLoading && (
              <div className="rounded-full px-3 py-[5px] border border-white/5 bg-white/5 animate-pulse w-[70px] h-[30px]" />
            )}
          

            {/* Auth button (Desktop Only) */}
            <div className="hidden sm:flex items-center">
              {isPending ? (
                <div className="rounded-full w-[90px] h-[38px] bg-white/5 animate-pulse" />
              ) : isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full px-3 sm:px-4 py-[6px] h-[34px] sm:h-[38px] text-[13px] font-medium border glass glass-hover whitespace-nowrap cursor-pointer"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-[10px] font-bold">
                        {session.user.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                    <span className="max-w-[100px] truncate">{session.user.name}</span>
                  </button>

                  {/* Dropdown menu */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-[calc(100%+8px)] w-[200px] rounded-2xl border border-white/10 bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden z-[200] p-1 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="flex flex-col space-y-0.5">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium hover:bg-white/5 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-primary" />
                          My Profile
                        </Link>
                        <Link
                          href="/rewards"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Gift className="w-4 h-4 text-amber-400" />
                            <span>Rewards</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-black uppercase">
                            Free
                          </span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          App Settings
                        </Link>
                        <Link
                          href="/bookmarks"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium hover:bg-white/5 transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                          Bookmarks
                        </Link>
                        <Link
                          href="/history"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium hover:bg-white/5 transition-colors"
                        >
                          <History className="w-4 h-4" />
                          History
                        </Link>
                        <Link
                          href="/transactions"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium hover:bg-white/5 transition-colors"
                        >
                          <TransactionIcon />
                          Transactions
                        </Link>
                        
                        {userRole === "user" && config?.allowCreatorApplications !== false && (
                          <Link
                            href="/creator-benefits"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] hover:bg-white/5 transition-colors text-emerald-400 font-bold w-full text-left"
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            Be Creator
                          </Link>
                        )}

                        {isStaff && (
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] hover:bg-white/5 transition-colors text-primary font-bold"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Staff Dashboard
                          </Link>
                        )}

                        <div className="border-t border-white/5 my-1" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-red-500/10 transition-colors w-full text-left text-red-400 cursor-pointer"
                        >
                          <SignOutIcon />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="flex items-center gap-2 rounded-full px-4 py-[6px] h-[38px] text-[13px] font-medium border glass glass-hover whitespace-nowrap cursor-pointer"
                >
                  <SignInIcon />
                  <span>Sign in</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onAuthSuccess={() => { setLoginOpen(false); refreshPoints(); }}
      />

      {/* Mobile bottom navigation */}
      <BottomNav
        onChatToggle={() => setChatOpen((v) => !v)}
        onUserMenuToggle={() => setMobileUserDrawerOpen((v) => !v)}
      />

      {/* Mobile User Hub / Menu Drawer */}
      <MobileUserDrawer
        open={mobileUserDrawerOpen}
        onOpenChange={setMobileUserDrawerOpen}
        onLoginOpen={() => setLoginOpen(true)}
        onChatOpen={() => setChatOpen(true)}
      />

      {/* Chat Drawer (portal-based) */}
      <ChatDrawer open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}
