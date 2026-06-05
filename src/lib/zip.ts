import { buildFiles, MODEL_PRESETS, type BuildConfig, type ModelPreset, type PosEmbedding } from "./codegen";
import { TASK_FILES, COMMON_FILES } from "../generated/projectFiles";
import { getTaskMeta } from "./tasks";
import { buildProjectReadme } from "./projectReadme";
import { toSnakeCase } from "./utils";

/** Global training settings applied to every task in the project. */
export interface ProjectSettings {
  numTrain: number;
  numTest: number;
  epochs: number;
  modelPreset: ModelPreset;
  posEmbedding: PosEmbedding;
  useWandb: boolean;
}

export interface ProjectSpec {
  projectName: string;
  /** Real example task folder ids to include (verbatim repo files). */
  selectedTasks: string[];
  /** Generated custom task, or null. */
  customConfig: BuildConfig | null;
  /** "project" = full runnable repo; "tasks" = just the task folders. */
  mode: "project" | "tasks";
  /** Default settings applied to every task (unless overridden per-task). */
  settings: ProjectSettings;
  /** Per-task overrides merged on top of `settings` at download time. */
  perTaskSettings?: Record<string, Partial<ProjectSettings>>;
}

function setYamlInt(content: string, key: string, value: number): string {
  return content.replace(new RegExp(`^(\\s*${key}:\\s*)\\d+`, "m"), `$1${value}`);
}

function setYamlBool(content: string, key: string, value: boolean): string {
  return content.replace(
    new RegExp(`^(\\s*${key}:\\s*)(?:true|false|True|False)`, "m"),
    `$1${value}`,
  );
}

function setYamlStr(content: string, key: string, value: string): string {
  return content.replace(new RegExp(`^(\\s*${key}:\\s*)\\S+`, "m"), `$1${value}`);
}

/**
 * Apply the project-wide settings to an example task's toy config files.
 * Only touches experiments/toy/configs so other experiments keep their own
 * committed settings. Missing keys are left untouched (regex simply no-ops).
 */
function applySettings(path: string, content: string, s: ProjectSettings): string {
  if (path.endsWith("experiments/toy/configs/data.yaml")) {
    content = setYamlInt(content, "num_train_samples", s.numTrain);
    content = setYamlInt(content, "num_test_samples", s.numTest);
  } else if (path.endsWith("experiments/toy/configs/train.yaml")) {
    const m = MODEL_PRESETS[s.modelPreset];
    content = setYamlInt(content, "num_encoder_layers", m.layers);
    content = setYamlInt(content, "num_decoder_layers", m.layers);
    content = setYamlInt(content, "num_encoder_heads", m.heads);
    content = setYamlInt(content, "num_decoder_heads", m.heads);
    content = setYamlInt(content, "d_model", m.d);
    content = setYamlInt(content, "encoder_ffn_dim", m.ffn);
    content = setYamlInt(content, "decoder_ffn_dim", m.ffn);
    content = setYamlInt(content, "num_train_epochs", s.epochs);
    content = setYamlStr(content, "use_positional_embedding", s.posEmbedding);
    content = setYamlBool(content, "no_wandb", !s.useWandb);
  }
  return content;
}

/** Build the full set of files (path -> content) the ZIP will contain. */
export function projectFileMap(spec: ProjectSpec): Record<string, string> {
  const proj = toSnakeCase(spec.projectName) || "my_calt_project";
  const prefix = spec.mode === "project" ? `${proj}/` : "";
  const map: Record<string, string> = {};

  for (const id of spec.selectedTasks) {
    const files = TASK_FILES[id];
    const effectiveSettings: ProjectSettings = { ...spec.settings, ...spec.perTaskSettings?.[id] };
    if (files) for (const [p, c] of Object.entries(files)) map[prefix + p] = applySettings(p, c, effectiveSettings);
  }
  if (spec.customConfig) for (const f of buildFiles(spec.customConfig)) map[prefix + f.path] = f.content;

  if (spec.mode === "project") {
    for (const [p, c] of Object.entries(COMMON_FILES)) map[prefix + p] = c;

    // Note: wandb (optional progress logging) ships as a calt-x dependency, so the
    // conda install already covers it when a task turns logging on.

    // A friendly, project-specific README at the root.
    const taskFolders = [
      ...spec.selectedTasks,
      ...(spec.customConfig ? [toSnakeCase(spec.customConfig.taskName) || "my_task"] : []),
    ];
    const sageTasks = spec.selectedTasks.filter((id) => getTaskMeta(id)?.needsSage);
    map[prefix + "README.md"] = buildProjectReadme({
      projectName: spec.projectName || "My CALT project",
      taskFolders,
      sageTasks,
    });
  }
  return map;
}

export async function buildProjectZip(spec: ProjectSpec): Promise<{ blob: Blob; filename: string }> {
  // Lazy-load JSZip: it is only needed at download time, so it stays out of the
  // initial bundle and is fetched on the first download click.
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const [path, content] of Object.entries(projectFileMap(spec))) {
    zip.file(path, path.endsWith(".sh") ? content.replace(/\r\n/g, "\n") : content);
  }
  const proj = toSnakeCase(spec.projectName) || "my_calt_project";
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return { blob, filename: spec.mode === "project" ? `${proj}.zip` : `${proj}_tasks.zip` };
}
