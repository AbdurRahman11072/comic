"use client";

import Link from "next/link";
import { useSiteConfig } from "@/providers/SiteConfigProvider";

// Official Social SVG Logos
const DiscordSVG = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
  </svg>
);

const TwitterSVG = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramSVG = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const YoutubeSVG = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const TelegramSVG = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

const FacebookSVG = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const ReportSVG = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);

export function SocialRow() {
  const { config } = useSiteConfig();

  // Compile active individual socials
  const socials = [
    {
      id: "discord",
      name: "Discord",
      title: "Join Our Discord",
      desc: "Chat with fellow readers & scanlators",
      url: config?.discord || "https://discord.gg",
      icon: DiscordSVG,
      barColor: "bg-[#5865F2]",
      buttonBg: "bg-[#5865F2] hover:bg-[#4752C4]",
      buttonText: "Join Discord",
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      title: "Follow on X",
      desc: "Get instant chapter release alerts",
      url: config?.twitter || "https://x.com",
      icon: TwitterSVG,
      barColor: "bg-white",
      buttonBg: "bg-black border border-white/20 hover:border-white/40",
      buttonText: "Follow @X",
    },
    ...(config?.telegram ? [{
      id: "telegram",
      name: "Telegram",
      title: "Join Telegram Channel",
      desc: "Direct announcements & downloads",
      url: config.telegram,
      icon: TelegramSVG,
      barColor: "bg-[#229ED9]",
      buttonBg: "bg-[#229ED9] hover:bg-[#1D88BC]",
      buttonText: "Join Telegram",
    }] : []),
    ...(config?.youtube ? [{
      id: "youtube",
      name: "YouTube",
      title: "Subscribe on YouTube",
      desc: "Watch animated trailers & teasers",
      url: config.youtube,
      icon: YoutubeSVG,
      barColor: "bg-[#FF0000]",
      buttonBg: "bg-[#FF0000] hover:bg-[#CC0000]",
      buttonText: "Watch YouTube",
    }] : []),
    ...(config?.instagram ? [{
      id: "instagram",
      name: "Instagram",
      title: "Follow on Instagram",
      desc: "Artwork, character lore & fanart",
      url: config.instagram,
      icon: InstagramSVG,
      barColor: "bg-pink-500",
      buttonBg: "bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 hover:opacity-90",
      buttonText: "Follow Instagram",
    }] : []),
    ...(config?.facebook ? [{
      id: "facebook",
      name: "Facebook",
      title: "Follow on Facebook",
      desc: "Community discussions & news",
      url: config.facebook,
      icon: FacebookSVG,
      barColor: "bg-[#1877F2]",
      buttonBg: "bg-[#1877F2] hover:bg-[#1558B0]",
      buttonText: "Like Page",
    }] : []),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
      {/* 1. Report & Feedback Individual Card */}
      <div className="flex items-center justify-between gap-3 rounded-2xl glass glass-hover px-4 py-3.5 border border-white/5 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-1 self-stretch rounded-full bg-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-white truncate">Facing an Issue?</div>
            <div className="text-[11px] text-muted-foreground truncate">Report bugs or request new series</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const chatTrigger = document.querySelector('[data-chat-trigger="true"]') as HTMLButtonElement;
            if (chatTrigger) chatTrigger.click();
          }}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-bold text-white transition hover:opacity-90 bg-primary shadow-md shadow-primary/20 cursor-pointer"
        >
          <ReportSVG />
          <span>Feedback</span>
        </button>
      </div>

      {/* 2. Dynamic Individual Social Cards */}
      {socials.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-2xl glass glass-hover px-4 py-3.5 border border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-1 self-stretch rounded-full ${s.barColor} shrink-0`} />
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-white truncate">{s.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">{s.desc}</div>
              </div>
            </div>
            <Link
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold text-white transition shadow-sm hover:scale-[1.03] ${s.buttonBg}`}
            >
              <Icon />
              <span>{s.buttonText}</span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
