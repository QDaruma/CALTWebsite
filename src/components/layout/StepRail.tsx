import { motion } from "framer-motion";
import { Boxes, Check, PackageCheck, Sliders, type LucideIcon } from "lucide-react";
import { BUILDER_STEPS, useWizard } from "../../state/store";
import { useT } from "../../i18n";
import { cn } from "../../lib/utils";

const STEP_ICONS: Record<string, LucideIcon> = {
  tasks: Boxes,
  settings: Sliders,
  finish: PackageCheck,
};

export function StepRail() {
  const { step, setStep } = useWizard();
  const t = useT();
  const rail = t.rail as Record<string, string>;
  const railSub = t.railSub as Record<string, string>;

  return (
    <nav className="sticky top-24 space-y-1">
      {BUILDER_STEPS.map((s, i) => {
        const done = step > s.idx;
        const active = step === s.idx;
        const reachable = s.idx <= step;
        const StepIcon = STEP_ICONS[s.key] ?? Boxes;
        return (
          <div key={s.key} className="relative">
            {i < BUILDER_STEPS.length - 1 && (
              <span className={cn("absolute left-[27px] top-[46px] h-[calc(100%-30px)] w-px", done ? "bg-brand-300" : "bg-ink-200")} />
            )}
            <button
              onClick={() => reachable && setStep(s.idx)}
              disabled={!reachable}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                active && "bg-surface shadow-soft ring-1 ring-ink-200/70",
                !active && reachable && "hover:bg-surface/60",
                !reachable && "cursor-not-allowed opacity-55",
              )}
            >
              <span
                className={cn(
                  "relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors",
                  active && "bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-soft",
                  done && "bg-brand-100 text-brand-700",
                  !active && !done && "bg-ink-100 text-ink-400",
                )}
              >
                {done ? <Check size={16} /> : <StepIcon size={16} />}
              </span>
              <span className="min-w-0">
                <span className={cn("block text-sm font-bold", active ? "text-ink-900" : done ? "text-ink-700" : "text-ink-500")}>
                  {rail[s.key]}
                </span>
                <span className="block truncate text-xs text-ink-400">{railSub[s.key]}</span>
              </span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}

export function MobileProgress() {
  const { step } = useWizard();
  const t = useT();
  const rail = t.rail as Record<string, string>;
  const current = BUILDER_STEPS.find((s) => s.idx === step);
  return (
    <div className="mb-6 lg:hidden">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-ink-800">{current ? rail[current.key] : ""}</span>
        <span className="text-xs font-medium text-ink-400">{t.mobileStep(step, BUILDER_STEPS.length)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-600"
          initial={false}
          animate={{ width: `${(step / BUILDER_STEPS.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </div>
    </div>
  );
}
