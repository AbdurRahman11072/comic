"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user already made a consent choice
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Delay display slightly to avoid jarring layout shifts
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    localStorage.setItem("cookie_consent", type);
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    setShow(false);

    // If AdSense is loaded, update consent mode if applicable
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: type === "all" ? "granted" : "denied",
        ad_user_data: type === "all" ? "granted" : "denied",
        ad_personalization: type === "all" ? "granted" : "denied",
        analytics_storage: "granted",
      });
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="glass border border-white/15 p-5 rounded-3xl shadow-2xl bg-[#0f0f13]/95 backdrop-blur-xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Privacy & Cookie Notice
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use cookies and Google AdSense to personalize content, deliver relevant ads, and analyze traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies per our{" "}
              <Link href="/privacy" className="text-primary hover:underline font-semibold">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleAccept("essential")}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white/70 hover:text-white glass border border-white/10 hover:border-white/20 transition cursor-pointer"
          >
            Essential Only
          </button>
          <button
            onClick={() => handleAccept("all")}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 transition shadow-lg shadow-primary/20 cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
