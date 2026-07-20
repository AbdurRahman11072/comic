"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import api from "@/lib/api";
import { LoginDialog } from "./LoginDialog";
import { ChatDrawer } from "./ChatDrawer";
import { BottomNav } from "./BottomNav";
import { User as UserIcon, Settings, Bookmark, History, LayoutDashboard, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Series", href: "/series" },
  { label: "Latest", href: "/latest" },
  { label: "Rewards", href: "/rewards" },
  { label: "Shop", href: "/shop" },
];

// ── Icons ──────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
  </svg>
);

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
  const [searchQuery, setSearchQuery] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const fetchPoints = useCallback(async () => {
    if (!session?.user) return;
    try {
      const { data } = await api.get('/api/v1/points/balance');
      setPoints(data.data.points);
    } catch {
      // silently fail
    }
  }, [session]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  // Expose refresh function globally so Rewards page can trigger it
  useEffect(() => {
    (window as any).__refreshNavPoints = fetchPoints;
    return () => { delete (window as any).__refreshNavPoints; };
  }, [fetchPoints]);

  const handleSignOut = async () => {
    await signOut();
    setPoints(null);
    setUserMenuOpen(false);
  };

  const isLoggedIn = !isPending && !!session?.user;
  const userRole = (session?.user as any)?.role || 'user';
  const isStaff = ['creator', 'moderator', 'admin'].includes(userRole);

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-white/5 backdrop-blur-xl bg-background/80">
        <div className="max-w-[72rem] mx-auto px-4 flex items-center justify-between h-[60px] gap-6">

          {/* Left: logo + search + nav */}
          <div className="flex items-center gap-5 flex-1">
            <Link
              href="/"
              className="font-heading text-[1.6rem] tracking-[1px] whitespace-nowrap"
              style={{
                background: "linear-gradient(90deg, #fff 60%, #e11d48)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Genz Toon
            </Link>

            {/* Search bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/series?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="hidden sm:flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium border glass glass-hover relative group w-[200px] lg:w-[300px] transition-all focus-within:w-[250px] lg:focus-within:w-[350px]"
            >
              <SearchIcon />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search series..."
                className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </form>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-[13px] font-medium pb-0.5 transition-colors duration-200"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: points badge + auth */}
          <div className="flex items-center gap-3">
            {/* Points badge — visible only when logged in */}
            {isLoggedIn && points !== null && (
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
                <span>{points.toLocaleString()}</span>
              </Link>
            )}

            {/* Loading skeleton for points */}
            {isLoggedIn && points === null && (
              <div className="rounded-full px-3 py-[5px] border border-white/5 bg-white/5 animate-pulse w-[70px] h-[30px]" />
            )}

            {/* Community Chat — desktop only */}
            <button
              onClick={() => setChatOpen((v) => !v)}
              className="hidden md:flex items-center justify-center w-[38px] h-[38px] rounded-full border glass glass-hover transition-all"
              title="Community Chat"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
            </button>

            {/* Auth button */}
            {isPending ? (
              <div className="rounded-full w-[90px] h-[38px] bg-white/5 animate-pulse" />
            ) : isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full px-4 py-[6px] h-[38px] text-[13px] font-medium border glass glass-hover whitespace-nowrap"
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
                  <span className="hidden sm:inline max-w-[100px] truncate">{session.user.name}</span>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+8px)] w-[180px] rounded-xl border border-white/10 bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden z-[200]"
                  >
                    <div className="flex flex-col">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-[13px] hover:bg-white/5 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        My Profile
                      </Link>
                      {userRole === 'user' && (
                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            try {
                              const res = await api.put('/api/v1/user/profile', { role: 'creator' });
                              if (res.data.success) {
                                toast.success("You are now a Creator!");
                                window.location.href = '/dashboard/channel';
                              } else {
                                toast.error(res.data.message || "Failed to become a creator");
                              }
                            } catch (err) {
                              toast.error("Failed to become a creator");
                            }
                          }}
                          className="flex items-center gap-2.5 px-4 py-3 text-[13px] hover:bg-white/5 transition-colors text-emerald-400 font-bold w-full text-left"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                          Be Creator
                        </button>
                      )}
                      {isStaff && (
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-[13px] hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      )}
                      <Link
                        href="/bookmarks"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-[13px] hover:bg-white/5 transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                        Bookmarks
                      </Link>
                      <Link
                        href="/history"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-[13px] hover:bg-white/5 transition-colors"
                      >
                        <History className="w-4 h-4" />
                        History
                      </Link>
                      <Link
                        href="/transactions"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-[13px] hover:bg-white/5 transition-colors"
                      >
                        <TransactionIcon />
                        Transactions
                      </Link>
                      
                      {isStaff && (
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-[13px] hover:bg-white/5 transition-colors text-primary font-bold"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      )}

                      <div className="border-t border-white/5" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-4 py-3 text-[13px] hover:bg-white/5 transition-colors w-full text-left text-red-400"
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
                className="flex items-center gap-2 rounded-full px-4 py-[6px] h-[38px] text-[13px] font-medium border glass glass-hover whitespace-nowrap"
              >
                <SignInIcon />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onAuthSuccess={() => { setLoginOpen(false); fetchPoints(); }}
      />

      {/* Mobile bottom navigation */}
      <BottomNav onChatToggle={() => setChatOpen((v) => !v)} />

      {/* Chat Drawer (portal-based) */}
      <ChatDrawer open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}
