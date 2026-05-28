import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useT } from "../../i18n";
import { cn } from "../../lib/utils";

export function Field({
  label,
  help,
  error,
  info,
  children,
}: {
  label: string;
  help?: ReactNode;
  error?: string | null;
  info?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-sm font-semibold text-ink-700">{label}</span>
        {info}
      </div>
      {children}
      {help && !error && (
        <div className="mt-1.5 text-xs leading-relaxed text-ink-500">{help}</div>
      )}
      {error && <div className="mt-1.5 text-xs font-medium text-rose-600">{error}</div>}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border-0 bg-surface px-3.5 py-2.5 text-sm text-ink-800 ring-1 ring-ink-200 transition placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-brand-500";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" {...props} className={cn(inputBase, props.className)} />;
}

export function NumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" {...props} className={cn(inputBase, props.className)} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, "leading-relaxed", className)} />;
}

export function Select({
  children,
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="relative">
      <select {...rest} className={cn(inputBase, "cursor-pointer appearance-none pr-10", className)}>
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
      />
    </div>
  );
}

/** Friendly number stepper with -/+ buttons. Best for small bounded values. */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const t = useT();
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="flex h-11 items-center rounded-xl bg-surface ring-1 ring-ink-200 focus-within:ring-2 focus-within:ring-brand-500">
      <button
        type="button"
        aria-label={t.a11y.decrease}
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        className="flex h-full w-11 items-center justify-center rounded-l-xl text-ink-500 transition hover:bg-ink-50 hover:text-ink-800 disabled:opacity-30"
      >
        <Minus size={16} />
      </button>
      <div className="flex flex-1 items-center justify-center gap-1 text-sm font-semibold tabular-nums text-ink-800">
        {value.toLocaleString()}
        {suffix && <span className="text-xs font-normal text-ink-400">{suffix}</span>}
      </div>
      <button
        type="button"
        aria-label={t.a11y.increase}
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        className="flex h-full w-11 items-center justify-center rounded-r-xl text-ink-500 transition hover:bg-ink-50 hover:text-ink-800 disabled:opacity-30"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
