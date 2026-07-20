import Link from "next/link";

const DiscordSVG = () => (
  <svg viewBox="0 0 24 24" width="20" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
  </svg>
);

/** Footer — matches original footer with logo, description, Discord link, DMCA, copyright */
export function Footer() {
  return (
    <footer
      className="mt-12 py-12 px-4 text-center border-t border-white/5 bg-gradient-to-t from-black/20 to-transparent"
    >
      <div className="max-w-[72rem] mx-auto">
        <div
          className="font-heading text-[1.8rem] tracking-[1px] mb-2.5"
        >
          Genz Toon
        </div>

        <p className="text-muted-foreground text-[12px] max-w-[400px] mx-auto mb-5 leading-relaxed">
          A Standard scanlation dedicated to providing high-quality translations. Enjoy a vast library of series, updated regularly for an enhanced reading experience.
        </p>

        {/* Social links */}
        <div className="flex gap-2.5 justify-center mb-6">
          <Link
            href="https://discord.gg/4y2WknskQ7"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[42px] h-[42px] glass glass-hover rounded-[10px] flex items-center justify-center transition-all duration-200"
          >
            <DiscordSVG />
          </Link>
          <Link
            href="/dmca"
            target="_blank"
            className="w-[42px] h-[42px] glass glass-hover rounded-[10px] flex items-center justify-center text-[11px] font-bold transition-all duration-200"
          >
            DMCA
          </Link>
        </div>

        <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          © 2026 Genz Toon. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
