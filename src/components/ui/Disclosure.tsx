import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export function Disclosure({
  icon,
  title,
  hint,
  defaultOpen = false,
  children,
}: {
  icon?: ReactNode;
  title: ReactNode;
  hint?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-ink-200/70 shadow-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-ink-50/60"
      >
        <span className="flex items-center gap-2.5 text-[15px] font-bold text-ink-800">
          {icon}
          {title}
          {hint}
        </span>
        <ChevronDown
          size={18}
          className={cn("flex-shrink-0 text-ink-400 transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-t border-ink-100 p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
