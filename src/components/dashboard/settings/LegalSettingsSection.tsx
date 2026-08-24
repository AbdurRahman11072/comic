"use client";

import React from "react";
import { FileText } from "lucide-react";

interface LegalSettingsSectionProps {
  form: any;
  updateField: (key: string, value: any) => void;
}

export function LegalSettingsSection({ form, updateField }: LegalSettingsSectionProps) {
  return (
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
            Official Public Support & Contact Email (Shown on /contact)
          </label>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
            placeholder="support@comicbd.com"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-primary"
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
  );
}
