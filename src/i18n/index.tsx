import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dict } from "./en";
import { ja } from "./ja";

export type Lang = "en" | "ja";

const DICTS: Record<Lang, Dict> = { en, ja };
const STORAGE_KEY = "calt-lang";

interface LangCtx {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx | null>(null);

function getInitial(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "ja") return saved;
  return navigator.language?.toLowerCase().startsWith("ja") ? "ja" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LangCtx>(
    () => ({ lang, t: DICTS[lang], setLang: setLangState }),
    [lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

/** Convenience: just the active dictionary. */
export function useT(): Dict {
  return useI18n().t;
}
