"use client";

import { useState } from "react";
import { Maximize2, ZoomIn } from "lucide-react";

interface SeriesCoverProps {
  src: string;
  alt: string;
}

export function SeriesCover({ src, alt }: SeriesCoverProps) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      {/* Cover Card */}
      <div
        className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/10 shadow-2xl"
        role="button"
        tabIndex={0}
        aria-label={`Expand cover image of ${alt}`}
        onClick={() => setLightbox(true)}
        onKeyDown={(e) => e.key === "Enter" && setLightbox(true)}
      >
        <img
          src={src}
          alt={`Cover of ${alt}`}
          className="w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
          loading="eager"
          width={400}
          height={560}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center rounded-xl">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Maximize2 className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
        {/* Bottom zoom hint */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-white/90" />
            <span className="text-[11px] text-white/90 font-medium">View</span>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 cursor-pointer"
          onClick={() => setLightbox(false)}
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-bold"
            onClick={() => setLightbox(false)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
