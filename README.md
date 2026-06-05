# CALT Task Builder

A beginner-first web app that builds a complete, ready-to-run **CALT project** and
hands it back as a downloadable ZIP. Users name a project, pick ready-made tasks
(or describe their own), adjust a few settings, and download. No machine-learning
code to write, and nothing is uploaded: all generation and ZIP packaging happen in
the browser.

CALT (Computer Algebra with Transformer) is a research framework for training small
Transformer models on algebraic tasks. This app is the friendly front door to it.

- **Static site.** No backend. React + Vite + TypeScript + Tailwind.
- **Light / dark theme** and **English / 日本語**, both switchable in the top bar.
- **Self-updating task content.** The ready-made tasks are a snapshot of the
  **QDaruma/CALTCode** repo, refreshed by re-bundling (see *Updating the tasks*).

> This is one of three coordinated repos (this site, **CALTCode** = task code,
> **HiroshiKERA/calt** = the `calt-x` engine). For the full picture, the strategy,
> and the current loose ends, read **[AI_CONTEXT.md](AI_CONTEXT.md)** first.

## How a visitor uses it

1. **Name the project** on the landing screen.
2. **Tasks.** Pick from six ready-made tasks (parity, Gröbner basis, integer
   factorization, GF(17) running sums, 3×3 eigenvector, polynomial running sums),
   and/or open **Build your own task**. The custom builder can write the generator
   via a copy-paste AI prompt or your own code, let you edit the **tokenizer
   (lexer.yaml)**, and add custom measurements.
3. **Settings.** Tune each task: dataset size (10k / 100k / 1M), model size, training
   rounds, **position embedding**, and progress logging — with a **live preview of
   the generated `train.yaml`/`data.yaml`** beside the controls, highlighting the
   lines each control edits.
4. **Finish.** Choose *Full project* or *Tasks only*, peek inside, and download the
   ZIP. A copy-paste run guide (conda install + 3 commands) is included.

The downloaded project installs the engine with **conda** (SageMath) + `pip`. ⚠️ The
engine `calt-x` is currently installed from a **git branch**
(`feature/offline-pretokenization`), because the tasks need its `calt.io.preprocess`.
This moves back to a pinned release once that branch is merged (see AI_CONTEXT §11).

## Run locally

Requires Node 18+ (on this project's dev box, node lives in a conda env:
`conda activate nodejs`).

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # type-checks, then outputs a static site to dist/
npm run preview    # serve the production build locally
```

`base` is `"./"` in `vite.config.ts`, so the build works from any subpath (root
domain or `https://<user>.github.io/<repo>/`).

## Updating the tasks

The ready-made task files are a snapshot baked into `src/generated/projectFiles.ts`.
Refresh them by re-bundling from a local **CALTCode** clone (the primary path):

```bash
node scripts/bundle-tasks.mjs /path/to/CALTCode
npm run build
```

Then review the diff in `src/generated/projectFiles.ts`, test a task, and commit.
`npm run sync:tasks` clones a remote framework instead
(`CALT_REPO_URL=<url> npm run sync:tasks`).

The engine source lives in `project-files/pyproject.toml` (currently a git branch,
not a pinned release). See **[MAINTAINING.md](MAINTAINING.md)** for the switch-back
procedure.

See [MAINTAINING.md](MAINTAINING.md) for the full maintenance workflow and
[AI_CONTEXT.md](AI_CONTEXT.md) for a deep architectural description.

## Deploy to GitHub Pages

Deployment is automated via `.github/workflows/deploy.yml`. Every push to `main`
builds the site and publishes it to GitHub Pages automatically.

**First-time setup:** in the GitHub repo go to Settings > Pages and set the source
to **GitHub Actions** (not "Deploy from a branch").

Because asset paths are relative (`base: "./"` in `vite.config.ts`), the site works
at the repository subpath (`https://<user>.github.io/<repo>/`) without extra config.

## Project layout

```
site/
├── src/
│   ├── components/      steps/, layout/, ui/ + ConfigPreview, ErrorBoundary
│   ├── lib/             codegen, zip, templates, stats, aiPrompt, tasks, projectReadme, utils
│   ├── state/           wizard store (React context) + sessionStorage persistence
│   ├── i18n/            en.ts / ja.ts dictionaries + provider
│   ├── theme/           light/dark provider
│   └── generated/       projectFiles.ts (AUTO-GENERATED snapshot, do not edit)
├── project-files/       site-owned packaging: pyproject.toml (no install scripts)
├── scripts/             bundle-tasks.mjs, sync-tasks.mjs
└── public/              logo.png (favicon), theme-init.js (anti-FOUC)
```
