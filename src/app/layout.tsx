import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { siteService } from "@/services/site.service";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { constructMetadata } from "@/lib/metadata";
import { CookieConsent } from "@/components/ads/CookieConsent";

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
      <head>
        {adSenseClient && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClient}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-background text-foreground">
        <ReduxProvider>
          {children}
          <CookieConsent />
        </ReduxProvider>
        <Toaster position="bottom-right" />
        {customAdScript && (
          <div dangerouslySetInnerHTML={{ __html: customAdScript }} />
        )}
      </body>
    </html>
  );
}
