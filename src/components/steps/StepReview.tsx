import { useMemo, useState } from "react";
import { CALT_REQUIREMENT } from "../../lib/caltVersion";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Boxes, Check, Download, FolderTree, HelpCircle, PackageOpen, Terminal } from "lucide-react";
import { useWizard, hasSelection, customBuildConfig } from "../../state/store";
import { useT } from "../../i18n";
import { buildProjectZip, projectFileMap, type ProjectSpec } from "../../lib/zip";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Disclosure } from "../ui/Disclosure";
import { Confetti } from "../ui/Confetti";
import { FileTree } from "../ui/FileTree";
import { CodeBlock } from "../CodeBlock";
import { StepHeader } from "../layout/StepChrome";
import { StepDetails } from "../layout/StepDetails";
import { downloadBlob, toSnakeCase } from "../../lib/utils";

export function StepReview() {
  const { config, prev } = useWizard();
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [showTree, setShowTree] = useState(false);

  const proj = toSnakeCase(config.projectName) || "my_calt_project";
  const customCfg = customBuildConfig(config);
  // The download is always a full, runnable project (the "Tasks only" option was
  // dropped — the professor found it unnecessary).
  const spec: ProjectSpec = {
    projectName: config.projectName,
    selectedTasks: config.selectedTasks,
    customConfig: customCfg,
    mode: "project",
    settings: {
      numTrain: config.numTrain,
      numTest: config.numTest,
      epochs: config.epochs,
      modelPreset: config.modelPreset,
      posEmbedding: config.posEmbedding,
      modelType: config.modelType,
      useWandb: config.useWandb,
    },
    perTaskSettings: config.perTaskSettings,
  };

  const taskCount =
    config.selectedTasks.length + (customCfg ? 1 : 0);
  const firstFolder =
    config.selectedTasks[0] ?? (customCfg ? toSnakeCase(config.custom.name) || "my_task" : "task");

  // Real file list of the ZIP, so the tree shows exactly what gets downloaded.
  const treePaths = useMemo(() => Object.keys(projectFileMap(spec)).sort(), [JSON.stringify(spec)]);

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
      <StepDetails text={t.details.finish} />

      <Card className="relative overflow-hidden p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-200/50 to-accent-400/30 blur-2xl" />
        <AnimatePresence>{done && <Confetti />}</AnimatePresence>
        <div className="relative flex flex-wrap items-center gap-2">
          <Button size="lg" shimmer loading={busy} onClick={download} className="sm:w-auto">
            {!busy && <Download size={18} />} {t.review.download} ({proj}.zip)
          </Button>
          {/* The file tree is hidden by default and revealed via this "?" button. */}
          <button
            type="button"
            onClick={() => setShowTree((s) => !s)}
            aria-expanded={showTree}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-600 ring-1 ring-ink-200 outline-none transition hover:text-ink-800 hover:ring-ink-300 focus-visible:ring-2 focus-visible:ring-brand-400/50"
          >
            <HelpCircle size={15} className="text-brand-600" /> {t.review.treeTitle}
          </button>
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
      </Card>

      <div className="mt-5 space-y-4">
        <AnimatePresence initial={false}>
          {showTree && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2 text-[15px] font-bold text-ink-800">
                  <FolderTree size={17} className="text-brand-600" /> {t.review.treeTitle}
                </div>
                <p className="mb-3 text-sm text-ink-500">{t.review.treeBody}</p>
                <FileTree
                  paths={treePaths}
                  notes={t.review.treeNotes}
                  strongNotes={{ configs: t.review.treeNotes.configs }}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Disclosure icon={<Terminal size={17} className="text-brand-600" />} title={t.review.howToUse} defaultOpen={done}>
          <p className="mb-3 text-sm text-ink-500">{t.review.prereq}</p>
          <ol className="mb-4 space-y-2.5 text-sm text-ink-600">
            {[t.review.howUnzipProject(proj), t.review.howInstall, t.review.howRun].map((line, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                  {i + 1}
                </span>
                {line}
              </li>
            ))}
          </ol>

          <CodeBlock
            language="bash"
            filename="terminal"
            maxHeight="180px"
            code={`conda activate calt-env\ncd ${proj}/${firstFolder}/experiments/toy/scripts\npython generate.py\npython train.py\npython evaluate.py`}
          />

          {/* The conda + pip setup is install-method-dependent and tentative (it will
              become a single `conda install calt-x` once published), so keep it
              tucked away rather than front-and-center. */}
          <div className="mt-3">
            <Disclosure title={t.review.setupLabel}>
              <CodeBlock
                language="bash"
                filename="terminal"
                maxHeight="160px"
                code={`# One-time setup with conda (details in README.md)\nconda create -n calt-env -c conda-forge sage python=3.12 -y\nconda activate calt-env\npip install ${CALT_REQUIREMENT} matplotlib click`}
              />
            </Disclosure>
          </div>
        </Disclosure>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-ink-200/70 pt-6">
        <Button variant="ghost" onClick={prev}>
          <ArrowLeft size={18} /> {t.review.back}
        </Button>
        <div className="flex items-center gap-2 text-sm text-ink-400">
          <Boxes size={15} /> {taskCount} {t.review.sTasks}
        </div>
      </div>
    </div>
  );
}
