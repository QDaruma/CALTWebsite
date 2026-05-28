import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useWizard } from "../../state/store";
import { useT } from "../../i18n";
import { Button } from "../ui/Button";

export function StepHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="mb-7">
      {eyebrow && (
        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-brand-600">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[26px] font-extrabold tracking-tight text-ink-900 sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-500">{subtitle}</p>
      )}
    </div>
  );
}

export function StepFooter({
  onContinue,
  continueLabel = "Continue",
  continueDisabled,
  hideBack,
  children,
}: {
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  hideBack?: boolean;
  children?: ReactNode;
}) {
  const { prev, next } = useWizard();
  const t = useT();
  return (
    <div className="mt-10 flex items-center justify-between border-t border-ink-200/70 pt-6">
      {hideBack ? (
        <span />
      ) : (
        <Button variant="ghost" onClick={prev}>
          <ArrowLeft size={18} /> {t.review.back}
        </Button>
      )}
      <div className="flex items-center gap-3">
        {children}
        <Button size="lg" shimmer disabled={continueDisabled} onClick={onContinue ?? next}>
          {continueLabel} <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
