import type { Metadata } from "next";
import { siteService } from "@/services/site.service";
import { SITE_DEFAULTS } from "@/config/site";

interface PageMetaOptions {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
}

export async function constructMetadata({
  title,
  description,
  image,
  keywords,
  noIndex = false,
  type = "website",
}: PageMetaOptions = {}): Promise<Metadata> {
  let appName = SITE_DEFAULTS.appName;
  let appDescription = SITE_DEFAULTS.heroSubtitle;
  let metaKeywords = "manga, manhwa, manhua, webtoon, comics, read online, scanlation";
  let ogImage = image;
  let googleAdSense = "ca-pub-8954395091807116";

  try {
    const configRes = await siteService.getSiteConfig();
    if (configRes?.success && configRes.data) {
      const c = configRes.data;
      if (c.appName) appName = c.appName;
      if (c.metaDescription) appDescription = c.metaDescription;
      else if (c.heroSubtitle) appDescription = c.heroSubtitle;
      if (c.metaKeywords) metaKeywords = c.metaKeywords;
      if (!ogImage && c.ogImageUrl) ogImage = c.ogImageUrl;
      if (c.googleAdsenseId) googleAdSense = c.googleAdsenseId;
    }
  } catch (e) {
    // Fallback cleanly to default constants
  }

  const finalTitle = title ? `${title} | ${appName}` : `${appName} — ${SITE_DEFAULTS.appTagline}`;
  const finalDescription = description || appDescription;
  const finalKeywords = keywords ? keywords.join(", ") : metaKeywords;

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "https://comicbd.onrender.com";

  return {
    metadataBase: new URL(appBaseUrl),
    title: finalTitle,
    description: finalDescription,
    keywords: finalKeywords,
    authors: [{ name: appName }],
    creator: appName,
    publisher: appName,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      type: type as any,
      siteName: appName,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: finalTitle }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: ogImage ? [ogImage] : [],
    },
    other: googleAdSense
      ? { "google-adsense-account": googleAdSense }
      : {},
  };
}
