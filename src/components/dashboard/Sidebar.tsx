"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Layers, 
  AlertCircle, 
  CreditCard, 
  Settings, 
  Menu, 
  X, 
  Shield, 
  Palette, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  DollarSign, 
  Megaphone, 
  UserCog, 
  Sparkles,
  Database,
  Globe,
  ArrowLeft
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useGetSiteConfigQuery } from "@/redux/api/siteConfigApi";
import { SITE_DEFAULTS } from "@/config/site";

type NavItem = {
  label: string;
  href: string;
  icon: any;
  roles: string[];
};

const ALL_NAV_ITEMS: NavItem[] = [
  // Main Dashboard Overview (Hidden from standard users)
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["creator", "moderator", "admin"] },

  // Creator items
  { label: "My Series", href: "/dashboard/series", icon: BookOpen, roles: ["creator"] },
  { label: "My Chapters", href: "/dashboard/chapters", icon: Layers, roles: ["creator"] },
  { label: "Promo Codes", href: "/dashboard/promos", icon: Sparkles, roles: ["creator", "admin"] },
  { label: "Earnings", href: "/dashboard/earnings", icon: DollarSign, roles: ["creator"] },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, roles: ["creator"] },
  { label: "Channel Settings", href: "/dashboard/channel", icon: Palette, roles: ["creator"] },
  { label: "Featured Requests", href: "/dashboard/featured-requests", icon: Sparkles, roles: ["creator", "moderator", "admin"] },

  // Moderator & Admin items
  { label: "All Series & Content", href: "/dashboard/admin-series", icon: BookOpen, roles: ["moderator", "admin"] },
  { label: "Creators & Studios", href: "/dashboard/creators", icon: Palette, roles: ["moderator", "admin"] },
  { label: "Users & Roles", href: "/dashboard/users", icon: Users, roles: ["moderator", "admin"] },
  { label: "Series Applications", href: "/dashboard/applications", icon: FileText, roles: ["moderator", "admin"] },
  { label: "Withdrawals", href: "/dashboard/withdrawals", icon: CreditCard, roles: ["moderator", "admin"] },
  { label: "Reports", href: "/dashboard/reports", icon: AlertCircle, roles: ["moderator", "admin"] },
  { label: "Custom Ads", href: "/dashboard/ads", icon: Megaphone, roles: ["moderator", "admin"] },

  // Admin exclusive items
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard, roles: ["admin"] },
  { label: "Database Backup", href: "/dashboard/backup", icon: Database, roles: ["admin"] },
  { label: "Staff Audit Logs", href: "/dashboard/audit", icon: Shield, roles: ["admin"] },
  { label: "Site & CMS Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const { data: configRes } = useGetSiteConfigQuery();
  const appName = configRes?.data?.appName || SITE_DEFAULTS.appName;

  const userRole = (session?.user as any)?.role || "user";

  const filteredNavItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  const dashboardTitle = useMemo(() => {
    switch(userRole) {
      case 'admin': return { label: 'ADMIN', color: 'text-red-400' };
      case 'moderator': return { label: 'MOD', color: 'text-yellow-400' };
      case 'creator': return { label: 'STUDIO', color: 'text-emerald-400' };
      default: return { label: 'PANEL', color: 'text-primary' };
    }
  }, [userRole]);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[110] p-2 rounded-lg glass md:hidden"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-64 glass border-r border-white/10 z-[105] transition-transform duration-300 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <Link href="/" className="font-heading text-lg tracking-wider text-white flex items-center gap-1.5 truncate">
            <span>{appName}</span>
            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 ${dashboardTitle.color}`}>
              {dashboardTitle.label}
            </span>
          </Link>
        </div>

        {/* Back to Home Button */}
        <div className="px-3 pt-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-primary/20 text-xs font-bold text-white/80 hover:text-white border border-white/5 transition group"
          >
            <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
            <span>Return to Website</span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-xs sm:text-sm",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white font-medium"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-white" : "group-hover:text-primary transition-colors"
                )} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-white/10">
          <div className="p-3 rounded-xl glass bg-primary/5 border border-primary/20">
            <p className="text-[10px] text-muted-foreground">Signed in as</p>
            <p className="text-xs font-semibold text-white truncate">{session?.user?.email || '...'}</p>
            <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{userRole}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
