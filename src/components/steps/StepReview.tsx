import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Boxes, Check, Download, FolderTree, PackageOpen, Terminal } from "lucide-react";
import { useWizard, hasSelection, customBuildConfig } from "../../state/store";
import { useT } from "../../i18n";
import { TASKS } from "../../lib/tasks";
import { buildProjectZip, type ProjectSpec } from "../../lib/zip";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Segmented } from "../ui/Segmented";
import { Disclosure } from "../ui/Disclosure";
import { Confetti } from "../ui/Confetti";
import { CodeBlock } from "../CodeBlock";
import { StepHeader } from "../layout/StepChrome";
import { downloadBlob, toSnakeCase } from "../../lib/utils";

export function StepReview() {
  const { config, prev, patch } = useWizard();
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const proj = toSnakeCase(config.projectName) || "my_calt_project";
  const customCfg = customBuildConfig(config);
  const spec: ProjectSpec = {
    projectName: config.projectName,
    selectedTasks: config.selectedTasks,
    customConfig: customCfg,
    mode: config.downloadMode,
    settings: {
      numTrain: config.numTrain,
      numTest: config.numTest,
      epochs: config.epochs,
      modelPreset: config.modelPreset,
      useWandb: config.useWandb,
    },
    perTaskSettings: config.perTaskSettings,
  };

  const items = t.tasks.items;
  const includedTasks = [
    ...config.selectedTasks.map((id) => ({
      id,
      name: items[id]?.name ?? id,
      sage: TASKS.find((x) => x.id === id)?.needsSage,
    })),
    ...(customCfg ? [{ id: "__custom", name: config.custom.name || "my_task", sage: false }] : []),
  ];
  const anySage = includedTasks.some((x) => x.sage);
  const firstFolder =
    config.selectedTasks[0] ?? (customCfg ? toSnakeCase(config.custom.name) || "my_task" : "task");

  const download = async () => {
    setBusy(true);
    try {
      const { blob, filename } = await buildProjectZip(spec);
      downloadBlob(blob, filename);
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  if (!hasSelection(config)) {
    return (
      <div>
        <StepHeader eyebrow={t.review.eyebrow} title={t.review.title} />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <PackageOpen size={36} className="text-ink-300" />
          <p className="text-sm text-ink-500">{t.review.empty}</p>
          <Button variant="secondary" onClick={prev}>
            <ArrowLeft size={16} /> {t.review.back}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <StepHeader eyebrow={t.review.eyebrow} title={t.review.title} subtitle={t.review.subtitle} />

      <Card className="relative overflow-hidden p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-200/50 to-accent-400/30 blur-2xl" />
        <AnimatePresence>{done && <Confetti />}</AnimatePresence>
        <div className="relative">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{t.review.dlMode}</span>
          <div className="mt-2 max-w-md">
            <Segmented
              ariaLabel="download mode"
              value={config.downloadMode}
              onChange={(v) => patch({ downloadMode: v as "project" | "tasks" })}
              options={[
                { value: "project", label: t.review.dlProject },
                { value: "tasks", label: t.review.dlTasks },
              ]}
            />
          </div>
          <p className="mt-2 text-sm text-ink-500">
            {config.downloadMode === "project" ? t.review.dlProjectDesc : t.review.dlTasksDesc}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ink-400">{t.review.included}:</span>
            {includedTasks.map((x) => (
              <Badge key={x.id} tone={x.id === "__custom" ? "violet" : "brand"}>
                {x.name}
              </Badge>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button size="lg" shimmer loading={busy} onClick={download} className="sm:w-auto">
              {!busy && <Download size={18} />} {t.review.download} ({proj}
              {config.downloadMode === "project" ? ".zip" : "_tasks.zip"})
            </Button>
            <AnimatePresence>
              {done && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500"
                >
                  <Check size={15} /> {t.review.saved}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {anySage && (
            <p className="mt-3 text-xs text-amber-600">{t.review.sageNote}</p>
          )}
        </div>
      </Card>

      <div className="mt-5 space-y-4">
        <Disclosure icon={<FolderTree size={17} className="text-brand-600" />} title={t.review.peek} defaultOpen>
          <p className="mb-3 text-sm text-ink-500">{t.review.peekBody}</p>
          <ul className="space-y-2 text-sm text-ink-600">
            {(config.downloadMode === "project"
              ? [
                  t.review.insideTaskFolders(includedTasks.length),
                  t.review.insideShared,
                  t.review.insideScripts,
                  t.review.insideReadme,
                ]
              : [t.review.insideTasksOnly(includedTasks.length)]
            ).map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check size={16} className="mt-0.5 flex-shrink-0 text-brand-600" />
                {line}
              </li>
            ))}
          </ul>
        </Disclosure>

        <Disclosure icon={<Terminal size={17} className="text-brand-600" />} title={t.review.howToUse} defaultOpen={done}>
          <p className="mb-3 text-sm text-ink-500">{t.review.prereq}</p>
          <ol className="mb-4 space-y-2.5 text-sm text-ink-600">
            {[
              config.downloadMode === "project" ? t.review.howUnzipProject(proj) : t.review.howUnzipTasks,
              ...(config.downloadMode === "project" ? [t.review.howInstall] : []),
              t.review.howRun,
            ].map((line, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">{i + 1}</span>
                {line}
              </li>
            ))}
          </ol>
          {config.downloadMode === "project" && (
            <div className="mb-3">
              <CodeBlock
                language="bash"
                filename="terminal"
                maxHeight="120px"
                code={`# Linux, macOS, or WSL\nbash install.sh\n\n# Windows (PowerShell)\n./install.ps1`}
              />
            </div>
          )}
          <CodeBlock
            language="bash"
            filename="terminal"
            maxHeight="180px"
            code={`cd ${config.downloadMode === "project" ? proj + "/" : ""}${firstFolder}/experiments/toy/scripts\npython generate.py\npython train.py\npython evaluate.py`}
          />
        </Disclosure>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-ink-200/70 pt-6">
        <Button variant="ghost" onClick={prev}>
          <ArrowLeft size={18} /> {t.review.back}
        </Button>
        <div className="flex items-center gap-2 text-sm text-ink-400">
          <Boxes size={15} /> {includedTasks.length} {t.review.sTasks}
        </div>
      </div>
    </div>
  );
}
