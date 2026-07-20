"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Clock, Gift, MessageCircle } from "lucide-react";

interface BottomNavProps {
  onChatToggle: () => void;
}

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/series", label: "Series", icon: BookOpen },
  { href: "/latest", label: "Latest", icon: Clock },
  { href: "/rewards", label: "Rewards", icon: Gift },
];

export function BottomNav({ onChatToggle }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl safe-bottom">
      <div className="flex items-center justify-around h-[60px] px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 rounded-xl transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
                <Icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* Chat button */}
        <button
          onClick={onChatToggle}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 rounded-xl transition-all text-muted-foreground hover:text-white"
        >
          <div className="p-1.5 rounded-xl relative">
            <MessageCircle className="w-[20px] h-[20px]" strokeWidth={1.8} />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />
          </div>
          <span className="text-[10px] font-semibold leading-none">Chat</span>
        </button>
      </div>
    </nav>
  );
}
