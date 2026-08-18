"use client";

import { useState } from "react";
import {
  Mail,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  ShieldAlert,
  HelpCircle,
  Clock,
  ChevronDown,
  Palette,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

interface ContactClientProps {
  config: {
    appName?: string;
    contactEmail?: string;
    dmcaEmail?: string;
    discord?: string;
    twitter?: string;
    telegram?: string;
  };
}

export function ContactClient({ config }: ContactClientProps) {
  const appName = config?.appName || "Comic BD";
  const contactEmail = config?.contactEmail || config?.dmcaEmail || "support@comicbd.com";
  const dmcaEmail = config?.dmcaEmail || contactEmail;

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "General Support",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/v1/site-config/contact", form);
      if (res.data?.success) {
        setSubmitted(true);
        toast.success("Message sent successfully!");
        setForm({
          name: "",
          email: "",
          category: "General Support",
          subject: "",
          message: "",
        });
      } else {
        toast.error(res.data?.message || "Failed to send message. Please try again.");
      }
    } catch (err: any) {
      console.error("Error sending contact message:", err);
      toast.error(err.response?.data?.message || "Error submitting message. Please email us directly.");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: "How do coin balances and chapter unlocks work?",
      a: "Points and coins purchased in the Coin Shop are added instantly to your wallet. You can use them to unlock premium, fast-pass, or exclusive creator chapters.",
    },
    {
      q: "How can I apply to become a verified Creator?",
      a: "You can apply via the 'Become Creator' link in the top menu or dashboard. Once approved, you can publish comics, set coin prices, and earn revenue.",
    },
    {
      q: "What is your typical support response time?",
      a: "Our customer support team responds to all incoming inquiries within 24 hours (Monday through Sunday).",
    },
    {
      q: "How do I submit a DMCA or copyright removal request?",
      a: "Please select 'Copyright & DMCA Notice' in the contact form or email our designated agent directly at " + dmcaEmail + " with verification details.",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> 24/7 Dedicated Support
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          How Can We Help You Today?
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Have a question about your account, comic serializations, coin purchases, or partnership inquiries? Our team is here to help.
        </p>
      </div>

      {/* 4 Direct Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Official Email */}
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-4 hover:border-primary/30 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Email Support</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Direct line to our customer support team</p>
            </div>
            <p className="text-xs font-mono font-semibold text-primary/90 break-all">{contactEmail}</p>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <a
              href={`mailto:${contactEmail}`}
              className="flex-1 text-center py-2 px-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition"
            >
              Send Email
            </a>
            <button
              onClick={handleCopyEmail}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition border border-white/10"
              title="Copy Email"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* 2. Discord Community */}
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-4 hover:border-indigo-500/30 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Community Chat</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Chat with moderators & fellow readers</p>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Active 24/7 Community
            </p>
          </div>
          <div className="pt-2">
            {config?.discord ? (
              <Link
                href={config.discord}
                target="_blank"
                className="w-full block text-center py-2 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold border border-indigo-500/30 transition"
              >
                Join Discord
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground block text-center py-2">Join via social channels</span>
            )}
          </div>
        </div>

        {/* 3. Creator Program */}
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-4 hover:border-amber-500/30 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Creator Publishing</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Serialize your manga or webcomic</p>
            </div>
            <p className="text-xs text-muted-foreground">Monetize chapters & keep 70% revenue</p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/channel"
              className="w-full block text-center py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 transition"
            >
              Creator Portal
            </Link>
          </div>
        </div>

        {/* 4. DMCA & Copyright */}
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-4 hover:border-red-500/30 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">DMCA & Legal</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Designated copyright agent notices</p>
            </div>
            <p className="text-xs font-mono font-semibold text-red-300 break-all">{dmcaEmail}</p>
          </div>
          <div className="pt-2">
            <Link
              href="/dmca"
              className="w-full block text-center py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl text-xs font-bold border border-red-500/30 transition"
            >
              DMCA Notice
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Contact Form + Support Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Form (7 cols) */}
        <div className="lg:col-span-7 glass rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
          {submitted ? (
            <div className="py-12 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white">Message Received!</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to {appName}. A support specialist has received your request and will respond to your email within 24 hours.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition border border-white/10"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" /> Send Us a Message
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Fill out the form below and we will get back to you promptly.
                </p>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Your Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Hunter"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-primary transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Your Email <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Inquiry Category & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Inquiry Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-white/10 text-white text-sm outline-none focus:border-primary transition cursor-pointer"
                  >
                    <option value="General Support">💬 General Support & Inquiries</option>
                    <option value="Account & Payments">💰 Account, Coins & Payments</option>
                    <option value="Creator & Publishing">🎨 Creator & Publishing Query</option>
                    <option value="Copyright & DMCA">🛡️ Copyright & DMCA Notice</option>
                    <option value="Business & Partnership">🤝 Business & Partnerships</option>
                    <option value="Bug Report">🐛 Bug Report / Feature Request</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="What is your message regarding?"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Detailed Message <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Please describe your question or issue in detail..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-primary transition resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary text-white text-sm font-bold shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Support Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right: Support Guidelines & FAQ Accordions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions
            </h3>
            <p className="text-xs text-muted-foreground">
              Find quick answers to common questions before sending a message.
            </p>

            <div className="space-y-2 pt-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 text-xs font-bold text-white hover:text-primary transition"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground border-t border-white/5 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="glass rounded-3xl p-6 border border-white/5 bg-gradient-to-br from-primary/10 via-transparent to-transparent space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Operating Hours & Availability
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our support and moderation team operates 24 hours a day, 7 days a week. For urgent DMCA copyright removal notices, notices sent directly to <span className="text-white font-mono">{dmcaEmail}</span> are reviewed on a priority basis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
