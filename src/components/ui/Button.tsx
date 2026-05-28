import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  shimmer?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "text-white bg-gradient-to-br from-brand-600 to-accent-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-surface text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50 hover:ring-ink-300 shadow-soft",
  ghost: "text-ink-600 hover:bg-ink-100/70 hover:text-ink-800",
  subtle: "bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100",
  danger: "bg-surface text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", loading, shimmer, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex select-none items-center justify-center font-semibold transition-all duration-200",
        "outline-none focus-visible:ring-4 focus-visible:ring-brand-400/30 focus-visible:ring-offset-0",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        shimmer && variant === "primary" && "shimmer-btn",
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="animate-spin" size={size === "lg" ? 18 : 16} />}
      {children}
    </button>
  );
});
