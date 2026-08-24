"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  Megaphone,
  Palette,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { LoginDialog } from "@/components/home/LoginDialog";
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
      title: "70% Direct Revenue Share",
      desc: "Earn the industry-leading 70% payout on every coin unlocked by fans on your premium chapters.",
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      title: "Ad Monetization Revenue Pool",
      desc: "Get paid from platform ad pools based on reader engagement and reading quality scores, even on free chapters.",
      icon: Megaphone,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      title: "Custom Creator Studio & Channel",
      desc: "Customize your studio banner, bio, social links, and publish channel announcements directly to your followers.",
      icon: Palette,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      border: "border-pink-400/20",
    },
    {
      title: "Promotional Codes & Discounts",
      desc: "Create custom reward codes, bulk reader discounts, and promotional campaigns to grow your fanbase.",
      icon: Sparkles,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
    },
    {
      title: "Flexible Local & Global Payouts",
      desc: "Cash out your earned points directly to bKash, Nagad, Rocket, or direct Bank Transfer with complete transaction history.",
      icon: Wallet,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20",
    },
    {
      title: "Real-Time Telemetry Analytics",
      desc: "Track chapter drop-offs, reader retention tiers (BOUNCED, QUALIFIED, ENGAGED), bookmarks, and 30-day earnings.",
      icon: BarChart3,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
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
    <div className="relative overflow-hidden w-full min-h-screen pb-20">
      {/* Decorative Gradient Blobs */}
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[72rem] w-full mx-auto px-4 pt-10 space-y-16 relative z-10">
        {/* ── HERO BANNER ── */}
        <div className="text-center space-y-6 max-w-3xl mx-auto pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Genz Toon Creator Program
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            Turn Your Comics & Webtoons into a{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #fff 40%, #e11d48)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Thriving Business
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Join hundreds of creators publishing Manhwa, Manga, and Webtoons. Monetize your stories
            with 70% direct revenue share, quality ad pools, and built-in fan communities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleMakeCreatorClick}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-extrabold text-sm text-white shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
              style={{ background: "var(--primary)" }}
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{isAlreadyCreator ? "Go to Creator Dashboard" : "Make a Creator Account"}</span>
            </button>
            <Link
              href="/latest"
              className="w-full sm:w-auto px-6 py-4 rounded-full font-bold text-sm text-white glass hover:bg-white/10 transition text-center"
            >
              Explore Published Series
            </Link>
          </div>
        </div>

        {/* ── 6 KEY BENEFITS GRID ── */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Creators Choose Genz Toon
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything you need to publish, grow, and monetize your comic catalog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className={`glass rounded-3xl p-6 border ${b.border} relative overflow-hidden group hover:scale-[1.02] transition-all flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className={`p-3 rounded-2xl w-fit ${b.bg}`}>
                      <Icon className={`w-6 h-6 ${b.color}`} />
                    </div>
                    <h3 className="text-lg font-black text-white">{b.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3-STEP ONBOARDING ── */}
        <div className="glass rounded-3xl p-8 sm:p-12 border border-white/5 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">How It Works</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              From account setup to first payout in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-center">
              <span className="w-10 h-10 rounded-full bg-primary/20 text-primary font-black text-base flex items-center justify-center mx-auto">
                1
              </span>
              <h4 className="text-sm font-bold text-white">Make Creator Account</h4>
              <p className="text-xs text-muted-foreground">
                Click "Make a Creator Account" to instantly unlock your Creator Studio.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-center">
              <span className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 font-black text-base flex items-center justify-center mx-auto">
                2
              </span>
              <h4 className="text-sm font-bold text-white">Upload Series & Chapters</h4>
              <p className="text-xs text-muted-foreground">
                Set up series covers, genres, and upload high-res chapter image bundles.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-center">
              <span className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center mx-auto">
                3
              </span>
              <h4 className="text-sm font-bold text-white">Earn & Cash Out</h4>
              <p className="text-xs text-muted-foreground">
                Receive 70% coin unlock shares and cash out directly to bKash, Nagad, or Bank.
              </p>
            </div>
          </div>
        </div>

        {/* ── FAQ SECTION ── */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-5 border border-white/5 space-y-1.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                  {f.q}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA BANNER ── */}
        <div className="glass rounded-3xl p-8 sm:p-12 border border-primary/30 text-center space-y-4 relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Ready to Start Your Comic Journey?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Create your account today and join the fastest-growing webtoon creator community.
          </p>
          <div className="pt-2">
            <button
              onClick={handleMakeCreatorClick}
              className="px-8 py-3.5 rounded-full font-extrabold text-sm text-white shadow-xl shadow-primary/30 inline-flex items-center gap-2 hover:scale-105 transition cursor-pointer"
              style={{ background: "var(--primary)" }}
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
