/**
 * The one place the engine version lives.
 *
 * It used to be repeated in project-files/pyproject.toml, projectReadme.ts and
 * StepReview.tsx, which meant a bump had to be made in three files plus the
 * bundle. Everything now reads this constant, and `applySettings` in zip.ts
 * rewrites the pin inside pyproject.toml at download time so the bundled copy
 * can never drift from it.
 *
 * 1.4.0 is the first release containing the monomial embedding
 * (model_type: monomial).
 */
export const CALT_VERSION = "1.4.0";

/** `calt-x==1.4.0` — the dependency specifier used in pyproject and the README. */
export const CALT_REQUIREMENT = `calt-x==${CALT_VERSION}`;
