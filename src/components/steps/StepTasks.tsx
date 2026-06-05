import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, Copy, Download, FileCode2, Pencil, Sigma, Sparkles } from "lucide-react";
import { useWizard, hasSelection, customBuildConfig } from "../../state/store";
import { useT } from "../../i18n";
import { TASKS } from "../../lib/tasks";
import { STATS } from "../../lib/stats";
import { freshGeneratorCode, defaultLexerConfig, type LexerConfig } from "../../lib/codegen";
import { TEMPLATES, getTemplate } from "../../lib/templates";
import { buildAiPrompt, buildMeasureAiPrompt } from "../../lib/aiPrompt";
import { SectionLabel } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Segmented } from "../ui/Segmented";
import { CodeEditor } from "../ui/CodeEditor";
import { InfoHint } from "../ui/InfoHint";
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

// Seeded into the measurement editor so it is never empty: shows the format and
// that you add one `stats[...] = ...` line per measurement.
const MEASURE_SEED = `# One measurement per line. Edit these or add your own:
stats["answer_length"] = len(str(answer).split())
stats["biggest_number"] = max(_ints(problem), default=0)`;

function Measurements() {
  const { config, toggleCustomStat, patchCustom } = useWizard();
  const t = useT();
  const ts = t.stats;
  const ins = t.insights;
  const [mode, setMode] = useState<"code" | "ai">("ai");

  // First time the user opens "Write code", give them a working example to adapt.
  useEffect(() => {
    if (mode === "code" && config.custom.metricsCode == null) {
      patchCustom({ metricsCode: MEASURE_SEED });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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

function Toggle({
  label,
  checked,
  onChange,
  info,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  info?: ReactNode;
}) {
  const btn = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex h-11 w-full items-center justify-between gap-3 rounded-xl px-3.5 ring-1 outline-none transition focus-visible:ring-2 focus-visible:ring-brand-400/50",
        checked ? "bg-brand-50/60 ring-brand-300" : "ring-ink-200 hover:ring-ink-300",
      )}
    >
      <span className="text-sm text-ink-700">{label}</span>
      <span className={cn("relative h-5 w-9 flex-shrink-0 rounded-full transition-colors", checked ? "bg-brand-600" : "bg-ink-300")}>
        <span className={cn("absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform", checked ? "translate-x-4" : "translate-x-0")} />
      </span>
    </button>
  );
  if (!info) return btn;
  return (
    <div className="flex items-center gap-1.5">
      <div className="min-w-0 flex-1">{btn}</div>
      {info}
    </div>
  );
}

// Edit lexer.yaml (the tokenizer vocabulary) so it matches the data the generator
// actually produces — the symbols it uses, the number range, decimals, etc.
function LexerEditor() {
  const { config, patchCustom } = useWizard();
  const t = useT();
  const lx: LexerConfig = config.custom.lexer ?? defaultLexerConfig(config.custom.templateId, {});
  const set = (p: Partial<LexerConfig>) => patchCustom({ lexer: { ...lx, ...p } });
  const toInt = (s: string, fallback: number) => {
    const n = parseInt(s, 10);
    return Number.isNaN(n) ? fallback : n;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-500">{t.lexer.intro}</p>
      <Field
        label={t.lexer.symbols}
        info={<InfoHint title={t.lexer.symbols}><p>{t.lexer.symbolsInfo}</p></InfoHint>}
      >
        <TextInput
          value={lx.misc.join(" ")}
          placeholder="+ - * ^ | x y"
          onChange={(e) => set({ misc: e.target.value.split(/\s+/).filter(Boolean) })}
        />
        <p className="mt-1 text-xs text-ink-400">{t.lexer.symbolsHint}</p>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t.lexer.numMin}
          info={<InfoHint title={t.lexer.numMin}><p>{t.lexer.numMinInfo}</p></InfoHint>}
        >
          <TextInput inputMode="numeric" value={String(lx.numbersMin)} onChange={(e) => set({ numbersMin: toInt(e.target.value, lx.numbersMin) })} />
        </Field>
        <Field
          label={t.lexer.numMax}
          info={<InfoHint title={t.lexer.numMax}><p>{t.lexer.numMaxInfo}</p></InfoHint>}
        >
          <TextInput inputMode="numeric" value={String(lx.numbersMax)} onChange={(e) => set({ numbersMax: toInt(e.target.value, lx.numbersMax) })} />
        </Field>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-sm font-bold text-ink-800">{t.lexer.digitGroup}</span>
          <InfoHint title={t.lexer.digitGroup}><p>{t.lexer.digitGroupInfo}</p></InfoHint>
        </div>
        <Segmented
          ariaLabel="digit-group"
          value={String(lx.digitGroup)}
          onChange={(v) => set({ digitGroup: toInt(v, lx.digitGroup) })}
          options={[
            { value: "0", label: t.lexer.whole },
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
          ]}
        />
        <p className="mt-1.5 text-xs text-ink-400">{t.lexer.digitGroupHint}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle
          label={t.lexer.attachSign}
          checked={lx.attachSign}
          onChange={(v) => set({ attachSign: v })}
          info={<InfoHint title={t.lexer.attachSign}><p>{t.lexer.attachSignInfo}</p></InfoHint>}
        />
        <Toggle
          label={t.lexer.allowFloat}
          checked={lx.allowFloat}
          onChange={(v) => set({ allowFloat: v })}
          info={<InfoHint title={t.lexer.allowFloat}><p>{t.lexer.allowFloatInfo}</p></InfoHint>}
        />
      </div>
      <p className="flex items-center gap-1.5 text-xs text-ink-400">
        <FileCode2 size={13} className="flex-shrink-0 text-brand-500" /> {t.data.editsLexer}
      </p>
    </div>
  );
}

type CustomSection = "generator" | "tokenizer" | "measure";

function CustomBuilder() {
  const { config, patchCustom } = useWizard();
  const t = useT();
  const [mode, setMode] = useState<"code" | "ai">("code");
  const [section, setSection] = useState<CustomSection>("generator");

  // Seed the editor with a working skeleton the first time the custom task is enabled.
  useEffect(() => {
    if (config.custom.enabled && config.custom.code === null) {
      const cfg = customBuildConfig(config);
      if (cfg) patchCustom({ code: freshGeneratorCode(cfg) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.custom.enabled]);

  // Pick a starter template: seed the generator code from it and remember the
  // choice (it also drives the generated lexer.yaml, deps and max sequence length).
  const nameIsUntouched = (n: string) =>
    !n || n === "My task" || TEMPLATES.some((tt) => tt.name === n);
  const pickTemplate = (id: string) => {
    const tpl = getTemplate(id);
    const cfg = customBuildConfig({ ...config, custom: { ...config.custom, enabled: true, templateId: id } });
    patchCustom({
      enabled: true,
      templateId: id,
      code: cfg ? freshGeneratorCode(cfg) : null,
      lexer: defaultLexerConfig(id, {}),
      ...(nameIsUntouched(config.custom.name) ? { name: id === "custom" ? "My task" : tpl.name } : {}),
    });
  };
  const activeTpl = getTemplate(config.custom.templateId);

  return (
    <div className="mt-4 space-y-4 border-t border-ink-100 pt-4">
      {/* Starter template + task name share one compact row on wider screens. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:items-start">
        <div>
          <SectionLabel>{t.tasks.startFrom}</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {TEMPLATES.map((tpl) => {
              const active = config.custom.templateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => pickTemplate(tpl.id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium outline-none ring-1 transition focus-visible:ring-2 focus-visible:ring-brand-400/60",
                    active
                      ? "bg-brand-600 text-white ring-brand-600"
                      : "bg-surface text-ink-600 ring-ink-200 hover:text-ink-800 hover:ring-ink-300",
                  )}
                >
                  <Icon name={tpl.icon} size={14} className="flex-shrink-0" />
                  {tpl.name}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 text-xs leading-snug text-ink-500">
            {activeTpl.beginnerSummary}
            {activeTpl.extraDeps?.length ? (
              <span className="text-amber-600"> · needs {activeTpl.extraDeps.join(", ")}</span>
            ) : activeTpl.requiresSage ? (
              <span className="text-amber-600"> · {t.tasks.needsSage}</span>
            ) : null}
          </p>
        </div>

        <Field label={t.tasks.customNameLabel}>
          <TextInput
            value={config.custom.name}
            placeholder={t.tasks.customNamePlaceholder}
            onChange={(e) => patchCustom({ name: e.target.value })}
          />
          <p className="mt-1.5 hidden text-xs leading-snug text-ink-400 lg:block">
            {t.tasks.buildOwnDesc}
          </p>
        </Field>
      </div>

      {/* One section at a time (tabs) so the generator, tokenizer and measurements
          never stack into a long scroll. */}
      <div className="space-y-3">
        <Segmented
          ariaLabel={t.tasks.sectionTabs}
          value={section}
          onChange={(v) => setSection(v as CustomSection)}
          options={[
            { value: "generator", label: t.tasks.tabGenerator },
            { value: "tokenizer", label: t.tasks.tabTokenizer },
            { value: "measure", label: t.tasks.tabMeasure },
          ]}
        />

        {section === "generator" && (
          <div className="space-y-3">
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
                <CodeEditor
                  value={config.custom.code ?? ""}
                  onChange={(v) => patchCustom({ code: v })}
                  minHeight={280}
                  maxHeight={440}
                />
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-400">
                  <span className="inline-flex items-center gap-1.5">
                    <FileCode2 size={13} className="flex-shrink-0 text-brand-500" /> {t.data.editsGenerator}
                  </span>
                  <span className="text-ink-300">·</span>
                  <span>{t.data.recipeNote}</span>
                </p>
              </>
            )}
          </div>
        )}

        {section === "tokenizer" && <LexerEditor />}

        {section === "measure" && (
          <div>
            <p className="mb-3 text-sm text-ink-500">{t.tasks.measurementsHint}</p>
            <Measurements />
          </div>
        )}
      </div>
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
