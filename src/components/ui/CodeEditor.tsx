import { useLayoutEffect, useMemo, useRef, type CSSProperties, type KeyboardEvent } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import { cn } from "../../lib/utils";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Identical text metrics on both layers so the caret lines up exactly.
const TEXT_STYLE: CSSProperties = {
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  fontSize: 12.5,
  lineHeight: 1.6,
  tabSize: 4,
};

/**
 * A lightweight code editor with syntax highlighting: a transparent <textarea>
 * sits on top of a Prism-highlighted <pre> that mirrors its content and scroll.
 * No external dependency; uses the Prism we already ship.
 */
export function CodeEditor({
  value,
  onChange,
  language = "python",
  minHeight = 320,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  language?: string;
  minHeight?: number;
  className?: string;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Grow the editor to fit its content so the whole skeleton (including the
  // __call__ definition) is visible immediately — no need to scroll or press
  // Return to reveal lower lines. Runs on every value change and on mount.
  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.max(ta.scrollHeight, minHeight)}px`;
  }, [value, minHeight]);

  const html = useMemo(() => {
    // Add a trailing space so a final newline still renders a highlighted line.
    const code = value.endsWith("\n") ? value + " " : value;
    const grammar = Prism.languages[language];
    if (!grammar) return escapeHtml(code);
    try {
      return Prism.highlight(code, grammar, language);
    } catch {
      return escapeHtml(code);
    }
  }, [value, language]);

  const syncScroll = () => {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.slice(0, start) + "    " + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl bg-[rgb(var(--code-bg))] ring-1 ring-ink-200", className)}
    >
      <pre
        ref={preRef}
        aria-hidden="true"
        style={TEXT_STYLE}
        className="scroll-thin pointer-events-none absolute inset-0 m-0 overflow-auto whitespace-pre p-4"
      >
        <code
          className={`language-${language}`}
          style={TEXT_STYLE}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
      <textarea
        ref={taRef}
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={onKeyDown}
        style={{ ...TEXT_STYLE, minHeight, caretColor: "rgb(var(--ink-800))" }}
        className="scroll-thin relative block w-full resize-none overflow-x-auto overflow-y-hidden whitespace-pre bg-transparent p-4 text-transparent outline-none"
      />
    </div>
  );
}
