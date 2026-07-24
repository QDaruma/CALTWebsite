# Maintaining the CALT Task Builder

The site lets people download a ready-to-run CALT project. That download is built
from independent sources that go out of date in different ways. See `AI_CONTEXT.md`
for the full architecture and the multi-repo picture.

## What the download is made of

1. **The engine `calt-x`** is not in the ZIP. The user installs it with conda:
   create a `calt-env` environment (SageMath from conda-forge) then
   `pip install calt-x==1.3.0 matplotlib click`
   (omegaconf ships with calt-x, so it is not listed here).
   The bundled tasks import `calt.io.preprocess`, which is in calt-x 1.3.0 (PR #36 +
   PR #38). The generated `README.md` walks the user through it.

2. **The task files** (generators, configs, `shared/`, scripts) are a frozen
   snapshot in `src/generated/projectFiles.ts`, regenerated from the **vendored
   copy in `task-sources/`** (owned by this repo — the site is self-contained and
   no longer depends on any external repo; see `task-sources/README.md`).
   The six shown tasks are: parity, groebner_basis, integer_factorization,
   gf17_addition, eigvec_3x3, polynomial_addition (border_basis is dropped).

3. **Site-owned packaging** (`project-files/pyproject.toml`) carries the calt-x
   pin (`calt-x==1.3.0`). No install scripts — install is conda-based.

Each project also gets `CALT_SNAPSHOT.txt` (bundle date + the calt-x source line).

## Refreshing the task snapshot (do this deliberately, then test)

Primary path — regenerate from the vendored `task-sources/` (no network, no
external repo):
```bash
npm run bundle        # = node scripts/bundle-tasks.mjs (default source: task-sources/)
npm run build
```
Then review the diff to `src/generated/projectFiles.ts`, test a task, and commit.
To edit a task, edit it under `task-sources/` and re-bundle.

Optional — refresh the vendored copy from a remote (only while that remote still
exists; CALTCode is being deleted):
```bash
CALT_REPO_URL=<url> [CALT_REPO_BRANCH=<branch>] npm run sync:tasks
```
This re-vendors task folders + `shared/` into `task-sources/`, then bundles.

**Safety net:** `bundle-tasks.mjs` refuses to overwrite `projectFiles.ts` if the
source is missing any task that's currently bundled (pass `--force` to override).
So pointing it at an incomplete source (e.g. calt-codebase `main`) aborts loudly
instead of silently dropping tasks.

If upstream renamed YAML keys, re-check `applySettings` in `src/lib/zip.ts` — it
patches `experiments/toy/configs/{data,train}.yaml` by key name
(`num_train_samples`, `num_test_samples`, model dims, `num_train_epochs`,
`use_positional_embedding`, `no_wandb`); a rename makes it silently no-op.

## Adding a new example task (the 6 cards)

1. Create the task folder under **`task-sources/`** (needs `core/generator.py`
   returning `(str, str)`, `core/train.py`, and toy `configs/{data,train,lexer}.yaml`).
2. Re-bundle (above): `npm run bundle`.
3. In `src/lib/tasks.ts` add the id to `ALLOWED_TASKS` and an entry in `META`
   (icon, tagline, `needsSage`).
4. Add `tasks.items[id]` (name + summary) to **both** `src/i18n/en.ts` and `ja.ts`.

## Bumping the calt-x version

The engine is pinned to `calt-x==1.3.0` (PyPI). To move to a newer release:
1. Test a task end to end against the new version (`pip show calt-x`).
2. Bump `calt-x==X.Y.Z` in **three** places:
   `project-files/pyproject.toml`, `src/lib/projectReadme.ts`,
   `src/components/steps/StepReview.tsx` (then re-bundle so
   `src/generated/projectFiles.ts` picks up the new `pyproject.toml`).
3. Re-bundle, rebuild, redeploy.

> Related: the **Position embedding** "Learned" option writes the value `generic`.
> The engine now also accepts `learned` as an alias (calt-x 1.3.0), so emitting
> `learned` instead is a cosmetic choice.

## Quick check that a task still works

```bash
conda activate calt-env
cd <task>/experiments/toy/scripts
python generate.py && python train.py --dryrun && python evaluate.py
```

## Build / deploy

```bash
conda activate nodejs          # node is in a conda env on the dev box
npm install
npm run build                  # tsc --noEmit && vite build  -> dist/
npm run dev                    # local preview at http://localhost:5173
```
Pushing to `main` triggers the GitHub Pages deploy (`.github/workflows/deploy.yml`).
First-time Pages setup: Settings → Pages → Source = GitHub Actions.
