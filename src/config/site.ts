/**
 * Site configuration defaults & instant fallback constants.
 * Inlined at build time for 0ms initial render latency and zero Cumulative Layout Shift (CLS).
 */

export const SITE_DEFAULTS = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Comic BD",
  appTagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Read Trending Webtoons, Manga & Comics",
  appLogoUrl: process.env.NEXT_PUBLIC_APP_LOGO_URL || "",
  heroHeadline: process.env.NEXT_PUBLIC_HERO_HEADLINE || "Discover Unlimited Stories & Comics",
  heroSubtitle: process.env.NEXT_PUBLIC_HERO_SUBTITLE || "Read high quality manhwa, manga and manhua translated with lightning speed.",
  discord: process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg",
  twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com",
};
