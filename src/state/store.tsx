import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type BuildConfig, type ModelPreset } from "../lib/codegen";
import { defaultSelectedStats } from "../lib/stats";

// Persist the in-progress wizard to sessionStorage so a refresh (or accidental
// reload) does not wipe the user's choices. sessionStorage (not localStorage) so
// a fresh tab starts clean.
const STORAGE_KEY = "calt-wizard";

export interface TaskSettings {
  numTrain: number;
  numTest: number;
  epochs: number;
  modelPreset: ModelPreset;
  useWandb: boolean;
}

// step 0 = welcome. Steps 1..3 are the guided builder.
export interface BuilderStep {
  idx: number;
  key: string;
  icon: string;
}
export const BUILDER_STEPS: BuilderStep[] = [
  { idx: 1, key: "tasks", icon: "Boxes" },
  { idx: 2, key: "settings", icon: "Sliders" },
  { idx: 3, key: "finish", icon: "PackageCheck" },
];
export const LAST_STEP = 3;

export interface CustomTask {
  enabled: boolean;
  name: string;
  code: string | null;
  selectedStats: string[];
  /** Raw Python lines for custom measurements, injected into instance_stats(). */
  metricsCode: string | null;
}

export interface WizardConfig {
  projectName: string;
  selectedTasks: string[];
  custom: CustomTask;
  numTrain: number;
  numTest: number;
  epochs: number;
  modelPreset: ModelPreset;
  useWandb: boolean;
  downloadMode: "project" | "tasks";
  /** Per-task overrides; merged with global defaults at download time. */
  perTaskSettings: Record<string, Partial<TaskSettings>>;
}

const defaultConfig: WizardConfig = {
  projectName: "",
  selectedTasks: [],
  custom: {
    enabled: false,
    name: "My task",
    code: null,
    selectedStats: defaultSelectedStats(),
    metricsCode: null,
  },
  numTrain: 5000,
  numTest: 500,
  epochs: 30,
  modelPreset: "small",
  useWandb: false,
  downloadMode: "project",
  perTaskSettings: {},
};

interface WizardCtx {
  config: WizardConfig;
  step: number;
  setStep: (s: number) => void;
  next: () => void;
  prev: () => void;
  patch: (p: Partial<WizardConfig>) => void;
  toggleTask: (id: string) => void;
  patchCustom: (p: Partial<CustomTask>) => void;
  toggleCustomStat: (id: string) => void;
  patchTaskSettings: (taskId: string, p: Partial<TaskSettings>) => void;
  effectiveTaskSettings: (taskId: string) => TaskSettings;
  reset: () => void;
}

const Ctx = createContext<WizardCtx | null>(null);

interface Persisted {
  config: WizardConfig;
  step: number;
}

function loadPersisted(): Persisted {
  if (typeof window === "undefined") return { config: defaultConfig, step: 0 };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { config: defaultConfig, step: 0 };
    const saved = JSON.parse(raw) as Partial<Persisted>;
    // Merge over defaults so newly-added config keys are never undefined.
    const config = { ...defaultConfig, ...saved.config, custom: { ...defaultConfig.custom, ...saved.config?.custom } };
    const step = Math.max(0, Math.min(LAST_STEP, saved.step ?? 0));
    return { config, step };
  } catch {
    return { config: defaultConfig, step: 0 };
  }
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const initial = loadPersisted();
  const [config, setConfig] = useState<WizardConfig>(initial.config);
  const [step, setStepState] = useState(initial.step);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ config, step }));
    } catch {
      /* storage full or unavailable — non-fatal */
    }
  }, [config, step]);

  const value = useMemo<WizardCtx>(() => {
    const setStep = (s: number) => setStepState(Math.max(0, Math.min(LAST_STEP, s)));
    return {
      config,
      step,
      setStep,
      next: () => setStep(step + 1),
      prev: () => setStep(step - 1),
      patch: (p) => setConfig((c) => ({ ...c, ...p })),
      toggleTask: (id) =>
        setConfig((c) => ({
          ...c,
          selectedTasks: c.selectedTasks.includes(id)
            ? c.selectedTasks.filter((x) => x !== id)
            : [...c.selectedTasks, id],
        })),
      patchCustom: (p) => setConfig((c) => ({ ...c, custom: { ...c.custom, ...p } })),
      toggleCustomStat: (id) =>
        setConfig((c) => ({
          ...c,
          custom: {
            ...c.custom,
            selectedStats: c.custom.selectedStats.includes(id)
              ? c.custom.selectedStats.filter((x) => x !== id)
              : [...c.custom.selectedStats, id],
          },
        })),
      patchTaskSettings: (taskId, p) =>
        setConfig((c) => ({
          ...c,
          perTaskSettings: { ...c.perTaskSettings, [taskId]: { ...c.perTaskSettings[taskId], ...p } },
        })),
      effectiveTaskSettings: (taskId) => ({
        numTrain: config.numTrain,
        numTest: config.numTest,
        epochs: config.epochs,
        modelPreset: config.modelPreset,
        useWandb: config.useWandb,
        ...config.perTaskSettings[taskId],
      }),
      reset: () => {
        setConfig(defaultConfig);
        setStepState(0);
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      },
    };
  }, [config, step]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWizard(): WizardCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}

/** True when the project has at least one task (example or custom). */
export function hasSelection(c: WizardConfig): boolean {
  return c.selectedTasks.length > 0 || c.custom.enabled;
}

/** Build a codegen config for the custom task, or null when none. */
export function customBuildConfig(c: WizardConfig): BuildConfig | null {
  if (!c.custom.enabled) return null;
  const s: TaskSettings = {
    numTrain: c.numTrain,
    numTest: c.numTest,
    epochs: c.epochs,
    modelPreset: c.modelPreset,
    useWandb: c.useWandb,
    ...c.perTaskSettings["__custom"],
  };
  return {
    taskName: c.custom.name || "my_task",
    description: "",
    templateId: "custom",
    paramValues: {},
    customGeneratorCode: c.custom.code,
    selectedStats: c.custom.selectedStats,
    metricsCode: c.custom.metricsCode,
    numTrain: s.numTrain,
    numTest: s.numTest,
    epochs: s.epochs,
    modelPreset: s.modelPreset,
    useWandb: s.useWandb,
  };
}
