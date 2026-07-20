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
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

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
  { label: "My Series", href: "/dashboard/series", icon: BookOpen, roles: ["creator", "moderator", "admin"] },
  { label: "My Chapters", href: "/dashboard/chapters", icon: Layers, roles: ["creator", "moderator", "admin"] },
  { label: "Earnings", href: "/dashboard/earnings", icon: DollarSign, roles: ["creator"] },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, roles: ["creator"] },
  { label: "Channel Settings", href: "/dashboard/channel", icon: Palette, roles: ["creator"] },
  { label: "Featured Requests", href: "/dashboard/featured-requests", icon: Sparkles, roles: ["creator", "moderator", "admin"] },

  // Moderator items
  { label: "All Users", href: "/dashboard/users", icon: Users, roles: ["moderator", "admin"] },
  { label: "Series Applications", href: "/dashboard/applications", icon: FileText, roles: ["moderator", "admin"] },
  { label: "Withdrawals", href: "/dashboard/withdrawals", icon: CreditCard, roles: ["moderator", "admin"] },
  { label: "Reports", href: "/dashboard/reports", icon: AlertCircle, roles: ["moderator", "admin"] },
  { label: "Comments", href: "/dashboard/comments", icon: MessageSquare, roles: ["moderator", "admin"] },
  { label: "Custom Ads", href: "/dashboard/ads", icon: Megaphone, roles: ["moderator", "admin"] },

  // Admin items
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard, roles: ["admin"] },
  { label: "Role Manager", href: "/dashboard/roles", icon: UserCog, roles: ["admin"] },
  { label: "Site Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

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
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="font-heading text-xl tracking-wider text-white">
            GENZ <span className={dashboardTitle.color}>{dashboardTitle.label}</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-white" : "group-hover:text-primary transition-colors"
                )} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="p-4 rounded-xl glass bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
            <p className="text-sm font-semibold truncate">{session?.user?.email || '...'}</p>
            <p className="text-xs text-muted-foreground capitalize mt-1">{userRole}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
