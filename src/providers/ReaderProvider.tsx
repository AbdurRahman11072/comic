"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ReaderMode = "scroll" | "page";
export type ReaderTheme = "dark" | "light" | "sepia" | "amoled";

interface ReaderContextType {
  mode: ReaderMode;
  theme: ReaderTheme;
  imageWidth: number;
  setMode: (mode: ReaderMode) => void;
  setTheme: (theme: ReaderTheme) => void;
  setImageWidth: (width: number) => void;
}

const ReaderContext = createContext<ReaderContextType>({
  mode: "scroll",
  theme: "dark",
  imageWidth: 100,
  setMode: () => {},
  setTheme: () => {},
  setImageWidth: () => {},
});

function getInitialValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (stored === null) return fallback;
  // For numbers, parse; otherwise return as-is cast
  if (typeof fallback === "number") {
    const parsed = Number(stored);
    return (isNaN(parsed) ? fallback : parsed) as T;
  }
  return stored as T;
}

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ReaderMode>(() =>
    getInitialValue("reader_mode", "scroll" as ReaderMode)
  );
  const [theme, setThemeState] = useState<ReaderTheme>(() =>
    getInitialValue("reader_theme", "dark" as ReaderTheme)
  );
  const [imageWidth, setImageWidthState] = useState<number>(() =>
    getInitialValue("reader_width", 100)
  );

  const setMode = useCallback((val: ReaderMode) => {
    setModeState(val);
    if (typeof window !== "undefined") localStorage.setItem("reader_mode", val);
  }, []);

  const setTheme = useCallback((val: ReaderTheme) => {
    setThemeState(val);
    if (typeof window !== "undefined") localStorage.setItem("reader_theme", val);
  }, []);

  const setImageWidth = useCallback((val: number) => {
    setImageWidthState(val);
    if (typeof window !== "undefined") localStorage.setItem("reader_width", String(val));
  }, []);

  return (
    <ReaderContext.Provider
      value={{ mode, theme, imageWidth, setMode, setTheme, setImageWidth }}
    >
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  return useContext(ReaderContext);
}
