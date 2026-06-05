import { useRef, useState } from "react";
import { PackageOpen, ArrowLeft } from "lucide-react";
import { useWizard, hasSelection, customBuildConfig, type TaskSettings } from "../../state/store";
import { useT } from "../../i18n";
import { type ModelPreset, type PosEmbedding } from "../../lib/codegen";
import { ConfigPreview } from "../ConfigPreview";
import { Card, SectionLabel } from "../ui/Card";
import { Button } from "../ui/Button";
import { Segmented } from "../ui/Segmented";
import { NumberStepper } from "../ui/controls";
import { InfoHint } from "../ui/InfoHint";
import { StepHeader, StepFooter } from "../layout/StepChrome";
import { cn } from "../../lib/utils";

const SIZE_PRESETS = [
  { value: "quick", train: 10000, test: 1000 },
  { value: "balanced", train: 100000, test: 5000 },
  { value: "thorough", train: 1000000, test: 10000 },
] as const;

interface TaskSettingsFormProps {
  taskId: string;
  settings: TaskSettings;
  onChange: (p: Partial<TaskSettings>) => void;
}

function TaskSettingsForm({ settings, onChange }: TaskSettingsFormProps) {
  const t = useT();

  const activeSize = SIZE_PRESETS.find((p) => p.train === settings.numTrain)?.value ?? "balanced";
  const sizeLabel: Record<string, string> = {
    quick: t.review.sizeQuick,
    balanced: t.review.sizeBalanced,
    thorough: t.review.sizeThorough,
  };
  const brainNote: Record<ModelPreset, string> = {
    small: t.review.brainNoteSmall,
    medium: t.review.brainNoteMedium,
    large: t.review.brainNoteLarge,
  };
  const posEmbNote: Record<PosEmbedding, string> = {
    generic: t.review.posEmbNoteGeneric,
    sinusoidal: t.review.posEmbNoteSinusoidal,
    rope: t.review.posEmbNoteRope,
    none: t.review.posEmbNoteNone,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-sm font-bold text-ink-800">{t.review.examplesQ}</span>
          <InfoHint title={t.review.examplesInfoTitle}><p>{t.review.examplesInfo}</p></InfoHint>
        </div>
        <Segmented
          ariaLabel="dataset size"
          value={activeSize}
          onChange={(v) => {
            const p = SIZE_PRESETS.find((x) => x.value === v)!;
            onChange({ numTrain: p.train, numTest: p.test });
          }}
          options={SIZE_PRESETS.map((p) => ({ value: p.value, label: `${sizeLabel[p.value]} · ${p.train.toLocaleString()}` }))}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-sm font-bold text-ink-800">{t.review.brainQ}</span>
          <InfoHint title={t.review.brainInfoTitle}><p>{t.review.brainInfo}</p></InfoHint>
        </div>
        <Segmented
          ariaLabel="model size"
          value={settings.modelPreset}
          onChange={(v) => onChange({ modelPreset: v as ModelPreset })}
          options={[
            { value: "small", label: t.review.brainSmall },
            { value: "medium", label: t.review.brainMedium },
            { value: "large", label: t.review.brainLarge },
          ]}
        />
        <p className="mt-2 text-xs text-ink-500">{brainNote[settings.modelPreset]}</p>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-sm font-bold text-ink-800">{t.review.posEmb}</span>
          <InfoHint title={t.review.posEmbInfoTitle}><p>{t.review.posEmbInfo}</p></InfoHint>
        </div>
        <Segmented
          ariaLabel="position embedding"
          value={settings.posEmbedding}
          onChange={(v) => onChange({ posEmbedding: v as PosEmbedding })}
          options={[
            { value: "generic", label: t.review.posEmbLearned },
            { value: "sinusoidal", label: t.review.posEmbSinusoidal },
            { value: "rope", label: t.review.posEmbRope },
            { value: "none", label: t.review.posEmbNone },
          ]}
        />
        <p className="mt-2 text-xs text-ink-500">{posEmbNote[settings.posEmbedding]}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-sm font-bold text-ink-800">{t.review.rounds}</span>
            <InfoHint title={t.review.roundsInfoTitle}><p>{t.review.roundsInfo}</p></InfoHint>
          </div>
          <NumberStepper
            value={settings.epochs}
            min={5}
            max={200}
            step={5}
            onChange={(v) => onChange({ epochs: v })}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-sm font-bold text-ink-800">{t.review.logging}</span>
            <InfoHint title={t.review.loggingInfoTitle}><p>{t.review.loggingInfo}</p></InfoHint>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.useWandb}
            aria-label={t.review.logging}
            onClick={() => onChange({ useWandb: !settings.useWandb })}
            className="flex h-11 w-full items-center gap-3 rounded-xl bg-surface px-3.5 ring-1 ring-ink-200 outline-none transition hover:ring-ink-300 focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span
              className={cn(
                "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200",
                settings.useWandb ? "bg-brand-600" : "bg-ink-300",
              )}
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-200",
                  settings.useWandb ? "translate-x-5" : "translate-x-0",
                )}
              />
            </span>
            <span className="text-sm text-ink-500">{settings.useWandb ? t.review.on : t.review.off}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function StepSettings() {
  const { config, prev, next, effectiveTaskSettings, patchTaskSettings } = useWizard();
  const t = useT();
  const items = t.tasks.items;

  const tabs = [
    ...config.selectedTasks.map((id) => ({
      id,
      label: items[id]?.name ?? id,
    })),
    ...(config.custom.enabled ? [{ id: "__custom", label: config.custom.name || "My task" }] : []),
  ];

  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? "");
  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveTab = (dir: 1 | -1) => {
    const i = tabs.findIndex((tab) => tab.id === (currentTab?.id ?? ""));
    const nextIdx = (i + dir + tabs.length) % tabs.length;
    const next = tabs[nextIdx];
    if (next) {
      setActiveTab(next.id);
      tabRefs.current[nextIdx]?.focus();
    }
  };

  if (!hasSelection(config)) {
    return (
      <div>
        <StepHeader eyebrow={t.settings.eyebrow} title={t.settings.title} />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <PackageOpen size={36} className="text-ink-300" />
          <p className="text-sm text-ink-500">{t.settings.noTasks}</p>
          <Button variant="secondary" onClick={prev}>
            <ArrowLeft size={16} /> {t.review.back}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <StepHeader eyebrow={t.settings.eyebrow} title={t.settings.title} subtitle={t.settings.subtitle} />

      {/* Tab bar: one per selected task */}
      {tabs.length > 1 && (
        <div
          role="tablist"
          aria-label={t.a11y.settingsTabs}
          className="mb-4 flex gap-1 rounded-xl bg-ink-100/60 p-1"
        >
          {tabs.map((tab, idx) => {
            const selected = currentTab?.id === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => (tabRefs.current[idx] = el)}
                role="tab"
                aria-selected={selected}
                aria-controls={`settings-panel-${tab.id}`}
                id={`settings-tab-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    moveTab(1);
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    moveTab(-1);
                  }
                }}
                className={cn(
                  "flex-1 truncate rounded-lg px-3 py-2 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-brand-400/40",
                  selected ? "bg-surface shadow-soft text-ink-900" : "text-ink-500 hover:text-ink-700",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Single task: no tabs, so name the task the settings apply to. */}
      {tabs.length === 1 && currentTab && (
        <div id={`settings-tab-${currentTab.id}`} className="mb-3 flex items-center gap-2">
          <SectionLabel>{currentTab.label}</SectionLabel>
        </div>
      )}

      {currentTab && (
        <div className="grid gap-4 xl:grid-cols-[1fr_minmax(0,400px)] xl:items-start">
          <Card
            role="tabpanel"
            id={`settings-panel-${currentTab.id}`}
            aria-labelledby={`settings-tab-${currentTab.id}`}
            className="space-y-6 p-6 sm:p-7"
          >
            <TaskSettingsForm
              key={currentTab.id}
              taskId={currentTab.id}
              settings={effectiveTaskSettings(currentTab.id)}
              onChange={(p) => patchTaskSettings(currentTab.id, p)}
            />
          </Card>
          <div className="xl:sticky xl:top-20">
            <ConfigPreview
              taskId={currentTab.id}
              settings={effectiveTaskSettings(currentTab.id)}
              customConfig={currentTab.id === "__custom" ? customBuildConfig(config) : null}
            />
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-400">{t.settings.appliesNote}</p>

      <StepFooter onContinue={next} continueLabel={t.settings.continueLabel} />
    </div>
  );
}
