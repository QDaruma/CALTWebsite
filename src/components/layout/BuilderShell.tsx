import type { ReactNode } from "react";
import { StepRail, MobileProgress } from "./StepRail";

export function BuilderShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[256px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <StepRail />
        </aside>
        <div className="min-w-0">
          <MobileProgress />
          {children}
        </div>
      </div>
    </div>
  );
}
