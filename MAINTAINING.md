# Maintaining the CALT Task Builder

The site lets people download a ready-to-run CALT project. That download is built
from two independent sources, and they go out of date in different ways.

## What the download is made of

1. **The engine `calt-x`** is not in the ZIP. It is listed in `requirements.txt`
   and installed from PyPI when the user runs `install.sh` / `install.ps1`. It is
   **pinned** to a known-good version (see `project-files/requirements.txt`) so a
   future `calt-x` release cannot silently break the snapshot.

2. **The task files** (generators, configs, `shared/`, scripts) are a frozen
   snapshot captured into `src/generated/projectFiles.ts`. They come from the
   framework repo `https://github.com/QDaruma/CALTCode` and only change when you
   re-bundle.

3. **The site-owned packaging** (`requirements.txt`, `pyproject.toml`, `install.sh`,
   `install.ps1`) lives in `project-files/`. The `calt-x` pin lives here, not in the
   framework repo.

Each downloaded project also gets a `CALT_SNAPSHOT.txt` recording the bundle date and
the pinned engine version, so you can tell which snapshot a user received.

## Refreshing the task snapshot (do this deliberately, then test)

```bash
npm run sync:tasks
```

This clones `QDaruma/CALTCode`, re-bundles `src/generated/projectFiles.ts`, and cleans
up. Then review the diff, rebuild (`npm run build`), and commit.

- Source a different repo: `CALT_REPO_URL=<url> npm run sync:tasks`.
- Bundle from a local checkout instead of cloning: `npm run bundle -- /path/to/CALTCode`.

If upstream changed the YAML config keys, double-check `applySettings` in
`src/lib/zip.ts` still matches (it patches `experiments/toy/configs/data.yaml` and
`train.yaml` by key name; a rename would make it silently no-op).

## Bumping the pinned `calt-x` version

Only after testing one task end to end against the new engine.

1. Find the version you tested: `pip show calt-x` (look at `Version:`).
2. Set it in **both** `project-files/requirements.txt` and `project-files/pyproject.toml`
   (e.g. `calt-x==1.1.0`).
3. Re-run `npm run sync:tasks` so the new pin is baked into the bundle.
4. Run a full task locally: `generate.py`, `train.py`, `evaluate.py`.
5. Rebuild and redeploy.

## Quick check that a task still works

```bash
cd <task>/experiments/toy/scripts
python generate.py
python train.py
python evaluate.py
```

If it breaks only after a `calt-x` update, compare the installed version with the
engine line in `CALT_SNAPSHOT.txt` of a known-good download.
