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

    case "es":
      // Spain Flag
      return (
        <svg viewBox="0 0 50 30" className={`${className} rounded-sm shrink-0 overflow-hidden shadow-sm`}>
          <rect width="50" height="30" fill="#AA151B" />
          <rect y="7.5" width="50" height="15" fill="#F1BF00" />
        </svg>
      );

    case "hi":
      // India Flag
      return (
        <svg viewBox="0 0 50 30" className={`${className} rounded-sm shrink-0 overflow-hidden shadow-sm`}>
          <rect width="50" height="10" fill="#FF9933" />
          <rect y="10" width="50" height="10" fill="#FFFFFF" />
          <rect y="20" width="50" height="10" fill="#138808" />
          <circle cx="25" cy="15" r="3.5" fill="none" stroke="#000080" strokeWidth="0.8" />
        </svg>
      );

    case "ar":
      // Saudi Arabia Flag
      return (
        <svg viewBox="0 0 50 30" className={`${className} rounded-sm shrink-0 overflow-hidden shadow-sm`}>
          <rect width="50" height="30" fill="#006C35" />
          <text x="25" y="18" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            عربي
          </text>
        </svg>
      );

    case "id":
      // Indonesia Flag
      return (
        <svg viewBox="0 0 50 30" className={`${className} rounded-sm shrink-0 overflow-hidden shadow-sm`}>
          <rect width="50" height="15" fill="#FF0000" />
          <rect y="15" width="50" height="15" fill="#FFFFFF" />
        </svg>
      );

    default:
      return (
        <span className="text-xs">🌐</span>
      );
  }
}
