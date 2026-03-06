import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Lang, translations } from "./translations";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof translations;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function detectLang(): Lang {
  const stored = localStorage.getItem("kiki-lang");
  if (stored === "en" || stored === "ru") return stored;
  const browserLang = navigator.language.slice(0, 2);
  return browserLang === "ru" ? "ru" : "en";
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("kiki-lang", l);
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
