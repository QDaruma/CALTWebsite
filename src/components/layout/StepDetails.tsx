import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useT } from "../../i18n";
import { cn } from "../../lib/utils";

// A lightweight "▶ details" toggle shown under each step header: it reveals a
// short explanation of the concept plus a link to the CALT docs, so users can
// understand the step without leaving the builder.
export function StepDetails({ text }: { text: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-5 -mt-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-md text-sm font-semibold text-brand-600 outline-none transition hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-400/50"
      >
        <ChevronRight size={15} className={cn("transition-transform", open && "rotate-90")} />
        {t.details.label}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl bg-brand-50/50 p-4 text-sm leading-relaxed text-ink-600 ring-1 ring-brand-100">
              <p>{text}</p>
              <a
                href={t.details.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
              >
                {t.details.learnMore} <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
