import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { siteService } from "@/services/site.service";
import { ReaderProvider } from "@/providers/ReaderProvider";
import { PointsProvider } from "@/providers/PointsProvider";
import { SiteConfigProvider } from "@/providers/SiteConfigProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { constructMetadata } from "@/lib/metadata";
import { CookieConsent } from "@/components/ads/CookieConsent";
import { ReferralCapture } from "@/components/home/ReferralCapture";
import Script from "next/script";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const configRes = await siteService.getSiteConfig();
  const config = configRes?.success ? configRes?.data : null;
  const customAdScript = config?.customAdScript || null;

  const adSenseClient =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT ||
    (config?.adClient ? config.adClient : "ca-pub-8848458851675460");

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans antialiased bg-background text-foreground">
        {adSenseClient && (
          <Script
            id="google-adsense"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClient}`}
            crossOrigin="anonymous"
          />
        )}
        <LanguageProvider>
          <ReaderProvider>
            <SiteConfigProvider initialConfig={config}>
              <PointsProvider>
                <ReferralCapture />
                {children}
                <CookieConsent />
              </PointsProvider>
            </SiteConfigProvider>
          </ReaderProvider>
        </LanguageProvider>
        <Toaster position="bottom-right" />
        {customAdScript && (
          <div dangerouslySetInnerHTML={{ __html: customAdScript }} />
        )}
      </body>
    </html>
  );
}
