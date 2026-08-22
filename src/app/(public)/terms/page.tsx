import { siteService } from "@/services/site.service";
import { FileText, UserCheck, DollarSign, AlertCircle, ShieldAlert, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const configRes = await siteService.getSiteConfig();
  const appName = configRes?.data?.appName || "Comic BD";
  return {
    title: `Terms of Service — ${appName}`,
    description: `Read the Terms of Service and user agreement governing ${appName}.`,
  };
}

export default async function TermsOfServicePage() {
  const configRes = await siteService.getSiteConfig();
  const config = configRes?.data;
  const appName = config?.appName || "Comic BD";

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> User Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Custom override from Admin SiteConfig if available */}
        {config?.termsOfService ? (
          <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {config.termsOfService}
          </div>
        ) : (
          <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> 1. Acceptance of Terms
              </h2>
              <p>
                By accessing, browsing, or creating an account on <strong className="text-white">{appName}</strong> (&quot;the Platform&quot;), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree, you must discontinue your use of the Platform immediately.
              </p>
            </section>

            <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400" /> 2. User Accounts & Security
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to immediately notify us of any unauthorized use or security breaches. The Platform reserves the right to terminate or suspend accounts that engage in fraudulent behavior, hate speech, automated scraping, or harassment.
              </p>
            </section>

            <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" /> 3. Points, Coins & Purchases
              </h2>
              <p>
                Points and Coins are virtual items within {appName} used exclusively to unlock digital chapters and support creators.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-white/80">
                <li>Points possess no real-world monetary value outside of approved creator withdrawal programs.</li>
                <li>All purchases made through Stripe or integrated payment providers are final and non-refundable once points are credited, except where required by law.</li>
                <li>Points obtained through fraudulent exploits, illegitimate ad automation, or chargebacks are subject to immediate confiscation and account ban.</li>
              </ul>
            </section>

            <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> 4. Creator Content & Intellectual Property
              </h2>
              <p>
                Authors and verified creator studios retain original ownership of their uploaded works. By publishing content on {appName}, creators grant the platform a non-exclusive license to host, display, and distribute the work to readers in accordance with revenue-sharing agreements.
              </p>
            </section>

            <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" /> 5. Limitation of Liability & Disclaimers
              </h2>
              <p>
                The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. {appName} shall not be liable for indirect, incidental, or consequential damages resulting from platform downtime, service interruptions, or third-party advertising links.
              </p>
            </section>
          </div>
        )}
    </div>
  );
}
