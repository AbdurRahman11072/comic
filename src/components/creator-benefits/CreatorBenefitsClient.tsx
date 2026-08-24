"use client";

import { LoginDialog } from "@/components/home/LoginDialog";
import { useSession } from "@/lib/auth-client";
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    DollarSign,
    Flame,
    HelpCircle,
    Megaphone,
    Palette,
    Sparkles,
    Wallet,
    Zap
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreatorUpgradeModal } from "./CreatorUpgradeModal";

export function CreatorBenefitsClient() {
  const { data: session } = useSession();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role || "user";
  const isAlreadyCreator = ["creator", "moderator", "admin"].includes(userRole);

  const handleMakeCreatorClick = () => {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    if (isAlreadyCreator) {
      window.location.href = "/dashboard";
      return;
    }
    setUpgradeModalOpen(true);
  };

  const benefits = [
    {
      title: "100& Direct Revenue Share",
      desc: "Earn the industry-leading 100& payout on every coin unlocked by fans on your premium chapters.",
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
      badge: "Maximum Payout",
    },
    {
      title: "Ad Monetization Revenue Pool",
      desc: "Get paid from platform ad pools based on reader engagement and reading quality scores, even on free chapters.",
      icon: Megaphone,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
      badge: "Passive Income",
    },
    {
      title: "Custom Creator Studio & Channel",
      desc: "Customize your studio banner, bio, social links, and publish channel announcements directly to your followers.",
      icon: Palette,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      border: "border-pink-500/20 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
      badge: "Community Hub",
    },
    {
      title: "Promotional Codes & Discounts",
      desc: "Create custom reward codes, bulk reader discounts, and promotional campaigns to grow your fanbase.",
      icon: Sparkles,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
      badge: "Growth Engine",
    },
    {
      title: "Flexible Local & Global Payouts",
      desc: "Cash out your earned points directly to bKash, Nagad, Rocket, or direct Bank Transfer with complete transaction history.",
      icon: Wallet,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
      badge: "Instant Cashout",
    },
    {
      title: "Real-Time Telemetry Analytics",
      desc: "Track chapter drop-offs, reader retention tiers (BOUNCED, QUALIFIED, ENGAGED), bookmarks, and 30-day earnings.",
      icon: BarChart3,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
      badge: "Deep Insights",
    },
  ];

  const faqs = [
    {
      q: "Who can become a creator?",
      a: "Anyone with original comics, webtoons, or authorized translations can create a studio account and start uploading series immediately.",
    },
    {
      q: "How do payouts work?",
      a: "Points earned from chapter purchases and ad distribution runs can be withdrawn anytime via your preferred payment method once you reach the minimum threshold (1,000 pts = $10).",
    },
    {
      q: "Can I set chapter prices?",
      a: "Yes! You can choose which chapters are free and which require coin unlocks, along with custom coin costs and Fast Pass options.",
    },
  ];

  return (
    <div className="relative overflow-hidden w-full min-h-screen pb-24 bg-background">
      {/* ── BACKGROUND PATTERNS & AMBIENT AURAS ── */}
      
      {/* 1. Geometric Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* 2. Manga Comic Halftone Dot Matrix Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_90%)]"
        style={{
          backgroundImage: `radial-gradient(rgba(225, 29, 72, 0.25) 1.5px, transparent 1.5px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* 3. Radiant Multi-Color Ambient Glow Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] h-[550px] bg-gradient-to-tr from-primary/25 via-rose-600/15 to-purple-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute top-1/3 -left-48 w-[600px] h-[600px] bg-pink-500/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-2/3 -right-48 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[72rem] w-full mx-auto px-4 pt-10 space-y-20 relative z-10">
        
        {/* ── HERO BANNER WITH VIBRANT SHIMMER ── */}
        <div className="text-center space-y-6 max-w-3xl mx-auto pt-10 relative">
          
          {/* Floating Sparkle Accents */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-primary text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/10">
            <Sparkles className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: "6s" }} />
            <span>Comic BD Creator Program</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight">
            Turn Your Comics & Webtoons into a{" "}
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(135deg, #ffffff 20%, #f43f5e 60%, #fb7185 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Thriving Business
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            Join hundreds of creators publishing Manhwa, Manga, and Webtoons. Monetize your stories
            with 100& direct revenue share, quality ad pools, and built-in fan communities.
          </p>

          {/* Call to Actions with Glass & Neon Glow */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleMakeCreatorClick}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-extrabold text-sm text-white shadow-2xl shadow-primary/40 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer relative overflow-hidden group border border-white/20"
              style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)" }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
              <Zap className="w-4 h-4 fill-white shrink-0" />
              <span className="relative z-10">{isAlreadyCreator ? "Go to Creator Dashboard" : "Make a Creator Account"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
            </button>
            <Link
              href="/latest"
              className="w-full sm:w-auto px-7 py-4 rounded-full font-bold text-sm text-white glass hover:bg-white/10 transition text-center border border-white/10"
            >
              Explore Published Series
            </Link>
          </div>

          {/* Quick Credibility Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1.5 text-white/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100& Revenue Share
            </span>
            <span className="flex items-center gap-1.5 text-white/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fast Local Cashouts
            </span>
            <span className="flex items-center gap-1.5 text-white/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free to Join
            </span>
          </div>
        </div>

        {/* ── 6 KEY BENEFITS GRID WITH ENHANCED GLASS CARDS ── */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Creators Choose Comic BD
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Everything you need to publish, grow, engage fans, and monetize your comic catalog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className={`glass rounded-3xl p-6 border ${b.border} relative overflow-hidden group transition-all duration-300 flex flex-col justify-between backdrop-blur-2xl bg-white/[0.02] hover:bg-white/[0.04]`}
                >
                  {/* Subtle Card Glow Effect */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl w-fit ${b.bg} border border-white/5`}>
                        <Icon className={`w-6 h-6 ${b.color}`} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10 font-mono">
                        {b.badge}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">
                        {b.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3-STEP ONBOARDING ROADMAP ── */}
        <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10 space-y-10 relative overflow-hidden bg-white/[0.01]">
          {/* Subtle Background Pattern in Container */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />

          <div className="text-center space-y-2 relative z-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-primary">Simple Roadmap</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">How It Works</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              From account setup to your first payout in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 text-center group hover:border-primary/30 transition">
              <span className="w-12 h-12 rounded-2xl bg-primary/20 text-primary font-black text-lg flex items-center justify-center mx-auto border border-primary/30 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                1
              </span>
              <h4 className="text-sm font-bold text-white">Make Creator Account</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click "Make a Creator Account" to instantly unlock your dedicated Creator Studio.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 text-center group hover:border-pink-500/30 transition">
              <span className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 font-black text-lg flex items-center justify-center mx-auto border border-pink-500/30 shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                2
              </span>
              <h4 className="text-sm font-bold text-white">Upload Series & Chapters</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Set up series covers, genres, and upload high-res chapter image bundles effortlessly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 text-center group hover:border-emerald-500/30 transition">
              <span className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-lg flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                3
              </span>
              <h4 className="text-sm font-bold text-white">Earn & Cash Out</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive 100& coin unlock shares and cash out directly to bKash, Nagad, or Bank.
              </p>
            </div>
          </div>
        </div>

        {/* ── FAQ SECTION ── */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-muted-foreground">Clear answers for comic artists and webtoon translators.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-5 border border-white/5 space-y-1.5 hover:border-white/10 transition">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                  {f.q}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA BANNER WITH AURA ── */}
        <div className="glass rounded-3xl p-8 sm:p-14 border border-primary/40 text-center space-y-5 relative overflow-hidden bg-gradient-to-b from-primary/15 via-black/40 to-black/60 shadow-2xl shadow-primary/20">
          <div className="w-16 h-16 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <Flame className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Start Your Comic Journey?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Create your studio account today and join the fastest-growing webtoon creator community.
          </p>
          <div className="pt-2">
            <button
              onClick={handleMakeCreatorClick}
              className="px-9 py-4 rounded-full font-extrabold text-sm text-white shadow-2xl shadow-primary/40 inline-flex items-center gap-2.5 hover:scale-105 active:scale-95 transition cursor-pointer border border-white/20"
              style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)" }}
            >
              <span>{isAlreadyCreator ? "Open Creator Dashboard" : "Make a Creator Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Upgrade Celebration Modal */}
      <CreatorUpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />

      {/* Login / Registration Modal for logged-out users */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onAuthSuccess={() => {
          setLoginOpen(false);
          setUpgradeModalOpen(true);
        }}
      />
    </div>
  );
}
