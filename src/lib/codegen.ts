// Turns the wizard's BuildConfig into the full set of files that make up a
// runnable CALT task. The output mirrors the real parity/groebner task layout
// so the unzipped folder drops straight into the CALT repo root.

import { getTemplate, type ParamValues } from "./templates";
import { STATS } from "./stats";
import { toSnakeCase, toGeneratorClassName } from "./utils";

export type ModelPreset = "small" | "medium" | "large";

// Positional-embedding strategy written to train.yaml (model.use_positional_embedding).
// Values accepted by the installed calt `generic` model: generic (= learnable) /
// sinusoidal / rope / none. ("generic" is the learnable embedding; the engine also
// accepts the alias "learned" only once the library fix is published.)
export type PosEmbedding = "generic" | "sinusoidal" | "rope" | "none";

/**
 * Architectures CALT can build. `generic` is the hand-rolled encoder-decoder and
 * the historical default; `bart` is the HuggingFace variant; `encoder_classifier`
 * drops the decoder for single-token targets (parity and friends);
 * `decoder_only` keeps one causal stack over the problem and its solution, which
 * is the convention in the arithmetic-reasoning literature; `monomial` packs a
 * coefficient and its exponents into one sequence position and needs
 * expanded-form data plus model.num_variables.
 *
 * The train.yaml this file emits carries the encoder/decoder key pairs. That is
 * fine for `decoder_only`: its config mapping reads num_layers / num_heads /
 * ffn_dim first and falls back to the decoder-side keys, so the same file drives
 * either architecture. Note it then runs at half the depth of its 6+6
 * counterpart, since one stack takes the decoder layer count.
 */
export type ModelType =
  | "generic"
  | "bart"
  | "encoder_classifier"
  | "decoder_only"
  | "monomial";

// User-editable tokenizer settings (lexer.yaml). Mirrors the real CALT schema:
// vocab.range.numbers, vocab.misc, number_policy.{attach_sign,digit_group,allow_float}.
export interface LexerConfig {
  numbersMin: number;
  numbersMax: number;
  misc: string[];
  digitGroup: number;
  attachSign: boolean;
  allowFloat: boolean;
  strict: boolean;
}

/** Default lexer config for a template (what the generator is expected to emit). */
export function defaultLexerConfig(templateId: string, vals: ParamValues): LexerConfig {
  const lx = getTemplate(templateId).lexer(vals);
  return {
    numbersMin: lx.numbers[1],
    numbersMax: lx.numbers[2],
    misc: lx.misc,
    digitGroup: lx.digitGroup,
    attachSign: lx.attachSign,
    allowFloat: lx.allowFloat ?? false,
    strict: lx.strict,
  };
}

export interface BuildConfig {
  taskName: string;
  description: string;
  templateId: string;
  paramValues: ParamValues;
  /** When set, overrides the template-generated generator.py (advanced editing). */
  customGeneratorCode: string | null;
  selectedStats: string[];
  /** Raw Python lines injected into instance_stats() for custom measurements. */
  metricsCode: string | null;
  /** User edits to lexer.yaml; falls back to the template default when null. */
  lexerOverride?: LexerConfig | null;
  numTrain: number;
  numTest: number;
  epochs: number;
  modelPreset: ModelPreset;
  posEmbedding: PosEmbedding;
  modelType: ModelType;
  useWandb: boolean;
}

export interface FileSpec {
  path: string;
  content: string;
  language: "python" | "yaml" | "bash" | "markdown";
  /** Short, friendly label for the preview tab. */
  label: string;
}

export const MODEL_PRESETS: Record<ModelPreset, { layers: number; heads: number; d: number; ffn: number }> = {
  small: { layers: 2, heads: 4, d: 128, ffn: 512 },
  medium: { layers: 3, heads: 4, d: 256, ffn: 1024 },
  large: { layers: 6, heads: 8, d: 512, ffn: 2048 },
};

function pyScalar(v: number | string): string {
  return typeof v === "number" ? String(v) : JSON.stringify(v);
}

function yamlFlowList(items: string[]): string {
  return `[${items.map((s) => JSON.stringify(s)).join(", ")}]`;
}

// ---------------------------------------------------------------------------
// Individual file generators
// ---------------------------------------------------------------------------

function generatorPy(cfg: BuildConfig, className: string): string {
  const t = getTemplate(cfg.templateId);
  if (cfg.customGeneratorCode && cfg.customGeneratorCode.trim()) {
    return cfg.customGeneratorCode.replace(/\s*$/, "") + "\n";
  }
  const header = `"""
Generate (problem, answer) pairs for the ${cfg.taskName} task.

Input  : ${t.exampleInput}
Output : ${t.exampleOutput}

Contract: __call__(seed) is deterministic and returns (problem, answer) as
strings. The DatasetPipeline calls it for seeds 0..N-1 and writes one
"input # output" line per sample.
"""

`;
  return header + t.generatorBody(cfg.paramValues, className);
}

function formatterPy(cfg: BuildConfig): string {
  const t = getTemplate(cfg.templateId);
  return t.formatterBody(cfg.paramValues, t.exampleInput, t.exampleOutput);
}

function parserPy(): string {
  return `"""
Load-time preprocessor (not needed for this task).

This task stores plain text ("input # output" per line), which CALT's default
text loader parses directly. This module is a placeholder for future extensions
(for example, switching to pickle/JSON storage of Python objects).
"""
`;
}

function metricsPy(cfg: BuildConfig): string {
  const selected = STATS.filter((s) => cfg.selectedStats.includes(s.id));
  const customCode = (cfg.metricsCode ?? "").trim();
  const hasCustom = customCode.length > 0;
  // When there is custom code, always provide re / math / _ints so anything the
  // AI prompt promised is available. Otherwise only add _ints if a preset needs it.
  const provideHelpers = selected.some((s) => s.needsInts) || hasCustom;

  const lines: string[] = [];
  for (const s of selected) lines.push(`    stats[${JSON.stringify(s.id)}] = ${s.expr}`);
  if (hasCustom) {
    lines.push("    # Your custom measurements:");
    for (const ln of customCode.split("\n")) lines.push(ln.trim() ? `    ${ln}` : "");
  }

  const imports = [provideHelpers ? "import re" : "", hasCustom ? "import math" : ""]
    .filter(Boolean)
    .join("\n");
  const importsBlock = imports ? imports + "\n\n\n" : "";

  const intsHelper = provideHelpers
    ? `def _ints(text) -> list[int]:
    """Every integer that appears in a string."""
    return [int(x) for x in re.findall(r"-?\\d+", str(text))]\n\n\n`
    : "";

  return `"""
Per-sample statistics and the success metric for the ${cfg.taskName} task.

  instance_stats  -> passed to DatasetPipeline as its 'statistics_calculator';
                     called once per generated sample. The aggregated values
                     are written to {split}_stats.yaml next to the dataset.
  success_rate    -> exact-match accuracy, reported after training.
"""

${importsBlock}${intsHelper}def instance_stats(problem, answer) -> dict:
    """Descriptive statistics for one (problem, answer) pair."""
    stats: dict[str, float] = {}
${lines.length ? lines.join("\n") + "\n" : ""}    return stats


def success_rate(predictions: list[str], targets: list[str]) -> float:
    """Fraction of predictions that exactly match the target (after .strip())."""
    if not targets:
        return 0.0
    correct = sum(1 for p, t in zip(predictions, targets) if p.strip() == t.strip())
    return correct / len(targets)
`;
}

function initPy(className: string): string {
  return `from .generator import ${className}
from .formatter import format_input, format_target
from .metrics import instance_stats, success_rate

__all__ = [
    ${JSON.stringify(className)},
    "format_input",
    "format_target",
    "instance_stats",
    "success_rate",
]
`;
}

function trainPy(cfg: BuildConfig): string {
  return `"""
Training runner for the ${cfg.taskName} task.

Plain-text storage ("input # output" per line) means CALT's default text loader
handles parsing, so no custom preprocessor is needed.
"""

import os

from omegaconf import DictConfig, OmegaConf

from shared.calt_adapter import (
    IOPipeline,
    ModelPipeline,
    TrainerPipeline,
    apply_dryrun_settings,
)


def run_training(cfg: DictConfig, dryrun: bool = False) -> float:
    """Run the full pipeline (load -> build -> train -> evaluate).

    Returns the exact-match success rate on the test set.
    """
    if dryrun:
        apply_dryrun_settings(cfg)

    save_dir = cfg.train.get("save_dir", cfg.train.get("output_dir", "./results"))
    os.makedirs(save_dir, exist_ok=True)
    OmegaConf.save(cfg, os.path.join(save_dir, "train.yaml"))

    io_dict = IOPipeline.from_config(cfg.data).build()
    model = ModelPipeline.from_io_dict(cfg.model, io_dict).build()
    trainer_pipeline = TrainerPipeline.from_io_dict(cfg.train, model, io_dict).build()

    trainer_pipeline.train()
    trainer_pipeline.save_model()
    return trainer_pipeline.evaluate_and_save_generation()
`;
}

function dataYaml(cfg: BuildConfig, snake: string): string {
  const t = getTemplate(cfg.templateId);
  let pg: string;
  if (t.params.length === 0) {
    pg = "problem_generator: {}";
  } else {
    const entries = t.params
      .map((p) => `  ${p.key}: ${pyScalar(cfg.paramValues[p.key])}`)
      .join("\n");
    pg = `problem_generator:\n${entries}`;
  }
  return `# Dataset generation for the ${snake} task.
# 'problem_generator' values are forwarded as kwargs to the generator class.
${pg}

dataset:
  save_dir: "../data"
  num_train_samples: ${cfg.numTrain}
  num_test_samples: ${cfg.numTest}
  batch_size: 1000
  n_jobs: 4
  root_seed: 42
  verbose: true
  backend: "${t.backend}"
  save_text: true
  save_json: false
`;
}

function lexerYaml(cfg: BuildConfig): string {
  // Use the user's edits when present, otherwise the template's default suggestion.
  const lx = cfg.lexerOverride ?? defaultLexerConfig(cfg.templateId, cfg.paramValues);
  const numbersLine = `    numbers: ["", ${lx.numbersMin}, ${lx.numbersMax}]`;
  return `# Tokenizer vocabulary. Every symbol that can appear in an input OR output
# string must be covered here, otherwise it becomes an [UNK] token.
vocab:
  range:
${numbersLine}
  misc: ${yamlFlowList(lx.misc)}
  special_tokens: {}
  flags:
    include_base_vocab: true
    include_base_special_tokens: true

number_policy:
  attach_sign: ${lx.attachSign}
  digit_group: ${lx.digitGroup}
  allow_float: ${lx.allowFloat}

strict: ${lx.strict}
include_base_vocab: true
`;
}

function trainYaml(cfg: BuildConfig, snake: string): string {
  const t = getTemplate(cfg.templateId);
  const m = MODEL_PRESETS[cfg.modelPreset];
  return `# Model + training configuration for the ${snake} toy experiment.
model:
  model_type: ${cfg.modelType}
  num_encoder_layers: ${m.layers}
  num_encoder_heads: ${m.heads}
  num_decoder_layers: ${m.layers}
  num_decoder_heads: ${m.heads}
  d_model: ${m.d}
  encoder_ffn_dim: ${m.ffn}
  decoder_ffn_dim: ${m.ffn}
  max_sequence_length: ${t.maxSeqLen}
  use_positional_embedding: ${cfg.posEmbedding}

train:
  save_dir: ../outputs/results
  num_train_epochs: ${cfg.epochs}
  learning_rate: 0.0005
  weight_decay: 0.01
  warmup_ratio: 0.1
  batch_size: 64
  test_batch_size: 64
  lr_scheduler_type: cosine
  max_grad_norm: 1.0
  optimizer: adamw_torch
  num_workers: 2
  seed: 42
  wandb:
    project: calt-experiments
    group: ${snake}
    name: toy
    no_wandb: ${cfg.useWandb ? "false" : "true"}

data:
  train_dataset_path: ../data/train_raw.txt
  test_dataset_path: ../data/test_raw.txt
  lexer_config: ../configs/lexer.yaml
  validate_train_tokens: false
  validate_test_tokens: false
`;
}

function generateScript(snake: string, className: string): string {
  return `"""Generate the dataset for the ${snake} toy experiment."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

import click
from omegaconf import OmegaConf

from calt.dataset import DatasetPipeline

from ${snake}.core.generator import ${className}
from ${snake}.core.metrics import instance_stats
from shared.paths import config_dir
from shared.seed import set_seed


@click.command()
@click.option(
    "--config_path",
    type=click.Path(exists=True),
    default=None,
    help="Path to data config YAML (defaults to ../configs/data.yaml).",
)
def main(config_path: str | None) -> None:
    cfg_path = Path(config_path) if config_path else config_dir(__file__) / "data.yaml"
    cfg = OmegaConf.load(cfg_path)
    set_seed(cfg.dataset.root_seed)

    gen_cfg = OmegaConf.to_container(cfg.problem_generator, resolve=True) or {}
    problem_generator = ${className}(**gen_cfg)

    pipeline = DatasetPipeline.from_config(
        cfg.dataset,
        instance_generator=problem_generator,
        statistics_calculator=instance_stats,
    )
    pipeline.run()
    print("Dataset generation completed")


if __name__ == "__main__":
    main()
`;
}

function trainScript(snake: string): string {
  return `"""Train the model for the ${snake} toy experiment."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

import click

from ${snake}.core.train import run_training
from shared.config import load_config
from shared.paths import config_dir
from shared.seed import set_seed


@click.command()
@click.option("--dryrun", is_flag=True, help="Quick smoke test: a few epochs on a tiny subset.")
def main(dryrun: bool) -> None:
    cfg = load_config(config_dir(__file__) / "train.yaml")
    set_seed(cfg.train.seed)
    success = run_training(cfg, dryrun=dryrun)
    print(f"Success rate: {100 * success:.1f}%")


if __name__ == "__main__":
    main()
`;
}

function evaluateScript(snake: string): string {
  return `"""Print evaluation results for the ${snake} toy experiment."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

from shared.paths import output_dir
from shared.plotting import load_eval_results, show_examples

if __name__ == "__main__":
    results = output_dir(__file__) / "results"
    generated, references = load_eval_results(results)

    correct = sum(g == r for g, r in zip(generated, references))
    rate = correct / len(references) if references else 0.0
    print(f"Success rate: {100 * rate:.1f}%  ({correct}/{len(references)})")
    print()
    show_examples(generated, references, n=5, successes=True)
    show_examples(generated, references, n=5, successes=False)
`;
}

function runSh(): string {
  return `#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Step 1/3: Generate data ==="
python generate.py

echo "=== Step 2/3: Train ==="
python train.py "$@"

echo "=== Step 3/3: Evaluate ==="
python evaluate.py
`;
}

function readmeMd(cfg: BuildConfig, snake: string): string {
  const t = getTemplate(cfg.templateId);
  const deps = t.extraDeps && t.extraDeps.length
    ? `\n> **Extra dependency**: this task needs \`${t.extraDeps.join("`, `")}\` (\`pip install ${t.extraDeps.join(" ")}\`).\n`
    : "";
  const sageNote = t.requiresSage
    ? `\n> **Note**: this task computes its answers with SageMath, so it must run inside a SageMath-enabled environment.\n`
    : "";
  return `# ${cfg.taskName}

**Task**: ${cfg.description || t.description}

## Data format

\`\`\`
Input  : ${t.exampleInput}
Output : ${t.exampleOutput}
\`\`\`

One example per line is stored as \`input # output\`.
${deps}${sageNote}
## Quick start

1. Copy this whole \`${snake}/\` folder into the root of your CALT codebase
   (next to \`parity/\`, \`groebner_basis/\`, \`shared/\` …).
2. Activate the environment that has \`calt-x\` installed.
3. Run the 3-step workflow:

\`\`\`bash
cd ${snake}/experiments/toy/scripts
python generate.py    # 1. build the dataset  -> ../data/
python train.py       # 2. train the model    -> ../outputs/results/
python evaluate.py    # 3. report the success rate
\`\`\`

Or all at once:

\`\`\`bash
bash run.sh           # add --dryrun for a quick smoke test
\`\`\`

## Files

| File | What it does |
|---|---|
| \`core/generator.py\` | Produces \`(problem, answer)\` pairs from a seed. |
| \`core/formatter.py\` | How objects become strings. |
| \`core/metrics.py\` | Per-sample statistics + exact-match success rate. |
| \`core/train.py\` | Drives the CALT training pipeline. |
| \`experiments/toy/configs/\` | \`data.yaml\`, \`lexer.yaml\`, \`train.yaml\`. |
| \`experiments/toy/scripts/\` | \`generate.py\`, \`train.py\`, \`evaluate.py\`, \`run.sh\`. |

---

*Scaffolded with the CALT Task Builder.*
`;
}

// ---------------------------------------------------------------------------
// Assemble all files
// ---------------------------------------------------------------------------

/** The template-generated generator.py, ignoring any manual edits. Used to seed the editor. */
export function freshGeneratorCode(cfg: BuildConfig): string {
  const className = toGeneratorClassName(cfg.taskName);
  return generatorPy({ ...cfg, customGeneratorCode: null }, className);
}

export function buildFiles(cfg: BuildConfig): FileSpec[] {
  const snake = toSnakeCase(cfg.taskName) || "my_task";
  const className = toGeneratorClassName(cfg.taskName);
  const base = snake;

  return [
    { path: `${base}/README.md`, content: readmeMd(cfg, snake), language: "markdown", label: "README.md" },
    { path: `${base}/core/__init__.py`, content: initPy(className), language: "python", label: "core/__init__.py" },
    { path: `${base}/core/generator.py`, content: generatorPy(cfg, className), language: "python", label: "generator.py" },
    { path: `${base}/core/formatter.py`, content: formatterPy(cfg), language: "python", label: "formatter.py" },
    { path: `${base}/core/parser.py`, content: parserPy(), language: "python", label: "parser.py" },
    { path: `${base}/core/metrics.py`, content: metricsPy(cfg), language: "python", label: "metrics.py" },
    { path: `${base}/core/train.py`, content: trainPy(cfg), language: "python", label: "train.py (core)" },
    { path: `${base}/experiments/toy/configs/data.yaml`, content: dataYaml(cfg, snake), language: "yaml", label: "data.yaml" },
    { path: `${base}/experiments/toy/configs/lexer.yaml`, content: lexerYaml(cfg), language: "yaml", label: "lexer.yaml" },
    { path: `${base}/experiments/toy/configs/train.yaml`, content: trainYaml(cfg, snake), language: "yaml", label: "train.yaml" },
    { path: `${base}/experiments/toy/scripts/generate.py`, content: generateScript(snake, className), language: "python", label: "generate.py" },
    { path: `${base}/experiments/toy/scripts/train.py`, content: trainScript(snake), language: "python", label: "train.py" },
    { path: `${base}/experiments/toy/scripts/evaluate.py`, content: evaluateScript(snake), language: "python", label: "evaluate.py" },
    { path: `${base}/experiments/toy/scripts/run.sh`, content: runSh(), language: "bash", label: "run.sh" },
  ];
}
