"use client";

import { UpdateSiteConfigAction } from "@/actions/site";
import { useSiteConfig } from "@/providers/SiteConfigProvider";
import { Globe, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { AnnouncementSection } from "./AnnouncementSection";
import { BrandingSettingsSection } from "./BrandingSettingsSection";
import { EconomySection } from "./EconomySection";
import { LegalSettingsSection } from "./LegalSettingsSection";
import { MobileAppSection } from "./MobileAppSection";
import { SeoTrackingSection } from "./SeoTrackingSection";
import { SettingsTabId, SettingsTabNav } from "./SettingsTabNav";
import { SocialsSection } from "./SocialsSection";
import { SystemSettingsSection } from "./SystemSettingsSection";

export interface SettingsClientProps {
  initialConfig?: any;
}

function normalizeConfig(data: any = {}) {
  return {
    // System & Access
    isMaintenanceMode: data.isMaintenanceMode ?? false,
    maintenanceMessage: data.maintenanceMessage ?? "",
    allowNewRegistrations: data.allowNewRegistrations ?? true,
    allowCreatorApplications: data.allowCreatorApplications ?? true,
    enableGlobalChat: data.enableGlobalChat ?? true,
    enableStripePayment: data.enableStripePayment ?? true,
    enableCashOut: data.enableCashOut ?? true,
    enablePremiumChapters: data.enablePremiumChapters ?? true,

    // Branding & Copy
    appName: data.appName ?? "Comic BD",
    appTagline: data.appTagline ?? "Read Trending Webtoons, Manga & Comics",
    appLogoUrl: data.appLogoUrl ?? "",
    heroHeadline: data.heroHeadline ?? "Discover Unlimited Stories & Comics",
    heroSubtitle:
      data.heroSubtitle ??
      "Read high quality manhwa, manga and manhua translated with lightning speed.",

    // Announcement
    announceText: data.announceText ?? "",
    announceLink: data.announceLink ?? "",

    // Socials
    discord: data.discord ?? "",
    twitter: data.twitter ?? "",
    telegram: data.telegram ?? "",
    youtube: data.youtube ?? "",
    instagram: data.instagram ?? "",
    facebook: data.facebook ?? "",
    reddit: data.reddit ?? "",

    // Economy & Payout Rules
    pointToFiatRate: data.pointToFiatRate ?? 0.01,
    minWithdrawalPoints: data.minWithdrawalPoints ?? 1000,
    creatorRevenueSharePercent: data.creatorRevenueSharePercent ?? 70,
    maxDailyAdPoints: data.maxDailyAdPoints ?? 1000,
    featuredRequestFee: data.featuredRequestFee ?? 500,
    referralBonusPercent: data.referralBonusPercent ?? 10,
    referralActiveMonths: data.referralActiveMonths ?? 3,
    referralSignupBonus: data.referralSignupBonus ?? 50,
    payoutMethods:
      Array.isArray(data.payoutMethods) && data.payoutMethods.length > 0
        ? data.payoutMethods
        : ["bKash", "Nagad", "Rocket", "Bank Transfer"],
    customAdScript: data.customAdScript ?? "",

    // SEO & Tracking
    seoTitle: data.seoTitle ?? "Comic BD - Read Free Manga, Manhwa & Webtoons",
    seoDescription:
      data.seoDescription ??
      "Read high quality webtoons, manga, and manhwa online for free.",
    seoKeywords: data.seoKeywords ?? "manga, manhwa, webtoon, comics, read manga online",
    ogImageUrl: data.ogImageUrl ?? "",
    gaTrackingId: data.gaTrackingId ?? "",
    adClient: data.adClient ?? "",

    // Mobile Apps
    playStoreUrl: data.playStoreUrl ?? "",
    appStoreUrl: data.appStoreUrl ?? "",

    // Legal & Contact
    aboutUs: data.aboutUs ?? "",
    termsOfService: data.termsOfService ?? "",
    privacyPolicy: data.privacyPolicy ?? "",
    dmcaEmail: data.dmcaEmail ?? "",
    contactEmail: data.contactEmail ?? "support@comicbd.com",
  };
}

export function SettingsClient({ initialConfig }: SettingsClientProps) {
  const { config: globalConfig, updateConfig } = useSiteConfig();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTabId>("system");
  const [form, setForm] = useState(() => normalizeConfig(globalConfig || initialConfig));

  useEffect(() => {
    if (globalConfig) {
      setForm(normalizeConfig(globalConfig));
    }
  }, [globalConfig]);

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await UpdateSiteConfigAction(form);
      if (res.success && res.data) {
        updateConfig(res.data);
        toast.success("Platform settings saved & updated live!");
      } else {
        toast.error(res.message || "Failed to save settings.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
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
          className="flex items-center gap-2 px-7 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Tabs Navigation */}
      <SettingsTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* TAB CONTENTS */}
      <div className="space-y-6">
        {activeTab === "system" && (
          <SystemSettingsSection form={form} updateField={updateField} />
        )}
        {activeTab === "branding" && (
          <BrandingSettingsSection form={form} updateField={updateField} />
        )}
        {activeTab === "announcement" && (
          <AnnouncementSection form={form} updateField={updateField} />
        )}
        {activeTab === "socials" && (
          <SocialsSection form={form} updateField={updateField} />
        )}
        {activeTab === "economy" && (
          <EconomySection form={form} updateField={updateField} />
        )}
        {activeTab === "seo" && (
          <SeoTrackingSection form={form} updateField={updateField} />
        )}
        {activeTab === "mobile" && (
          <MobileAppSection form={form} updateField={updateField} />
        )}
        {activeTab === "legal" && (
          <LegalSettingsSection form={form} updateField={updateField} />
        )}

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}
