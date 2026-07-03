# AI_CONTEXT.md

A complete description of this repository for an AI assistant or a new contributor.
Read this before changing anything. It explains what the app does, how it is built,
the data flow end to end, how to update it, the broader multi-repo project, the
strategic decisions taken, and the non-obvious rules.

## 1. What this is

The **CALT Task Builder** is a static, client-side web app. It lets a non-technical
person assemble a ready-to-run **CALT** project and download it as a ZIP. CALT
("Computer Algebra with Transformer") is a separate Python research framework that
trains small Transformer models on algebraic tasks (paper: arXiv 2506.08600).

Nothing runs on a server. All project generation and ZIP packaging happen in the
browser. The app never uploads anything.

Stack: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion (animation),
Radix UI (accessible popovers/tooltips), JSZip (lazy-loaded ZIP creation),
lucide-react (icons), Prism (code highlighting), self-hosted Inter via @fontsource.

## 2. The three repos (essential mental model)

This website is one of **three** coordinated repos. A remote contributor must know
all three:

| Repo | Role |
|---|---|
| **QDaruma/CALTWebsite** (this) | The static builder site. Bundles a snapshot of task code and produces downloadable projects. |
| **QDaruma/CALTCode** | The experiment template: the actual **task folders** (`parity/`, `groebner_basis/`, `integer_factorization/`, `gf17_addition/`, `eigvec_3x3/`, `polynomial_addition/`) + `shared/`. The site bundles a snapshot of this. |
| **HiroshiKERA/calt** (the professor's library; pip package `calt-x`) | The engine: `DatasetPipeline`, `IOPipeline`, `ModelPipeline`, `TrainerPipeline`, the Transformer model, tokenizer, positional embeddings. The downloaded projects install this. |

What a user downloads is assembled from two sources baked into
`src/generated/projectFiles.ts`:

1. **Framework content** — task folders + `shared/`, snapshotted from **CALTCode**
   (not from the professor's calt-codebase: we bundle from our QDaruma/CALTCode).
2. **Site-owned packaging** — `project-files/pyproject.toml` (the only packaging
   file; there are no install scripts — installation is conda-based, documented in
   the generated README).

3. **The engine `calt-x`** is in neither: the user installs it with conda + pip.
   ⚠️ **Strategy / important:** it is installed from calt **`main`** via git, not from
   a package index:
   `pip install "git+https://github.com/HiroshiKERA/calt.git@main"`.
   Reason: the bundled tasks import `calt.io.preprocess` (offline pre-tokenization),
   which landed on `main` via PR #36 + PR #38 (calt-x 1.3.0) but is not in the public
   `calt-x==1.1.0` tag. `main` is used because `calt-x` is not yet published to
   PyPI/conda; switch to a pinned `calt-x==X.Y.Z` once it is (see §11).

## 3. Directory map

```
site/
├── index.html               Has SEO/OG/JSON-LD meta, a CSP, and loads public/theme-init.js
├── public/
│   ├── logo.png             Favicon (transparent, 64×64)
│   └── theme-init.js        Sets theme + lang before paint (anti-FOUC). Allowed by the CSP hash/self.
├── src/
│   ├── App.tsx              Routes the current step to a screen; wraps content in <main>; skip-link
│   ├── main.tsx             React entry; ErrorBoundary + MotionConfig + providers; imports Inter
│   ├── index.css            Design tokens (CSS variables, light + .dark); reduced-motion
│   ├── components/
│   │   ├── steps/           StepWelcome, StepTasks, StepSettings, StepReview
│   │   ├── layout/          TopBar, StepRail (+ MobileProgress), BuilderShell, StepChrome
│   │   ├── ui/              Button, Card, Badge, Segmented, Disclosure, InfoHint, Tooltip,
│   │   │                    controls (Field/inputs/NumberStepper), CodeEditor, Confetti
│   │   ├── ConfigPreview.tsx   Live train.yaml/data.yaml/lexer.yaml preview with highlighting
│   │   ├── ErrorBoundary.tsx   Friendly recovery screen instead of a blank page
│   │   ├── CodeBlock.tsx / Icon.tsx
│   ├── lib/
│   │   ├── tasks.ts         Ready-made task registry (ALLOWED_TASKS filter + display metadata)
│   │   ├── codegen.ts       Custom-task file generation; LexerConfig + PosEmbedding types
│   │   ├── zip.ts           File map + ZIP (lazy JSZip); applySettings patches task configs
│   │   ├── templates.ts     Build-your-own starter templates (custom/gcd/integer_factorization/pca)
│   │   ├── stats.ts         Preset per-sample measurements (STATS)
│   │   ├── aiPrompt.ts      Copy-paste AI prompts (generator + measurements)
│   │   ├── projectReadme.ts The README generated inside the downloaded project (conda install)
│   │   └── utils.ts         snake_case, identifier checks, downloadBlob, cn
│   ├── state/store.tsx      Wizard state machine (React context) + sessionStorage persistence
│   ├── i18n/                index.tsx provider + en.ts / ja.ts dictionaries
│   ├── theme/ThemeProvider.tsx   Light/dark, toggles the `dark` class, persisted
│   └── generated/projectFiles.ts   AUTO-GENERATED snapshot. Never edit by hand.
├── project-files/pyproject.toml    Site-owned packaging (calt-x source; currently the git branch)
├── scripts/
│   ├── bundle-tasks.mjs     Builds projectFiles.ts from a framework path + project-files/
│   └── sync-tasks.mjs       Clones the framework then runs the bundler
├── README.md / MAINTAINING.md / AI_CONTEXT.md
```
There is no `preview.ts`. JSZip is imported dynamically (only at download).

## 4. The wizard (4 steps) and state (`src/state/store.tsx`)

Steps: 0 = Welcome, 1 = Tasks, 2 = Settings, 3 = Finish.

`WizardConfig` is the single source of truth, **persisted to sessionStorage** (a
refresh keeps your choices; a new tab starts clean):

- `projectName`, `selectedTasks: string[]`, `downloadMode: "project" | "tasks"`.
- `custom`: the build-your-own task:
  `{ enabled, name, templateId, code, lexer, selectedStats, metricsCode }`.
  - `templateId`: which starter template the code was seeded from (templates.ts).
  - `code`: the generator Python (null → seeded from the template).
  - `lexer: LexerConfig | null`: user edits to the tokenizer (lexer.yaml); null → template default.
  - `metricsCode`: raw Python lines injected into `instance_stats`.
- Global defaults `numTrain, numTest, epochs, modelPreset, posEmbedding, useWandb`.
- `perTaskSettings: Record<taskId, Partial<TaskSettings>>` (custom uses key `"__custom"`).

Helpers: `effectiveTaskSettings`, `customBuildConfig`, `hasSelection`. The logo
returns to step 0 **without** clearing; "Start over" resets (with a confirm).

## 5. Ready-made tasks (`src/lib/tasks.ts`) — the 6 example cards

`BUNDLED_TASKS` comes from the snapshot. `ALLOWED_TASKS` whitelists the **six** shown:
`parity, groebner_basis, integer_factorization, gf17_addition, eigvec_3x3,
polynomial_addition`. `border_basis` is intentionally **dropped** (close to Gröbner,
less popular — professor's request). The four arithmetic/matrix/poly tasks are
adaptations of the official calt-codebase `examples/`. `META` holds icon/tagline/
needsSage; names+summaries come from i18n (`tasks.items[id]`).

## 6. Download pipeline (`src/lib/zip.ts`) + live preview

`projectFileMap(spec)` produces a `path -> content` map:
- ready-made task → `TASK_FILES[id]` patched by `applySettings`.
- custom task → `buildFiles(customConfig)` from `codegen.ts`.
- `"project"` mode also adds `COMMON_FILES` (shared/ + pyproject + snapshot stamp)
  and a generated root `README.md` (conda install instructions).

`applySettings` patches `experiments/toy/configs/`:
- `data.yaml`: `num_train_samples`, `num_test_samples`.
- `train.yaml`: model block (`MODEL_PRESETS`), `num_train_epochs`,
  **`use_positional_embedding`** (string, via `setYamlStr`), and `no_wandb`.

**ConfigPreview** (`src/components/ConfigPreview.tsx`) reuses `projectFileMap` for a
single task to show the **real** generated `train.yaml`/`data.yaml`/`lexer.yaml` in
Step 2, highlighting the lines the controls edit. This is the "train.yaml aside +
which parts are edited" feature.

## 7. Custom task: code, tokenizer, measurements (`codegen.ts`, `templates.ts`)

`buildFiles(cfg: BuildConfig)` emits a full task folder (core/*.py, configs, scripts).
- **Templates** (`templates.ts`): `custom` (blank), `gcd`, `integer_factorization`,
  `pca`. A picker in StepTasks seeds `code` + `lexer` + deps from the chosen template.
- **Tokenizer editor** (`LexerEditor` in StepTasks): edits `LexerConfig`
  (numbers range, misc symbols, digit_group, attach_sign, allow_float) → written to
  `lexer.yaml`. This is the "set lexer.yml to match the generator" feature.
- **Measurements** (`metricsPy`): selected preset stats (`stats.ts`) + the user's
  `metricsCode`, injected into `instance_stats`; provides `re`, `math`, `_ints`.
- `MODEL_PRESETS` maps small/medium/large to encoder/decoder sizes.
- `PosEmbedding` type = `generic | sinusoidal | rope | none` (the Settings selector;
  label "Learned" maps to value `generic` — see §11 strategy note).

## 8. Settings (Step 2)

Dataset size presets: **10,000 / 100,000 / 1,000,000** train (professor's request).
Model size (small/medium/large), training rounds (epochs — renamed from "Practice
rounds"), **Position embedding** (Learned[=generic]/Sinusoidal/RoPE/None), and a
Weights & Biases logging toggle. The ConfigPreview sits beside these.

## 9. AI prompts, i18n, theming

- `aiPrompt.ts`: `buildAiPrompt` (generator) requires the user to state INPUT/OUTPUT
  and assumptions (ranges) and exposes them as `__init__` args → data.yaml.
- i18n: `Dict = typeof en`; `ja.ts` must stay key-for-key in sync (missing key =
  compile error). UI strings via `useT()`; generated Python stays English.
- Theme: CSS-variable tokens in `index.css` (`:root` / `.dark`); `theme-init.js`
  sets the class before paint.

## 10. Bundling and updating (`scripts/`)

`bundle-tasks.mjs` regenerates `src/generated/projectFiles.ts`:
- Reads task folders (any with `core/generator.py`) + `shared/` from a framework path.
- Reads `pyproject.toml` from `project-files/`.
- Writes `CALT_SNAPSHOT.txt` (date + the calt-x source line) into the project.

Re-bundle from the **local** CALTCode clone (this is how the 6 tasks got in):
```bash
node scripts/bundle-tasks.mjs /home/<you>/CALTCode
npm run build
```
`sync-tasks.mjs` (`npm run sync:tasks`) clones a remote framework instead.

## 11. Project strategy, decisions, and OPEN loose ends (read this)

- **Install = calt `main` via git, not a package index.** `project-files/pyproject.toml`,
  `projectReadme.ts`, and `StepReview.tsx` install calt from `@main` because the tasks
  need `calt.io.preprocess`, which is now on main (merged via PR #36 + PR #38, calt-x
  1.3.0). Was `feature/custom-embeddings` until that branch merged.
  TODO: switch to a pinned `calt-x==X.Y.Z` once calt-x is published to PyPI/conda.
- **Position embedding value = `generic`, label "Learned".** The engine's
  `get_positional_embedding` historically accepted only `generic/sinusoidal/rope/none`
  ("learned" raised). The fix making "learned" an alias is now **on calt `main`**
  (`register_positional_embedding("learned", _make_generic)`), so both work. The site
  still writes the canonical `generic` for safety; emitting "learned" is now possible
  and is a cosmetic choice.
- **Encoder-only model work (library).** Quentin took over the professor's
  "encoder-only model for parity / custom input embedding / position embedding /
  compressing layer" requests. The encoder-only architecture + the "learned" fix are
  implemented on a calt branch and handed off in **CALTCode branch
  `feat/encoder-only-handoff`** (`handoff/` folder: doc + `.patch` + overfit test).
  Still open (await teammate Maxime): custom input embedding (xVal-style?) and
  "compressing layer in expanding layer" (ambiguous). Parity does not converge with a
  one-shot encoder-only model — expected, parity needs chain-of-thought (paper ref [12]).
- **Owned by the teammate, not the site:** post-evaluation analysis pipeline,
  token/text/Sage visualization, and the W&B benchmarks.

## 12. How to extend

- **New ready-made task:** add it to CALTCode (needs `core/generator.py` + toy
  `configs/{data,train,lexer}.yaml`), re-bundle, then add the id to `ALLOWED_TASKS` +
  `META` in `tasks.ts` and to `tasks.items` in `en.ts`/`ja.ts`.
- **New build-your-own template:** add it in `templates.ts` (the picker shows it).
- **New preset measurement:** add a `StatDef` in `stats.ts`.
- **New UI string:** add to `en.ts` AND `ja.ts` (both, or it won't compile).

## 13. Non-obvious rules (do not trip on these)

- `src/generated/projectFiles.ts` is generated — never hand-edit; change source + re-bundle.
- `ja.ts` must stay key-for-key in sync with `en.ts`.
- `applySettings` depends on the exact YAML keys in the bundled toy configs.
- Per-task custom settings live under the `"__custom"` key.
- The install currently targets a git branch (see §11); treat changing it as deliberate.
- `base: "./"` in `vite.config.ts` keeps asset paths relative for subpath hosting.
- Node isn't on the default PATH on the dev box; this project was built with a conda
  `nodejs` env: `conda activate nodejs` then `npm run build` / `npm run dev`.
