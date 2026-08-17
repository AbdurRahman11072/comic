"use client";

import { useState, useEffect } from "react";
import {
  Globe, Share2, Save, Loader2, ShieldCheck, DollarSign,
  Sparkles, Smartphone, Megaphone, FileText, CheckCircle2,
  AlertTriangle, Lock, Users, MessageCircle, BarChart3,
  CreditCard, Banknote, Wallet
} from "lucide-react";
import { useGetSiteConfigQuery, useUpdateSiteConfigMutation } from "@/redux/api/siteConfigApi";
import { toast } from "react-hot-toast";

interface SettingsClientProps {
  initialConfig?: any;
}

export function SettingsClient({ initialConfig }: SettingsClientProps) {
  const { data: configRes, isLoading: configLoading } = useGetSiteConfigQuery();
  const [updateMutate, { isLoading: saving }] = useUpdateSiteConfigMutation();

  const [activeTab, setActiveTab] = useState<"system" | "branding" | "announcement" | "socials" | "economy" | "seo" | "mobile" | "legal">("system");

  const configData = configRes?.data || initialConfig || {};

  const [form, setForm] = useState({
    // System & Access
    isMaintenanceMode: configData.isMaintenanceMode ?? false,
    maintenanceMessage: configData.maintenanceMessage ?? "",
    allowNewRegistrations: configData.allowNewRegistrations ?? true,
    allowCreatorApplications: configData.allowCreatorApplications ?? true,
    enableGlobalChat: configData.enableGlobalChat ?? true,
    enableStripePayment: configData.enableStripePayment ?? true,
    enableCashOut: configData.enableCashOut ?? true,
    enablePremiumChapters: configData.enablePremiumChapters ?? true,

    // Branding & Copy
    appName: configData.appName ?? "Genz Toon",
    appTagline: configData.appTagline ?? "Read Trending Webtoons, Manga & Comics",
    appLogoUrl: configData.appLogoUrl ?? "",
    heroHeadline: configData.heroHeadline ?? "Discover Unlimited Stories & Comics",
    heroSubtitle: configData.heroSubtitle ?? "Read high quality manhwa, manga and manhua translated with lightning speed.",

    // Announcement
    announceText: configData.announceText ?? "",
    announceLink: configData.announceLink ?? "",

    // Socials
    discord: configData.discord ?? "",
    twitter: configData.twitter ?? "",
    telegram: configData.telegram ?? "",
    youtube: configData.youtube ?? "",
    instagram: configData.instagram ?? "",
    facebook: configData.facebook ?? "",
    reddit: configData.reddit ?? "",

    // Economy & Payout Rules
    pointToFiatRate: configData.pointToFiatRate ?? 0.01,
    minWithdrawalPoints: configData.minWithdrawalPoints ?? 1000,
    creatorRevenueSharePercent: configData.creatorRevenueSharePercent ?? 70,
    maxDailyAdPoints: configData.maxDailyAdPoints ?? 1000,
    featuredRequestFee: configData.featuredRequestFee ?? 500,
    referralBonusPercent: configData.referralBonusPercent ?? 10,
    referralActiveMonths: configData.referralActiveMonths ?? 3,
    customAdScript: configData.customAdScript ?? "",

    // SEO & Tracking
    seoTitle: configData.seoTitle ?? "Genz Toon - Read Free Manga, Manhwa & Webtoons",
    seoDescription: configData.seoDescription ?? "Read high quality webtoons, manga, and manhwa online for free.",
    seoKeywords: configData.seoKeywords ?? "manga, manhwa, webtoon, comics, read manga online",
    ogImageUrl: configData.ogImageUrl ?? "",
    gaTrackingId: configData.gaTrackingId ?? "",
    adClient: configData.adClient ?? "",

    // Mobile Apps
    playStoreUrl: configData.playStoreUrl ?? "",
    appStoreUrl: configData.appStoreUrl ?? "",

    // Legal
    aboutUs: configData.aboutUs ?? "",
    termsOfService: configData.termsOfService ?? "",
    privacyPolicy: configData.privacyPolicy ?? "",
    dmcaEmail: configData.dmcaEmail ?? "",
  });

  useEffect(() => {
    if (configRes?.data) {
      const d: any = configRes.data;
      setForm((prev) => ({
        ...prev,
        ...d,
        isMaintenanceMode: d.isMaintenanceMode ?? false,
        maintenanceMessage: d.maintenanceMessage ?? "",
        allowNewRegistrations: d.allowNewRegistrations ?? true,
        allowCreatorApplications: d.allowCreatorApplications ?? true,
        enableGlobalChat: d.enableGlobalChat ?? true,
        enableStripePayment: d.enableStripePayment ?? true,
        enableCashOut: d.enableCashOut ?? true,
        enablePremiumChapters: d.enablePremiumChapters ?? true,
        pointToFiatRate: d.pointToFiatRate ?? 0.01,
        minWithdrawalPoints: d.minWithdrawalPoints ?? 1000,
        creatorRevenueSharePercent: d.creatorRevenueSharePercent ?? 70,
        maxDailyAdPoints: d.maxDailyAdPoints ?? 1000,
        featuredRequestFee: d.featuredRequestFee ?? 500,
        referralBonusPercent: d.referralBonusPercent ?? 10,
        referralActiveMonths: d.referralActiveMonths ?? 3,
      }));
    }
  }, [configRes]);

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await updateMutate(form).unwrap();
      toast.success("Platform settings saved & updated live!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save settings.");
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Globe className="w-6 h-6 text-primary" /> Platform Settings & Enterprise CMS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Centrally manage system access, branding, live announcements, SEO, and the platform economy.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="flex items-center gap-2 px-7 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: "system", label: "System & Toggles", icon: ShieldCheck },
          { id: "branding", label: "Branding & Hero", icon: Sparkles },
          { id: "announcement", label: "Announcement Bar", icon: Megaphone },
          { id: "socials", label: "Social Channels", icon: Share2 },
          { id: "economy", label: "Economy & Payouts", icon: DollarSign },
          { id: "seo", label: "SEO & Analytics", icon: BarChart3 },
          { id: "mobile", label: "Mobile Apps", icon: Smartphone },
          { id: "legal", label: "Legal Docs", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "glass glass-hover text-white/70 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="space-y-6">
        {/* 1. SYSTEM & ACCESS TOGGLES */}
        {activeTab === "system" && (
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Operational Feature Switches
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Maintenance Mode */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-white">Maintenance Mode</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isMaintenanceMode}
                    onChange={(e) => updateField("isMaintenanceMode", e.target.checked)}
                    className="w-5 h-5 rounded text-primary border-white/10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Displays an alert banner across the site alerting users of ongoing server updates.
                </p>
                {form.isMaintenanceMode && (
                  <input
                    type="text"
                    value={form.maintenanceMessage}
                    onChange={(e) => updateField("maintenanceMessage", e.target.value)}
                    placeholder="Custom maintenance message..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                  />
                )}
              </div>

              {/* Allow New Registrations */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white">New User Registrations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.allowNewRegistrations}
                    onChange={(e) => updateField("allowNewRegistrations", e.target.checked)}
                    className="w-5 h-5 rounded text-primary border-white/10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, new visitors can sign up. Disable during bot floods or private testing.
                </p>
              </div>

              {/* Creator Applications */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-sm text-white">Creator Applications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.allowCreatorApplications}
                    onChange={(e) => updateField("allowCreatorApplications", e.target.checked)}
                    className="w-5 h-5 rounded text-primary border-white/10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Controls whether readers can submit series applications and upgrade to Creator role.
                </p>
              </div>

              {/* Global Community Chat */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-sm text-white">Global Community Chat</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.enableGlobalChat}
                    onChange={(e) => updateField("enableGlobalChat", e.target.checked)}
                    className="w-5 h-5 rounded text-primary border-white/10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Master switch to enable or pause public chat messages and reaction GIFs.
                </p>
              </div>

              {/* Stripe Payment Gateway */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-sm text-white">Stripe Card Payments</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.enableStripePayment}
                    onChange={(e) => updateField("enableStripePayment", e.target.checked)}
                    className="w-5 h-5 rounded text-primary border-white/10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Allow users to purchase point packages with credit/debit cards via Stripe. Disable to pause online purchases.
                </p>
              </div>

              {/* CashOut & Manual Withdrawals */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-white">CashOut / Manual Payouts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.enableCashOut}
                    onChange={(e) => updateField("enableCashOut", e.target.checked)}
                    className="w-5 h-5 rounded text-primary border-white/10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Allow users to request CashOut via bKash, Nagad, Rocket, or Bank Transfer on their transactions page.
                </p>
              </div>

              {/* Premium / Paid Chapters System */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-sm text-white">Premium Chapters / Paywall System</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.enablePremiumChapters}
                    onChange={(e) => updateField("enablePremiumChapters", e.target.checked)}
                    className="w-5 h-5 rounded text-primary border-white/10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, locked chapters require coins/points to read. When turned <strong>OFF</strong>, all chapters across the entire platform become <strong>100% FREE</strong> for all readers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. BRANDING & HERO */}
        {activeTab === "branding" && (
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> App Identity & Hero Copy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Application Name
                </label>
                <input
                  type="text"
                  value={form.appName}
                  onChange={(e) => updateField("appName", e.target.value)}
                  placeholder="Genz Toon"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-primary/50 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  App Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={form.appTagline}
                  onChange={(e) => updateField("appTagline", e.target.value)}
                  placeholder="Read Trending Webtoons, Manga & Comics"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-primary/50 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Logo Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={form.appLogoUrl}
                  onChange={(e) => updateField("appLogoUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={form.heroHeadline}
                  onChange={(e) => updateField("heroHeadline", e.target.value)}
                  placeholder="Discover Unlimited Stories & Comics"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-primary/50 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Hero Subtitle
                </label>
                <textarea
                  rows={3}
                  value={form.heroSubtitle}
                  onChange={(e) => updateField("heroSubtitle", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none resize-none text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. ANNOUNCEMENT BAR */}
        {activeTab === "announcement" && (
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" /> Top Banner Announcement
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Banner Text
                </label>
                <input
                  type="text"
                  value={form.announceText}
                  onChange={(e) => updateField("announceText", e.target.value)}
                  placeholder="🎉 New chapter releases are live! Join our Discord community."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Target Link
                </label>
                <input
                  type="text"
                  value={form.announceLink}
                  onChange={(e) => updateField("announceLink", e.target.value)}
                  placeholder="https://discord.gg/... or /series"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. SOCIAL CHANNELS */}
        {activeTab === "socials" && (
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" /> Official Social Channels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "discord", label: "Discord Community Invite", placeholder: "https://discord.gg/..." },
                { key: "twitter", label: "X / Twitter URL", placeholder: "https://twitter.com/..." },
                { key: "telegram", label: "Telegram Channel URL", placeholder: "https://t.me/..." },
                { key: "youtube", label: "YouTube Channel URL", placeholder: "https://youtube.com/@..." },
                { key: "instagram", label: "Instagram Profile URL", placeholder: "https://instagram.com/..." },
                { key: "facebook", label: "Facebook Page URL", placeholder: "https://facebook.com/..." },
                { key: "reddit", label: "Reddit Subreddit URL", placeholder: "https://reddit.com/r/..." },
              ].map((s) => (
                <div key={s.key}>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    {s.label}
                  </label>
                  <input
                    type="text"
                    value={(form as any)[s.key]}
                    onChange={(e) => updateField(s.key, e.target.value)}
                    placeholder={s.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. ECONOMY & PAYOUT RULES */}
        {activeTab === "economy" && (
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> Platform Economy & Creator Payout Rules
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Point to Fiat Conversion Rate ($ per point)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={form.pointToFiatRate}
                  onChange={(e) => updateField("pointToFiatRate", parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Default 0.01 ($1 = 100 points)</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Minimum Withdrawal Points Threshold
                </label>
                <input
                  type="number"
                  value={form.minWithdrawalPoints}
                  onChange={(e) => updateField("minWithdrawalPoints", parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Creators must accumulate at least this many points to withdraw</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Creator Revenue Share (%)
                </label>
                <input
                  type="number"
                  value={form.creatorRevenueSharePercent}
                  onChange={(e) => updateField("creatorRevenueSharePercent", parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Max Daily Ad Points per Reader
                </label>
                <input
                  type="number"
                  value={form.maxDailyAdPoints}
                  onChange={(e) => updateField("maxDailyAdPoints", parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Referral Bonus (% of referee purchases)
                </label>
                <input
                  type="number"
                  value={form.referralBonusPercent}
                  onChange={(e) => updateField("referralBonusPercent", parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Featured Series Request Fee (Points)
                </label>
                <input
                  type="number"
                  value={form.featuredRequestFee}
                  onChange={(e) => updateField("featuredRequestFee", parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. SEO & ANALYTICS */}
        {activeTab === "seo" && (
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Search Engine Optimization & Tracking
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Default Meta Title
                </label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => updateField("seoTitle", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Default Meta Description
                </label>
                <textarea
                  rows={3}
                  value={form.seoDescription}
                  onChange={(e) => updateField("seoDescription", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Meta Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={form.seoKeywords}
                  onChange={(e) => updateField("seoKeywords", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Google Analytics / Tag Manager Tracking ID
                </label>
                <input
                  type="text"
                  value={form.gaTrackingId}
                  onChange={(e) => updateField("gaTrackingId", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Google AdSense Publisher / Client ID
                </label>
                <input
                  type="text"
                  value={form.adClient}
                  onChange={(e) => updateField("adClient", e.target.value)}
                  placeholder="ca-pub-8848458851675460"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. MOBILE APPS */}
        {activeTab === "mobile" && (
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" /> Mobile App Download Links
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Google Play Store URL
                </label>
                <input
                  type="text"
                  value={form.playStoreUrl}
                  onChange={(e) => updateField("playStoreUrl", e.target.value)}
                  placeholder="https://play.google.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Apple App Store URL
                </label>
                <input
                  type="text"
                  value={form.appStoreUrl}
                  onChange={(e) => updateField("appStoreUrl", e.target.value)}
                  placeholder="https://apps.apple.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* 8. LEGAL DOCUMENTS */}
        {activeTab === "legal" && (
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Legal & Policy Documents
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  About Us (Markdown)
                </label>
                <textarea
                  rows={4}
                  value={form.aboutUs}
                  onChange={(e) => updateField("aboutUs", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Terms of Service (Markdown)
                </label>
                <textarea
                  rows={5}
                  value={form.termsOfService}
                  onChange={(e) => updateField("termsOfService", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  DMCA Designated Agent Contact Email
                </label>
                <input
                  type="email"
                  value={form.dmcaEmail}
                  onChange={(e) => updateField("dmcaEmail", e.target.value)}
                  placeholder="dmca@yourdomain.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Privacy Policy (Markdown)
                </label>
                <textarea
                  rows={5}
                  value={form.privacyPolicy}
                  onChange={(e) => updateField("privacyPolicy", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}
