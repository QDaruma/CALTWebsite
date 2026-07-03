# Maintaining the CALT Task Builder

The site lets people download a ready-to-run CALT project. That download is built
from independent sources that go out of date in different ways. See `AI_CONTEXT.md`
for the full architecture and the multi-repo picture.

## What the download is made of

1. **The engine `calt-x`** is not in the ZIP. The user installs it with conda:
   create a `calt-env` environment (SageMath from conda-forge) then
   `pip install "git+https://github.com/HiroshiKERA/calt.git@main" matplotlib click`
   (omegaconf ships with calt-x, so it is not listed here).
   ⚠️ It is installed from `main` (calt-x 1.3.0) via **git**, not a package index,
   because `calt-x` is not yet published to PyPI/conda. The bundled tasks import
   `calt.io.preprocess`, which is on main (merged via PR #36 and PR #38).
   The generated `README.md` walks the user through it.

2. **The task files** (generators, configs, `shared/`, scripts) are a frozen
   snapshot in `src/generated/projectFiles.ts`, captured from **QDaruma/CALTCode**.
   The six shown tasks are: parity, groebner_basis, integer_factorization,
   gf17_addition, eigvec_3x3, polynomial_addition (border_basis is dropped).

3. **Site-owned packaging** (`project-files/pyproject.toml`) carries the calt-x
   source (currently `git+…@main`). No install scripts — install is conda-based.

Each project also gets `CALT_SNAPSHOT.txt` (bundle date + the calt-x source line).

## Refreshing the task snapshot (do this deliberately, then test)

Primary path — bundle from a local CALTCode clone **on the branch that has all
tasks** (`feat/encoder-only-handoff`; its `main` and calt-codebase `main` only
have 2 of the 6):
```bash
node scripts/bundle-tasks.mjs /path/to/CALTCode   # checked out on feat/encoder-only-handoff
npm run build
```
Then review the diff to `src/generated/projectFiles.ts`, test a task, and commit.

`npm run sync:tasks` clones the right repo+branch for you
(`QDaruma/CALTCode` @ `feat/encoder-only-handoff` by default; override with
`CALT_REPO_URL=<url>` / `CALT_REPO_BRANCH=<branch>`).

**Safety net:** `bundle-tasks.mjs` refuses to overwrite `projectFiles.ts` if the
source is missing any task that's currently bundled (pass `--force` to override).
So pointing it at the wrong source (e.g. calt-codebase `main`) aborts loudly
instead of silently dropping the 4 tasks that only live in CALTCode.

If upstream renamed YAML keys, re-check `applySettings` in `src/lib/zip.ts` — it
patches `experiments/toy/configs/{data,train}.yaml` by key name
(`num_train_samples`, `num_test_samples`, model dims, `num_train_epochs`,
`use_positional_embedding`, `no_wandb`); a rename makes it silently no-op.

## Adding a new example task (the 6 cards)

1. Create the task folder in **CALTCode** (needs `core/generator.py` returning
   `(str, str)`, `core/train.py`, and toy `configs/{data,train,lexer}.yaml`).
2. Re-bundle (above).
3. In `src/lib/tasks.ts` add the id to `ALLOWED_TASKS` and an entry in `META`
   (icon, tagline, `needsSage`).
4. Add `tasks.items[id]` (name + summary) to **both** `src/i18n/en.ts` and `ja.ts`.

## Switching calt-x from git to a published release (future)

The custom-embeddings work is merged (PR #36 + PR #38, calt-x 1.3.0 on `main`), so
the pin now tracks `@main`. Once a `calt-x` with `calt.io.preprocess` is published to
PyPI/conda:
1. Test a task end to end against the released version (`pip show calt-x`).
2. Replace the git URL with `calt-x==X.Y.Z` in **three** places:
   `project-files/pyproject.toml`, `src/lib/projectReadme.ts`,
   `src/components/steps/StepReview.tsx` (then re-bundle so
   `src/generated/projectFiles.ts` picks up the new `pyproject.toml`).
3. Re-bundle, rebuild, redeploy.

> Related: the **Position embedding** "Learned" option writes the value `generic`
> (the engine only accepts `generic/sinusoidal/rope/none` today). A fix making
> "learned" a valid alias is on the encoder-only library branch; once published you
> may switch the value back to `learned` if desired (it is the same thing).

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
