"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "bn", name: "Bangla", nativeName: "বাংলা", flag: "🇧🇩" },
];

export const DEFAULT_LANGUAGE = "en";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  currentLanguageOption: LanguageOption;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  currentLanguageOption: SUPPORTED_LANGUAGES[0],
  languages: SUPPORTED_LANGUAGES,
});

const STORAGE_KEY = "preferred_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        setLanguageState(saved);
      }
    } catch {
      // localStorage may fail in restricted browser modes
    }
  }, []);

  const setLanguage = (newLang: string) => {
    const validLang = SUPPORTED_LANGUAGES.some((l) => l.code === newLang)
      ? newLang
      : DEFAULT_LANGUAGE;
    setLanguageState(validLang);
    try {
      localStorage.setItem(STORAGE_KEY, validLang);
    } catch {
      // Ignore
    }
  };

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageOption,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
