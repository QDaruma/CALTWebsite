# Maintaining the CALT Task Builder

The site lets people download a ready-to-run CALT project. That download is built
from independent sources that go out of date in different ways. See `AI_CONTEXT.md`
for the full architecture and the multi-repo picture.

## What the download is made of

1. **The engine `calt-x`** is not in the ZIP. The user installs it with conda:
   create a `calt-env` environment (SageMath from conda-forge) then
   `pip install calt-x==1.5.0 matplotlib click`
   (omegaconf ships with calt-x, so it is not listed here).
   The bundled tasks import `calt.io.preprocess`. The generated `README.md` walks
   the user through it. 1.4.0 added the monomial embedding (`model_type: monomial`);
   1.5.0 added the decoder-only model (`model_type: decoder_only`) and, more
   importantly, the embedding normalization fix, so do not pin lower.

2. **The task files** (generators, configs, `shared/`, scripts) are a frozen
   snapshot in `src/generated/projectFiles.ts`, regenerated from the **vendored
   copy in `task-sources/`** (owned by this repo — the site is self-contained and
   no longer depends on any external repo; see `task-sources/README.md`).
   The six shown tasks are: parity, groebner_basis, integer_factorization,
   gf17_addition, eigvec_3x3, polynomial_addition (border_basis is dropped).

3. **Site-owned packaging** (`project-files/pyproject.toml`) carries the calt-x
   pin. **The version now lives in one place, `src/lib/caltVersion.ts`**; the
   README, the review step and `applySettings` in `zip.ts` all read it, and
   `zip.ts` rewrites the pin inside `pyproject.toml` at download time so the
   bundled snapshot cannot drift. To bump the engine, edit that constant, then
   `npm run bundle && npm run build`. No install scripts — install is conda-based.

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

The engine is pinned to `calt-x==1.5.0` (PyPI). The version lives in **one** place:

1. Test a task end to end against the new version (`pip show calt-x`).
2. Edit `CALT_VERSION` in `src/lib/caltVersion.ts`. That is the whole change.
   `projectReadme.ts` and `StepReview.tsx` read the constant, and `applySettings`
   in `zip.ts` rewrites the pin inside the bundled `pyproject.toml` at download
   time, so the ZIP can never drift from it.
3. Rebuild and redeploy. Re-bundling is only needed if a task source changed.

> `project-files/pyproject.toml` still holds a literal pin. It is the fallback the
> bundle carries, and `zip.ts` overwrites it on the way out, so it can lag without
> reaching a user. Keeping it in step is tidiness, not correctness.

> Related: the **Position embedding** "Learned" option writes the value `generic`.
> The engine also accepts `learned` as an alias, so emitting `learned` instead is
> a cosmetic choice.

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
