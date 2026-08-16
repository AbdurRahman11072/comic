import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { siteService } from "@/services/site.service";
import { ShieldCheck, AlertTriangle, Mail, FileCheck, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const configRes = await siteService.getSiteConfig();
  const appName = configRes?.data?.appName || "Comic BD";
  return {
    title: `DMCA & Copyright Policy — ${appName}`,
    description: `Digital Millennium Copyright Act (DMCA) notice, copyright protection, and takedown procedures for ${appName}.`,
  };
}

export default async function DmcaPage() {
  const configRes = await siteService.getSiteConfig();
  const config = configRes?.data;
  const appName = config?.appName || "Comic BD";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Copyright Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            DMCA & Copyright Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Compliance with the Digital Millennium Copyright Act (17 U.S.C. § 512)
          </p>
        </div>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> 1. Copyright Statement
            </h2>
            <p>
              <strong className="text-white">{appName}</strong> respects the intellectual property rights of creators, artists, authors, and publishers. We expect all users and creator studios utilizing our hosting and distribution tools to respect international copyright laws.
            </p>
            <p>
              It is our policy to respond expeditiously to legitimate notices of alleged copyright infringement in accordance with Title 17, United States Code, Section 512(c).
            </p>
          </section>

          <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" /> 2. Filing a DMCA Takedown Notice
            </h2>
            <p>
              If you are a copyright owner or an authorized agent thereof and believe that any content, series, or chapter hosted on {appName} infringes upon your copyrights, you may submit a formal notification containing the following elements:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-white/85">
              <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
              <li>Identification of the copyrighted work claimed to have been infringed, or a representative list of such works.</li>
              <li>Identification of the material that is claimed to be infringing, including the specific URLs on {appName} where the material is located.</li>
              <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and email address.</li>
              <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the copyright owner.</li>
            </ol>
          </section>

          <section className="space-y-3 glass p-6 rounded-3xl border border-white/5 bg-primary/[0.02]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> 3. Designated DMCA Agent
            </h2>
            <p>Please deliver all DMCA notifications to our designated copyright agent:</p>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1 font-mono text-xs text-white">
              <div>Attn: DMCA Copyright Agent</div>
              <div>Platform: {appName}</div>
              <div>Email: <span className="text-primary font-bold">dmca@{appName.toLowerCase().replace(/\s+/g, "")}.com</span></div>
            </div>
          </section>

          <section className="space-y-3 glass p-6 rounded-3xl border border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> 4. Repeat Infringer Policy
            </h2>
            <p>
              In accordance with the DMCA and other applicable laws, {appName} has adopted a strict policy of terminating, in appropriate circumstances, user or creator accounts who are deemed to be repeat infringers.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
