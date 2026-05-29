import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, Download, FileCode2, Pencil, Sigma, Sparkles } from "lucide-react";
import { useWizard, hasSelection, customBuildConfig } from "../../state/store";
import { useT } from "../../i18n";
import { TASKS } from "../../lib/tasks";
import { STATS } from "../../lib/stats";
import { freshGeneratorCode } from "../../lib/codegen";
import { buildAiPrompt, buildMeasureAiPrompt } from "../../lib/aiPrompt";
import { SectionLabel } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Segmented } from "../ui/Segmented";
import { CodeEditor } from "../ui/CodeEditor";
import { Disclosure } from "../ui/Disclosure";
import { Field, TextInput, TextArea } from "../ui/controls";
import { Icon } from "../Icon";
import { StepHeader, StepFooter } from "../layout/StepChrome";
import { cn, downloadBlob, toSnakeCase } from "../../lib/utils";

function AiPanel() {
  const { config } = useWizard();
  const t = useT();
  const [desc, setDesc] = useState(config.custom.name);
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => buildAiPrompt(config.custom.name, desc), [config.custom.name, desc]);
  const snake = toSnakeCase(config.custom.name) || "my_task";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  const download = () =>
    downloadBlob(new Blob([prompt], { type: "text/plain;charset=utf-8" }), `${snake}_prompt.txt`);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-500">{t.data.aiIntro}</p>
      <Field label={t.data.aiDescLabel}>
        <TextArea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t.data.aiDescPlaceholder} />
        <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{t.data.aiDescHint}</p>
      </Field>
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-ink-700">{t.data.aiPromptLabel}</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={download}>
              <Download size={14} /> {t.data.downloadTxt}
            </Button>
            <Button variant="primary" size="sm" onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? t.data.copied : t.data.copyPrompt}
            </Button>
          </div>
        </div>
        <pre className="scroll-thin max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-ink-50 p-4 font-mono text-[12px] leading-relaxed text-ink-700 ring-1 ring-ink-200">
          {prompt}
        </pre>
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-brand-50/60 px-3.5 py-3 text-xs leading-relaxed text-ink-600">
        <Sparkles size={14} className="mt-0.5 flex-shrink-0 text-brand-500" />
        {t.data.aiPasteHint}
      </div>
    </div>
  );
}

function MeasureAiPanel() {
  const t = useT();
  const [desc, setDesc] = useState("");
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => buildMeasureAiPrompt(desc), [desc]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  const download = () =>
    downloadBlob(new Blob([prompt], { type: "text/plain;charset=utf-8" }), "measurement_prompt.txt");

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-500">{t.data.aiIntro}</p>
      <Field label={t.insights.measureDescLabel}>
        <TextArea
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={t.insights.measureDescPlaceholder}
        />
      </Field>
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-ink-700">{t.data.aiPromptLabel}</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={download}>
              <Download size={14} /> {t.data.downloadTxt}
            </Button>
            <Button variant="primary" size="sm" onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? t.data.copied : t.data.copyPrompt}
            </Button>
          </div>
        </div>
        <pre className="scroll-thin max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-ink-50 p-4 font-mono text-[12px] leading-relaxed text-ink-700 ring-1 ring-ink-200">
          {prompt}
        </pre>
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-brand-50/60 px-3.5 py-3 text-xs leading-relaxed text-ink-600">
        <Sparkles size={14} className="mt-0.5 flex-shrink-0 text-brand-500" />
        {t.data.aiPasteHint}
      </div>
    </div>
  );
}

function Measurements() {
  const { config, toggleCustomStat, patchCustom } = useWizard();
  const t = useT();
  const ts = t.stats;
  const ins = t.insights;
  const [mode, setMode] = useState<"code" | "ai">("ai");

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {STATS.map((s) => {
          const checked = config.custom.selectedStats.includes(s.id);
          const meta = ts[s.id] ?? { label: s.friendlyLabel, desc: s.friendlyDescription };
          return (
            <button
              key={s.id}
              onClick={() => toggleCustomStat(s.id)}
              aria-pressed={checked}
              className={cn(
                "flex items-start gap-2.5 rounded-xl p-3 text-left ring-1 transition",
                "outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60",
                checked ? "bg-brand-50/60 ring-brand-300" : "ring-ink-200 hover:ring-ink-300",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md ring-1 transition-colors",
                  checked ? "bg-brand-600 text-white ring-brand-600" : "bg-surface text-transparent ring-ink-300",
                )}
              >
                <Check size={12} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink-800">{meta.label}</span>
                <span className="block text-xs text-ink-500">{meta.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl ring-1 ring-ink-200">
        <div className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-ink-700">
          <Sigma size={15} className="text-brand-600" /> {ins.measureTitle}
        </div>
        <div className="space-y-4 border-t border-ink-100 p-3">
          <Segmented
            ariaLabel="measure-mode"
            value={mode}
            onChange={(v) => setMode(v)}
            options={[
              { value: "code", label: t.data.tabWrite },
              { value: "ai", label: t.data.tabAi },
            ]}
          />
          {mode === "ai" ? (
            <MeasureAiPanel />
          ) : (
            <>
              <CodeEditor
                value={config.custom.metricsCode ?? ""}
                onChange={(v) => patchCustom({ metricsCode: v })}
                minHeight={160}
              />
              <p className="text-xs text-ink-400">{ins.measureCodeNote}</p>
              <p className="flex items-center gap-1.5 text-xs text-ink-400">
                <FileCode2 size={13} className="flex-shrink-0 text-brand-500" /> {t.data.editsMetrics}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomBuilder() {
  const { config, patchCustom } = useWizard();
  const t = useT();
  const [mode, setMode] = useState<"code" | "ai">("code");

  // Seed the editor with a working skeleton the first time the custom task is enabled.
  useEffect(() => {
    if (config.custom.enabled && config.custom.code === null) {
      const cfg = customBuildConfig(config);
      if (cfg) patchCustom({ code: freshGeneratorCode(cfg) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.custom.enabled]);

  return (
    <div className="mt-4 space-y-5 border-t border-ink-100 pt-5">
      <Field label={t.tasks.customNameLabel}>
        <TextInput
          value={config.custom.name}
          placeholder={t.tasks.customNamePlaceholder}
          onChange={(e) => patchCustom({ name: e.target.value })}
        />
      </Field>

      <div className="space-y-4">
        <Segmented
          ariaLabel="recipe-mode"
          value={mode}
          onChange={(v) => setMode(v)}
          options={[
            { value: "code", label: t.data.tabWrite },
            { value: "ai", label: t.data.tabAi },
          ]}
        />
        {mode === "ai" ? (
          <AiPanel />
        ) : (
          <>
            <CodeEditor value={config.custom.code ?? ""} onChange={(v) => patchCustom({ code: v })} minHeight={340} />
            <p className="text-xs text-ink-400">{t.data.recipeNote}</p>
            <p className="flex items-center gap-1.5 text-xs text-ink-400">
              <FileCode2 size={13} className="flex-shrink-0 text-brand-500" /> {t.data.editsGenerator}
            </p>
          </>
        )}
      </div>

      <Disclosure
        icon={<Sigma size={16} className="text-brand-600" />}
        title={t.tasks.measurements}
        hint={<span className="text-xs font-normal text-ink-400">{t.review.optional}</span>}
      >
        <p className="mb-3 text-sm text-ink-500">{t.tasks.measurementsHint}</p>
        <Measurements />
      </Disclosure>
    </div>
  );
}

export function StepTasks() {
  const { config, toggleTask, patch, patchCustom, next } = useWizard();
  const t = useT();
  const items = t.tasks.items;
  const count = config.selectedTasks.length + (config.custom.enabled ? 1 : 0);

  const allIds = TASKS.map((task) => task.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => config.selectedTasks.includes(id));
  const toggleAll = () => patch({ selectedTasks: allSelected ? [] : allIds });

  // Panel expansion is local UI state: it resets (collapsed) when the step
  // remounts on back-navigation, while the entered data stays in the store.
  const [customOpen, setCustomOpen] = useState(false);
  const toggleCustomOpen = () => {
    const next = !customOpen;
    setCustomOpen(next);
    if (next && !config.custom.enabled) patchCustom({ enabled: true });
  };

  return (
    <div>
      <StepHeader eyebrow={t.tasks.eyebrow} title={t.tasks.title} subtitle={t.tasks.subtitle} />

      {/* Build your own: featured hero card */}
      <div
        className={cn(
          "relative mb-6 overflow-hidden rounded-2xl p-px transition-all duration-200",
          config.custom.enabled
            ? "shadow-glow bg-gradient-to-br from-brand-500 via-accent-500 to-brand-400"
            : "bg-gradient-to-br from-brand-300/60 via-accent-300/40 to-brand-200/60 hover:from-brand-400/70 hover:to-accent-400/60",
        )}
      >
        <div className="rounded-[15px] bg-surface p-5">
          <div className="flex w-full items-center gap-4">
            <button
              onClick={toggleCustomOpen}
              aria-expanded={customOpen}
              className="flex min-w-0 flex-1 items-center gap-4 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
            >
              <span
                className={cn(
                  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-colors",
                  config.custom.enabled
                    ? "bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-soft"
                    : "bg-gradient-to-br from-brand-100 to-accent-100 text-brand-700",
                )}
              >
                <Pencil size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold text-ink-900">{t.tasks.buildOwnTitle}</span>
                <span className="block truncate text-sm text-ink-500">
                  {config.custom.enabled && config.custom.name ? config.custom.name : t.tasks.buildOwnDesc}
                </span>
              </span>
              <ChevronDown
                size={18}
                className={cn("flex-shrink-0 text-ink-400 transition-transform", customOpen && "rotate-180")}
              />
            </button>
            <button
              onClick={() => patchCustom({ enabled: !config.custom.enabled })}
              aria-pressed={config.custom.enabled}
              aria-label={t.tasks.includeCustom}
              className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ring-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-400/40",
                config.custom.enabled ? "bg-brand-600 text-white ring-brand-600" : "bg-surface text-transparent ring-ink-300 hover:ring-ink-400",
              )}
            >
              <Check size={13} />
            </button>
          </div>
          {customOpen && <CustomBuilder />}
        </div>
      </div>

      {/* Example tasks */}
      <div className="mb-4 flex items-center justify-between">
        <SectionLabel>{t.tasks.chooseReal}</SectionLabel>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAll}
            className="text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            {allSelected ? t.tasks.clearAll : t.tasks.selectAll}
          </button>
          <Badge tone={count ? "brand" : "neutral"}>{t.tasks.included(count)}</Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TASKS.map((task) => {
          const active = config.selectedTasks.includes(task.id);
          const meta = items[task.id] ?? { name: task.id, summary: "" };
          return (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              aria-pressed={active}
              className={cn(
                "group relative flex flex-col rounded-2xl bg-surface p-4 text-left ring-1 transition-all duration-200",
                "outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--page))]",
                active ? "ring-2 ring-brand-500 shadow-glow" : "ring-ink-200/70 shadow-card hover:-translate-y-0.5 hover:shadow-lifted hover:ring-ink-300",
              )}
            >
              <span
                className={cn(
                  "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-md ring-1 transition-colors",
                  active ? "bg-brand-600 text-white ring-brand-600" : "bg-surface text-transparent ring-ink-300",
                )}
              >
                <Check size={12} />
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors",
                    active ? "bg-gradient-to-br from-brand-600 to-accent-600 text-white" : "bg-ink-100 text-ink-500 group-hover:bg-brand-50 group-hover:text-brand-700",
                  )}
                >
                  <Icon name={task.icon} size={21} />
                </span>
                <div className="min-w-0 pr-5">
                  <div className="text-[15px] font-bold text-ink-900">{meta.name}</div>
                  <div className="truncate font-mono text-xs text-ink-400">{task.tagline}</div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">{meta.summary}</p>
              {task.needsSage && (
                <Badge tone="amber" className="mt-3 w-fit">
                  {t.tasks.needsSage}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <StepFooter onContinue={next} continueDisabled={!hasSelection(config)} continueLabel={t.tasks.continueLabel} />
    </div>
  );
}
