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
- **Self-updating task content.** The ready-made tasks come from the CALT framework
  repo and are refreshed with one command (see *Updating the tasks*).

## How a visitor uses it

1. **Name the project** on the landing screen.
2. **Tasks.** Pick from the ready-made tasks (parity, Gröbner basis, border basis),
   and/or open **Build your own task** to describe a custom one. The custom builder
   can write the data generator for you via a copy-paste AI prompt, or you paste in
   code. It can also add custom measurements the same way.
3. **Settings.** Tune each selected task independently: dataset size, model size,
   training rounds, and progress logging. Defaults are sensible.
4. **Finish.** Choose *Full project* or *Tasks only*, see what is inside, and
   download the ZIP. A short, copy-paste run guide is included.

The downloaded project runs locally with `install.sh` / `install.ps1` then a few
`python` commands. The heavy engine (`calt-x`) is installed from PyPI and is
**pinned** to a tested version so downloads keep working.

## Run locally

Requires Node 18+.

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
To refresh them from the framework repo:

```bash
npm run sync:tasks   # clones QDaruma/CALTCode, re-bundles the snapshot
```

Then review the diff in `src/generated/projectFiles.ts`, rebuild, and commit. To
point at a different source repo: `CALT_REPO_URL=<url> npm run sync:tasks`. To
bundle from a local checkout instead of cloning: `npm run bundle -- /path/to/CALTCode`.

The engine pin lives in `project-files/requirements.txt` and `project-files/pyproject.toml`.
To upgrade `calt-x`, bump it there, run `npm run sync:tasks`, and test a task before shipping.

See [MAINTAINING.md](MAINTAINING.md) for the full maintenance workflow and
[AI_CONTEXT.md](AI_CONTEXT.md) for a deep architectural description.

## Deploy to GitHub Pages

```bash
npm run build
```

Publish the contents of `dist/` to GitHub Pages (for example with a Pages action
that uploads `dist/`, or by pushing `dist/` to a `gh-pages` branch). Because asset
paths are relative, it works at the repository subpath without extra config.

## Project layout

```
site/
├── src/
│   ├── components/      UI: steps/, layout/, ui/ primitives
│   ├── lib/             codegen, zip, templates, stats, aiPrompt, tasks, preview
│   ├── state/           wizard store (React context)
│   ├── i18n/            en.ts / ja.ts dictionaries + provider
│   ├── theme/           light/dark provider
│   └── generated/       projectFiles.ts (AUTO-GENERATED snapshot, do not edit)
├── project-files/       site-owned packaging: requirements.txt, pyproject.toml, install.*
├── scripts/             bundle-tasks.mjs, sync-tasks.mjs
└── public/
```
