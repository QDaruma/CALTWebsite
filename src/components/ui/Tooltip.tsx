import * as RT from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RT.Provider delayDuration={200} skipDelayDuration={400}>
      {children}
    </RT.Provider>
  );
}

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <RT.Root>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-[260px] rounded-lg bg-inverse px-3 py-2 text-xs font-medium leading-relaxed text-inverse-fg shadow-lifted data-[state=delayed-open]:animate-scale-in"
        >
          {content}
          <RT.Arrow className="fill-inverse" />
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  );
}
