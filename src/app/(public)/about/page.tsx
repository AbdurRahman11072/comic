import { siteService } from "@/services/site.service";
import { BookOpen, HeartHandshake, Mail, Sparkles, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const configRes = await siteService.getSiteConfig();
  const appName = configRes?.data?.appName || "Comic BD";
  return {
    title: `About Us — ${appName}`,
    description: `Learn more about ${appName}, our mission, creator ecosystem, and comic reading community.`,
  };
}

export default async function AboutUsPage() {
  const configRes = await siteService.getSiteConfig();
  const config = configRes?.data;
  const appName = config?.appName || "Comic BD";
  const appTagline = config?.appTagline || "Discover Unlimited Stories, Webtoons, Manga & Comics.";

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4 text-center border-b border-white/10 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Our Story & Mission
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Empowering Comic Creators & Readers Worldwide
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {appTagline}
          </p>
        </div>

        {/* Custom About Us text if provided in admin */}
        {config?.aboutUs ? (
          <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {config.aboutUs}
          </div>
        ) : (
          <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
            {/* 3 Pillar Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass p-6 rounded-3xl border border-white/5 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Quality Content</h3>
                <p className="text-xs text-muted-foreground">
                  High-definition images, clean vertical scrolling, and lightning-fast loading on all screen sizes.
                </p>
              </div>

              <div className="glass p-6 rounded-3xl border border-white/5 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Creator Studio First</h3>
                <p className="text-xs text-muted-foreground">
                  Empowering independent scanlation groups, artists, and creators with transparent 100& revenue share.
                </p>
              </div>

              <div className="glass p-6 rounded-3xl border border-white/5 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Community Driven</h3>
                <p className="text-xs text-muted-foreground">
                  Interactive discussions, chapter comments, bookmark synchronization, and gamified reward quests.
                </p>
              </div>
            </div>

            {/* Platform Philosophy */}
            <section className="glass p-8 rounded-3xl border border-white/5 space-y-4">
              <h2 className="text-xl font-bold text-white">Why We Built {appName}</h2>
              <p>
                Founded by avid webtoon and comic enthusiasts, <strong className="text-white">{appName}</strong> was created to bridge the gap between incredible storytellers and passionate readers. We believe great comics should be easily accessible, fast to load, and fair to original authors and translation teams.
              </p>
              <p>
                Whether you&apos;re reading on a desktop browser or our upcoming mobile apps, our platform is optimized for zero lag, rich visual aesthetics, and uninterrupted immersion.
              </p>
            </section>

            {/* Contact & Support Section */}
            <section className="glass p-8 rounded-3xl border border-white/5 space-y-4 bg-primary/[0.02]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> Contact & Feedback
              </h2>
              <p>
                Have a suggestion, partnership inquiry, or need assistance with your account? We&apos;d love to hear from you!
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/rewards"
                  className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition"
                >
                  Earn Free Points
                </Link>
                <Link
                  href="/dashboard/channel"
                  className="px-5 py-2.5 glass text-white font-bold text-xs rounded-xl border border-white/10 hover:border-white/20 transition"
                >
                  Join as a Creator
                </Link>
              </div>
            </section>
          </div>
        )}
    </div>
  );
}
