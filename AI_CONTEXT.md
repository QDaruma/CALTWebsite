# AI_CONTEXT.md

A complete description of this repository for an AI assistant or a new contributor.
Read this before changing anything. It explains what the app does, how it is built,
the data flow end to end, how to update it, and the non-obvious rules.

## 1. What this is

The **CALT Task Builder** is a static, client-side web app. It lets a non-technical
person assemble a ready-to-run **CALT** project and download it as a ZIP. CALT
("Computer Algebra with Transformer") is a separate Python research framework that
trains small Transformer models on algebraic tasks.

Nothing runs on a server. All project generation and ZIP packaging happen in the
browser. The app never uploads anything.

Stack: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion (animation),
Radix UI (accessible popovers/tooltips), JSZip (ZIP creation), lucide-react (icons),
Prism (code highlighting).

## 2. The two content layers (important mental model)

What a user downloads is assembled from two distinct sources:

1. **Framework content** lives in the separate repo
   `https://github.com/HiroshiKERA/calt-codebase`: the task folders (`parity/`,
   `groebner_basis/`, `border_basis/`) and the shared library (`shared/`). This app
   does not contain that code as source. It embeds a **snapshot** of it.

2. **Site-owned packaging** lives here in `project-files/`:
   `requirements.txt`, `pyproject.toml`, `install.sh`, `install.ps1`. These wrap the
   framework into a runnable project and carry the pinned `calt-x` version.

3. **The engine `calt-x`** is in neither: it is installed from PyPI when the user
   runs the install script. It is pinned (see `project-files/requirements.txt`) so a
   future release cannot silently break the snapshot.

The snapshot of (1) + (2) is baked into `src/generated/projectFiles.ts` by a build
script. That generated file is what the browser actually ships.

## 3. Directory map

```
site/
├── src/
│   ├── App.tsx                 Routes the current step to a screen, animates transitions
│   ├── main.tsx                React entry; wraps providers (theme, i18n, wizard)
│   ├── index.css               Design tokens (CSS variables, light + .dark sets)
│   ├── components/
│   │   ├── steps/              StepWelcome, StepTasks, StepSettings, StepReview
│   │   ├── layout/             TopBar, StepRail (+ MobileProgress), BuilderShell, StepChrome
│   │   └── ui/                 Button, Card, Badge, Segmented, Disclosure, InfoHint,
│   │                           Tooltip, controls (Field/inputs/Select/NumberStepper),
│   │                           CodeEditor, CodeBlock, Confetti, Icon
│   ├── lib/
│   │   ├── tasks.ts            Registry of ready-made tasks (filter + display metadata)
│   │   ├── codegen.ts          Builds the custom task's files from a BuildConfig
│   │   ├── zip.ts              Assembles the file map + ZIP; patches task configs
│   │   ├── templates.ts        Generator presets for the custom task
│   │   ├── stats.ts            Preset per-sample measurements (STATS)
│   │   ├── aiPrompt.ts         Builds copy-paste AI prompts (generator + measurements)
│   │   ├── preview.ts          JS mirrors of presets for the in-UI sample preview
│   │   ├── projectReadme.ts    The README generated inside the downloaded project
│   │   └── utils.ts            snake_case, identifier checks, downloadBlob, cn
│   ├── state/store.tsx         The wizard state machine (React context)
│   ├── i18n/                   index.tsx provider + en.ts / ja.ts dictionaries
│   ├── theme/ThemeProvider.tsx Light/dark, toggles the `dark` class, persisted
│   └── generated/projectFiles.ts   AUTO-GENERATED snapshot. Never edit by hand.
├── project-files/              Site-owned packaging (see layer 2 above)
├── scripts/
│   ├── bundle-tasks.mjs        Builds projectFiles.ts from a framework path + project-files/
│   └── sync-tasks.mjs          Clones CALTCode then runs the bundler
├── README.md                   Human-facing overview
├── MAINTAINING.md              Refresh + version-bump workflow
└── AI_CONTEXT.md               This file
```

## 4. The wizard state (`src/state/store.tsx`)

`WizardConfig` is the single source of truth:

- `projectName`: names the downloaded folder/ZIP.
- `selectedTasks: string[]`: ids of ready-made tasks chosen.
- `custom`: the build-your-own task: `{ enabled, name, code, selectedStats, metricsCode }`.
  `code` is the generator Python; `metricsCode` is raw Python lines for custom
  measurements. Both may be null (defaults are generated).
- Global defaults `numTrain, numTest, epochs, modelPreset, useWandb`.
- `perTaskSettings: Record<taskId, Partial<TaskSettings>>`: per-task overrides. The
  custom task uses the key `"__custom"`.
- `downloadMode: "project" | "tasks"`.

Steps: 0 = welcome, 1 = Tasks, 2 = Settings, 3 = Finish (`BUILDER_STEPS`, `LAST_STEP`).

Helpers:
- `effectiveTaskSettings(taskId)` = global defaults merged with `perTaskSettings[taskId]`.
- `customBuildConfig(config)` = a `BuildConfig` for the custom task (or null), merging
  `perTaskSettings["__custom"]`.
- `hasSelection(config)` = at least one ready-made task or the custom task.

## 5. Ready-made tasks (`src/lib/tasks.ts`)

`BUNDLED_TASKS` comes from the generated snapshot. `ALLOWED_TASKS` whitelists the
three tasks shown in the UI (`parity`, `groebner_basis`, `border_basis`). `TASKS`
is the filtered list with display metadata (`icon`, `tagline`, `needsSage`). Display
names and summaries come from i18n (`tasks.items[id]`), not from here.

## 6. The download pipeline (`src/lib/zip.ts`)

`ProjectSpec` is built in `StepReview` from the wizard config. `projectFileMap(spec)`
produces a `path -> content` map:

- For each selected ready-made task, it copies `TASK_FILES[id]` from the snapshot,
  running each file through `applySettings(path, content, effectiveSettings)`.
- For the custom task, it calls `buildFiles(customConfig)` from `codegen.ts`.
- In `"project"` mode it also adds `COMMON_FILES` (shared/ + packaging + the snapshot
  stamp), a freshly generated root `README.md`, and un-comments `wandb` in
  `requirements.txt` if any task enabled logging (`enableWandb`).

`applySettings` only touches `experiments/toy/configs/`:
- `data.yaml`: `num_train_samples`, `num_test_samples`.
- `train.yaml`: the model block from `MODEL_PRESETS` (layers, heads, d_model, ffn),
  `num_train_epochs`, and `no_wandb` (the inverse of the logging toggle).

It edits YAML by line-anchored regex, so it depends on those exact keys existing in
the bundled toy configs. If the framework renames them, patching silently no-ops.
Re-verify after a `sync:tasks` if upstream changed config shape.

`buildProjectZip(spec)` turns the file map into a ZIP blob with JSZip.

## 7. The custom task generator (`src/lib/codegen.ts`)

`buildFiles(cfg: BuildConfig)` emits a full task folder mirroring the real layout:
`core/{__init__,generator,formatter,parser,metrics,train}.py`,
`experiments/toy/configs/{data,lexer,train}.yaml`, and
`experiments/toy/scripts/{generate,train,evaluate}.py + run.sh`.

- `generator.py` is either the user's `customGeneratorCode`, or a template-generated
  skeleton (`templates.ts`).
- `metrics.py` (`metricsPy`) writes the selected preset stats (`stats.ts`) plus the
  user's `metricsCode`, injected into `instance_stats(problem, answer)`. When custom
  code is present it provides `re`, `math`, and an `_ints(text)` helper, which is
  exactly what the measurement AI prompt promises.

`MODEL_PRESETS` maps small/medium/large to encoder/decoder sizes.

## 8. AI prompts (`src/lib/aiPrompt.ts`)

Two builders generate copy-paste prompts so a non-coder can have any chatbot write
correct code:
- `buildAiPrompt(taskName, description)` for the data generator class.
- `buildMeasureAiPrompt(description)` for measurement lines.
Both encode the exact contract the output must satisfy, then the user pastes the
result into the matching "Write code" editor.

## 9. i18n and theming

`src/i18n/en.ts` defines `Dict = typeof en`. `ja.ts` is typed as `Dict`, so a missing
or renamed key is a **compile error**. All visible UI strings go through `useT()`;
the generated Python and file contents stay English. `LanguageProvider` persists the
choice and sets `<html lang>`.

`ThemeProvider` toggles the `dark` class on `<html>`. Colors are CSS-variable tokens
in `index.css` (`:root` light set, `.dark` set) wired into Tailwind, so components use
semantic classes (`bg-surface`, `text-ink-900`, `ring-ink-200`) that flip automatically.

## 10. Bundling and updating (`scripts/`)

`bundle-tasks.mjs` regenerates `src/generated/projectFiles.ts`:
- Framework path resolution order: first CLI arg, then `CALT_REPO` env, then `../..`.
- Reads task folders (any folder with `core/generator.py`) and `shared/` from there.
- Reads packaging files from `project-files/` (falling back to the framework).
- Writes a `CALT_SNAPSHOT.txt` stamp (bundle date + the `calt-x` pin) into the project.
- Pure Node, no native deps, safe on any platform.

`sync-tasks.mjs` (`npm run sync:tasks`) shallow-clones CALTCode to a temp dir, runs the
bundler against it, and cleans up. Override the source with `CALT_REPO_URL`.

To refresh ready-made tasks: `npm run sync:tasks`, review the diff, rebuild, commit.
To upgrade the engine: bump `calt-x==X.Y.Z` in `project-files/requirements.txt` and
`project-files/pyproject.toml`, re-run `sync:tasks`, test a task, then ship.

## 11. How to extend

- **New ready-made task:** add it to CALTCode (needs `core/generator.py` and
  `experiments/toy/configs/{data,train}.yaml`), run `npm run sync:tasks`, then add the
  id to `ALLOWED_TASKS` and `META` in `tasks.ts` and to `tasks.items` in `en.ts`/`ja.ts`.
- **New custom-generator preset:** add it in `templates.ts` (and a preview in `preview.ts`).
- **New preset measurement:** add a `StatDef` in `stats.ts`.
- **New UI string:** add it to `en.ts` and `ja.ts` (both, or it will not compile).

## 12. Non-obvious rules (do not trip on these)

- `src/generated/projectFiles.ts` is generated. Never hand-edit it; change the source
  and re-bundle.
- `ja.ts` must stay key-for-key in sync with `en.ts`.
- `applySettings` depends on the exact YAML keys in the bundled toy configs.
- The custom task's per-task settings live under the `"__custom"` key and are merged
  in `customBuildConfig`.
- `calt-x` is intentionally pinned. Treat upgrades as a deliberate, tested step.
- `base: "./"` in `vite.config.ts` keeps asset paths relative for subpath hosting.
