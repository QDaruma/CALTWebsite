import * as Popover from "@radix-ui/react-popover";
import { HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useT } from "../../i18n";
import { cn } from "../../lib/utils";

/**
 * A small "?" affordance that opens a friendly explanation popover.
 * Used for progressive disclosure of any concept a beginner might not know.
 */
export function InfoHint({
  title,
  children,
  className,
  label,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const t = useT();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={label ?? t.a11y.whatsThis}
          className={cn(
            "inline-flex items-center gap-1 text-ink-400 transition-colors hover:text-brand-600 outline-none focus-visible:text-brand-600",
            className,
          )}
        >
          <HelpCircle size={15} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 w-[300px] rounded-xl bg-surface p-4 text-sm leading-relaxed text-ink-600 shadow-lifted ring-1 ring-ink-200 data-[state=open]:animate-scale-in"
        >
          {title && <p className="mb-1 font-bold text-ink-800">{title}</p>}
          <div className="space-y-2">{children}</div>
          <Popover.Arrow className="fill-surface" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
