import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { siteService } from "@/services/site.service";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { constructMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const configRes = await siteService.getSiteConfig();
  const customAdScript = configRes?.success ? configRes?.data?.customAdScript : null;

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans">
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Toaster position="bottom-right" />
        {customAdScript && (
          <div dangerouslySetInnerHTML={{ __html: customAdScript }} />
        )}
      </body>
    </html>
  );
}
