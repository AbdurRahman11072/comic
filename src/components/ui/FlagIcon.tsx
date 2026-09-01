import React from "react";

export function FlagIcon({ code, className = "w-4 h-3" }: { code: string; className?: string }) {
  const lang = code.toLowerCase();

  switch (lang) {
    case "en":
      // UK Flag
      return (
        <svg viewBox="0 0 60 30" className={`${className} rounded-sm shrink-0 overflow-hidden shadow-sm`}>
          <clipPath id="s">
            <path d="M0,0 v30 h60 v-30 z" />
          </clipPath>
          <clipPath id="t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
          </g>
        </svg>
      );

    case "bn":
      // Bangladesh Flag
      return (
        <svg viewBox="0 0 50 30" className={`${className} rounded-sm shrink-0 overflow-hidden shadow-sm`}>
          <rect width="50" height="30" fill="#006a4e" />
          <circle cx="22.5" cy="15" r="10" fill="#f42a41" />
        </svg>
      );

    default:
      return (
        <span className="text-xs">🌐</span>
      );
  }
}
