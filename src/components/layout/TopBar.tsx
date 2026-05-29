import { Github, Moon, RotateCcw, Sun } from "lucide-react";
import logoUrl from "../../assets/logo.png";
import { useWizard } from "../../state/store";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { Button } from "../ui/Button";
import { Tooltip } from "../ui/Tooltip";
import { cn } from "../../lib/utils";

function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center rounded-lg bg-ink-100 p-0.5 text-xs font-bold">
      {(["en", "ja"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-md px-2 py-1 transition-colors",
            lang === l ? "bg-surface text-ink-900 shadow-soft" : "text-ink-400 hover:text-ink-700",
          )}
        >
          {l === "en" ? "EN" : "日本語"}
        </button>
      ))}
    </div>
  );
}

export function TopBar() {
  const { step, reset, setStep } = useWizard();
  const { theme, toggle } = useTheme();
  const { t } = useI18n();

  // Clicking the logo returns home without discarding work; "Start over" wipes
  // everything (with a confirmation) so the two actions are clearly distinct.
  const goHome = () => step > 0 && setStep(0);
  const confirmReset = () => {
    if (window.confirm(t.nav.confirmReset)) reset();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/60 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <button onClick={goHome} className="group flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60">
          <img
            src={logoUrl}
            alt="CALT"
            width={44}
            height={44}
            className="h-11 w-11 flex-shrink-0 rounded-full object-contain"
          />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[15px] font-extrabold tracking-tight text-ink-900">{t.nav.brand}</span>
            <span className="mt-0.5 hidden text-[11px] font-medium text-ink-400 sm:block">
              {t.nav.tagline}
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          {step > 0 && (
            <Tooltip content={t.nav.startOver}>
              <Button variant="ghost" size="sm" onClick={confirmReset} aria-label={t.nav.startOver}>
                <RotateCcw size={15} /> <span className="hidden md:inline">{t.nav.startOver}</span>
              </Button>
            </Tooltip>
          )}
          <LangSwitch />
          <Tooltip content={t.nav.toggleTheme}>
            <Button variant="secondary" size="icon" onClick={toggle} aria-label={t.nav.toggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          </Tooltip>
          <a href="https://github.com/HiroshiKERA/calt-codebase/" target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm">
              <Github size={15} /> <span className="hidden sm:inline">{t.nav.github}</span>
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
