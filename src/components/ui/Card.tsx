import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
}

export function Card({ className, interactive, selected, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface ring-1 ring-ink-200/70 shadow-card",
        interactive && "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted hover:ring-ink-300",
        selected && "ring-2 ring-brand-500 shadow-glow",
        className,
      )}
      {...rest}
    />
  );
}

export function SectionLabel({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400", className)}
      {...rest}
    />
  );
}
