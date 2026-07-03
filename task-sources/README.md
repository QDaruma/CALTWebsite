# task-sources/

Vendored source of the example tasks the site ships. **This makes the site
self-contained**: `src/generated/projectFiles.ts` is regenerated from these
folders, so the builder no longer depends on any external repo.

## Why this exists

The tasks originally lived in `QDaruma/CALTCode` (branch
`feat/encoder-only-handoff`), a staging repo that is being deleted. Only 2 of the
6 shown tasks (`parity`, `groebner_basis`) exist in `HiroshiKERA/calt-codebase`
`main`; the other 4 (`integer_factorization`, `gf17_addition`, `eigvec_3x3`,
`polynomial_addition`) existed only in CALTCode. Copying them here removes that
dependency.

## Snapshot provenance

- Source: `QDaruma/CALTCode` @ `feat/encoder-only-handoff`
- Commit: `af76f87bf06d72debadc24755085d1cf56f5cdc7` (2026-06-04)
- Excluded when vendoring: generated `data*/` and `outputs/` dirs, `__pycache__`.

## How to regenerate the bundle

```bash
npm run bundle        # regenerate src/generated/projectFiles.ts from these folders
# or: node scripts/bundle-tasks.mjs
```

The bundler refuses to drop a currently-bundled task (safety guard); pass
`--force` only if you deliberately remove a task here.

## Future: tracking calt-codebase main

The goal is for these tasks to live upstream in `HiroshiKERA/calt-codebase`. Once
the 4 missing tasks are upstreamed there, you can refresh this copy from it:

```bash
CALT_REPO_URL=https://github.com/HiroshiKERA/calt-codebase npm run sync:tasks
```

and eventually retire this vendored copy if you prefer to track the repo directly.
