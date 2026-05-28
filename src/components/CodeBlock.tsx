import { useMemo, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";
import { Check, Copy } from "lucide-react";
import { cn } from "../lib/utils";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function CodeBlock({
  code,
  language,
  filename,
  maxHeight = "460px",
  className,
}: {
  code: string;
  language: string;
  filename?: string;
  maxHeight?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const lang = language === "shell" ? "bash" : language;

  const html = useMemo(() => {
    const grammar = Prism.languages[lang];
    if (!grammar) return escapeHtml(code);
    try {
      return Prism.highlight(code, grammar, lang);
    } catch {
      return escapeHtml(code);
    }
  }, [code, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl bg-[rgb(var(--code-bg))] ring-1 ring-ink-200",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-ink-100 bg-surface/50 px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          {filename && (
            <span className="ml-2 font-mono text-xs text-ink-500">{filename}</span>
          )}
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-500 transition hover:bg-ink-100 hover:text-brand-600"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="scroll-thin m-0 overflow-auto p-4" style={{ maxHeight }}>
        <code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
