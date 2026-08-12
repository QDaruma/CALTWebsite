/**
 * The one place the engine version lives.
 *
 * It used to be repeated in project-files/pyproject.toml, projectReadme.ts and
 * StepReview.tsx, which meant a bump had to be made in three files plus the
 * bundle. Everything now reads this constant, and `applySettings` in zip.ts
 * rewrites the pin inside pyproject.toml at download time so the bundled copy
 * can never drift from it.
 *
 * 1.5.0 matters, do not pin lower. It carries the fix that normalizes the
 * token+position sum before the transformer stack (the way BART's
 * layernorm_embedding does). Without it the residual stream enters the stack
 * about 35x smaller than what each layer adds to it: the model still learns
 * sequence structure but never learns to read precise values, so coefficient
 * accuracy sits at chance level. On the cumulative-product task over F7 that is
 * the difference between 0.2% and 53.6%. Every project this site generates would
 * train badly on 1.4.0.
 *
 * 1.5.0 also adds the decoder-only model (model_type: decoder_only); the
 * monomial embedding (model_type: monomial) has been there since 1.4.0.
 */
export const CALT_VERSION = "1.5.0";

/** `calt-x==1.5.0` — the dependency specifier used in pyproject and the README. */
export const CALT_REQUIREMENT = `calt-x==${CALT_VERSION}`;
