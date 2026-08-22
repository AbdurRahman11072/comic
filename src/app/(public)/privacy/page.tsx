import { siteService } from "@/services/site.service";
import { ShieldCheck, Lock, Cookie, Eye, Globe, Mail } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const configRes = await siteService.getSiteConfig();
  const appName = configRes?.data?.appName || "Comic BD";
  return {
    title: `Privacy Policy — ${appName}`,
    description: `Read the privacy policy and data protection practices for ${appName}, including Google AdSense cookies and user rights.`,
  };
}

export default async function PrivacyPolicyPage() {
  const configRes = await siteService.getSiteConfig();
  const config = configRes?.data;
  const appName = config?.appName || "Comic BD";

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Legal & Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Custom override from Admin SiteConfig if available */}
        {config?.privacyPolicy ? (
          <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {config.privacyPolicy}
          </div>
        ) : (
          /* Standard AdSense, GDPR & CCPA Compliant Privacy Policy */
          <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> 1. Overview & Commitment
              </h2>
              <p>
                Welcome to <strong className="text-white">{appName}</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are dedicated to safeguarding the privacy and personal data of our readers, creators, and visitors. This Privacy Policy explains what information we collect, how we use it, how we protect it, and your rights under applicable data protection laws including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
              </p>
            </section>

            <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" /> 2. Information We Collect
              </h2>
              <p>We may collect information you provide directly to us or automatically as you navigate the platform:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-white/80">
                <li><strong className="text-white">Account Information:</strong> Name, email address, profile avatar, and account authentication details when registering.</li>
                <li><strong className="text-white">Reading History & Preferences:</strong> Bookmarks, reading lists, chapters unlocked, points transactions, and reading mode settings.</li>
                <li><strong className="text-white">Log & Device Data:</strong> IP address, browser type, operating system, referring URLs, device identifiers, and timestamps.</li>
              </ul>
            </section>

            <section className="space-y-3 glass p-6 rounded-3xl border border-amber-500/20 bg-amber-500/[0.02]">
              <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-amber-400" /> 3. Google AdSense & Advertising Cookies
              </h2>
              <p>
                We use <strong className="text-white">Google AdSense</strong> and authorized third-party ad networks to serve advertisements when you visit our website.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-white/90">
                <li>
                  <strong className="text-white">DoubleClick DART Cookies:</strong> Google, as a third-party vendor, uses cookies to serve ads based on your prior visits to our website or other websites on the Internet.
                </li>
                <li>
                  <strong className="text-white">Opting Out:</strong> You may opt out of personalized advertising by visiting Google&apos;s Ads Settings at{" "}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    https://www.google.com/settings/ads
                  </a>{" "}
                  or via the Network Advertising Initiative opt-out page at{" "}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    https://www.aboutads.info/choices/
                  </a>.
                </li>
                <li>
                  <strong className="text-white">Third-Party Vendors:</strong> Third-party ad servers or ad networks may also use cookies, JavaScript, or Web Beacons in their respective advertisements. We have no access to or control over these cookies that are used by third-party advertisers.
                </li>
              </ul>
            </section>

            <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" /> 4. How We Use & Protect Your Information
              </h2>
              <p>We use the collected information for:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/80">
                <li>Providing and synchronizing comic chapters, bookmarks, and reader features.</li>
                <li>Facilitating secure coin purchases and creator compensation through Stripe.</li>
                <li>Detecting fraud, bot traffic, and unauthorized scraping to protect creator content.</li>
                <li>Complying with legal and statutory requirements.</li>
              </ul>
            </section>

            <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" /> 5. Your Rights (GDPR & CCPA)
              </h2>
              <p>
                Depending on your location, you have the right to request access to, correction of, or deletion of your personal data stored on our servers. You may also request data portability or object to certain processing activities. To exercise these rights, please reach out via our contact channels.
              </p>
            </section>

            <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> 6. Contact & Inquiries
              </h2>
              <p>
                If you have questions, feedback, or concerns regarding this Privacy Policy, please contact our privacy team at{" "}
                <span className="text-white font-mono font-semibold">privacy@{appName.toLowerCase().replace(/\s+/g, "")}.com</span> or open a support ticket in our official community discord.
              </p>
            </section>
          </div>
        )}
    </div>
  );
}
