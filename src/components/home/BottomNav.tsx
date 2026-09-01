"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Clock, ShoppingBag, User as UserIcon, Menu } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { usePoints } from "@/providers/PointsProvider";

interface BottomNavProps {
  onChatToggle: () => void;
  onUserMenuToggle: () => void;
}

const PRIMARY_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/series", label: "Series", icon: BookOpen },
  { href: "/latest", label: "Latest", icon: Clock },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
];

export function BottomNav({ onChatToggle, onUserMenuToggle }: BottomNavProps) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const { points } = usePoints();

  const isLoggedIn = !isPending && !!session?.user;
  const isAccountActive = [
    "/profile",
    "/settings",
    "/transactions",
    "/rewards",
    "/bookmarks",
    "/history",
  ].some((p) => pathname.startsWith(p));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl safe-bottom">
      <div className="flex items-center justify-between h-[60px] px-1.5 max-w-lg mx-auto">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1 rounded-xl transition-all ${
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
                <Icon className="w-[19px] h-[19px]" strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className="text-[10px] font-semibold leading-none tracking-tight truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* User Menu / Account Button */}
        <button
          onClick={onUserMenuToggle}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1 rounded-xl transition-all cursor-pointer ${
            isAccountActive
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-white"
          }`}
          aria-label="Open user menu"
        >
          <div className={`p-1 rounded-xl transition-all relative ${isAccountActive ? "bg-primary/10" : ""}`}>
            {isLoggedIn && session.user.image ? (
              <div className="w-[19px] h-[19px] rounded-full overflow-hidden border border-primary/50">
                <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
              </div>
            ) : isLoggedIn ? (
              <div className="w-[19px] h-[19px] rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
            ) : (
              <UserIcon className="w-[19px] h-[19px]" strokeWidth={isAccountActive ? 2.5 : 1.8} />
            )}
            {isLoggedIn && points !== undefined && points > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-background" />
            )}
          </div>
          <span className="text-[10px] font-semibold leading-none tracking-tight truncate">
            {isLoggedIn ? "Account" : "Menu"}
          </span>
        </button>
      </div>
    </nav>
  );
}
