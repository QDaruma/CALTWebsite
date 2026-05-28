import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Tone = "brand" | "neutral" | "amber" | "green" | "violet";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  neutral: "bg-ink-100 text-ink-600 ring-ink-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  violet: "bg-accent-500/10 text-accent-600 ring-accent-500/20",
};

export function Badge({
  tone = "neutral",
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
