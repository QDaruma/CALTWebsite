import { motion } from "framer-motion";
import { ArrowRight, Boxes, Download, Pencil, ShieldCheck, Wand2, Zap } from "lucide-react";
import { useWizard } from "../../state/store";
import { useT } from "../../i18n";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { TextInput } from "../ui/controls";
import { toSnakeCase, validateTaskName } from "../../lib/utils";

const HOW_ICONS = [Boxes, Pencil, Download];

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function StepWelcome() {
  const { config, patch, setStep } = useWizard();
  const t = useT();
  const error = config.projectName ? validateTaskName(config.projectName) : null;
  const canStart = !!config.projectName && !error;
  const start = () => canStart && setStep(1);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
      <div className="text-center">
        <motion.h1
          variants={fade}
          custom={0}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-ink-900 sm:text-[52px]"
        >
          {t.welcome.title}
          <br className="hidden sm:block" /> <span className="gradient-text">{t.welcome.titleHighlight}</span>
        </motion.h1>

        <motion.p
          variants={fade}
          custom={1}
          initial="hidden"
          animate="show"
          className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-500"
        >
          {t.welcome.subtitle}
        </motion.p>
      </div>

      <motion.div variants={fade} custom={2} initial="hidden" animate="show" className="mx-auto mt-10 max-w-xl">
        <Card className="p-6 sm:p-7">
          <label className="block text-left">
            <span className="text-sm font-bold text-ink-800">{t.welcome.nameLabel}</span>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <TextInput
                autoFocus
                placeholder={t.welcome.namePlaceholder}
                value={config.projectName}
                onChange={(e) => patch({ projectName: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && start()}
                className="h-12 text-[15px]"
              />
              <Button size="lg" shimmer disabled={!canStart} onClick={start} className="sm:w-auto">
                {t.welcome.getStarted} <ArrowRight size={18} />
              </Button>
            </div>
          </label>
          {error ? (
            <p className="mt-2 text-left text-xs font-medium text-rose-500">{error}</p>
          ) : config.projectName ? (
            <p className="mt-2 text-left text-xs text-ink-400">{t.welcome.namedAs(toSnakeCase(config.projectName))}</p>
          ) : (
            <p className="mt-2 text-left text-xs text-ink-400">{t.welcome.nameHelpEmpty}</p>
          )}
        </Card>
      </motion.div>

      <div className="mx-auto mt-16 max-w-4xl">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold text-ink-400">
          <span className="h-px w-8 bg-ink-200" /> {t.welcome.howTitle} <span className="h-px w-8 bg-ink-200" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {t.welcome.how.map((h, i) => {
            const HIcon = HOW_ICONS[i] ?? Boxes;
            return (
              <motion.div key={i} variants={fade} custom={3 + i} initial="hidden" animate="show">
                <Card className="h-full p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <HIcon size={18} />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-400">{i + 1}</span>
                  </div>
                  <h3 className="mt-3 text-[15px] font-bold text-ink-900">{h.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{h.body}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        variants={fade}
        custom={7}
        initial="hidden"
        animate="show"
        className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-400"
      >
        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-brand-500" /> {t.welcome.trustBrowser}</span>
        <span className="inline-flex items-center gap-1.5"><Zap size={15} className="text-brand-500" /> {t.welcome.trustSetup}</span>
        <span className="inline-flex items-center gap-1.5"><Wand2 size={15} className="text-brand-500" /> {t.welcome.trustOpen}</span>
      </motion.div>
    </div>
  );
}
