// Generator template for the custom ("build your own") task. It emits a complete
// core/generator.py + core/formatter.py, suggests a tokenizer vocabulary, and a
// max sequence length. The builder only ever uses the "custom" template; the user
// writes the generator body (or has an AI write it) on the next step.
//
// The Python it emits follows the real parity/groebner pattern: a class with
// __init__(**params) and __call__(seed) -> (problem, answer), both plain strings.

export type ParamType = "number" | "select" | "text";

export interface ParamDef {
  key: string;
  label: string;
  type: ParamType;
  default: number | string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  help?: string;
}

export interface LexerSuggestion {
  numbers: [string, number, number];
  signed?: [string, number, number];
  misc: string[];
  digitGroup: 0 | 1;
  attachSign: boolean;
  strict: boolean;
}

export type ParamValues = Record<string, number | string>;

export interface Template {
  id: string;
  name: string;
  /** lucide-react icon name */
  icon: string;
  tagline: string;
  /** One plain-English line for non-technical users (no jargon). */
  beginnerSummary: string;
  description: string;
  exampleInput: string;
  exampleOutput: string;
  backend: "sympy" | "sagemath";
  requiresSage?: boolean;
  /** Extra Python packages a user must have, beyond calt-x itself. */
  extraDeps?: string[];
  params: ParamDef[];
  generatorBody: (vals: ParamValues, className: string) => string;
  formatterBody: (vals: ParamValues, exampleInput: string, exampleOutput: string) => string;
  lexer: (vals: ParamValues) => LexerSuggestion;
  maxSeqLen: number;
}

function genericFormatter(exampleInput: string, exampleOutput: string): string {
  return `"""
String format for this task.

Input  : ${exampleInput}
Output : ${exampleOutput}

The generator already returns ready-to-write strings, so these helpers simply
mirror that format. They are handy for unit tests or quick REPL checks.
"""


def format_input(problem) -> str:
    """Return the input string exactly as the model will see it."""
    return str(problem)


def format_target(answer) -> str:
    """Return the target string exactly as the model must produce it."""
    return str(answer)
`;
}

export const TEMPLATES: Template[] = [
  {
    id: "custom",
    name: "Start from scratch",
    icon: "Pencil",
    tagline: "write your own rule",
    beginnerSummary: "Define your own question-and-answer rule from scratch.",
    description:
      "A blank, working skeleton you fill in. Best if your task does not match the presets: you write the generator logic in the editor on the next step.",
    exampleInput: "1 2 3",
    exampleOutput: "6",
    backend: "sympy",
    params: [],
    generatorBody: (_v, cls) => `import random


class ${cls}:
    """TODO: describe your task in one line.

    The generator must be deterministic: the same seed always yields the same
    (problem, answer) pair. Both 'problem' and 'answer' are strings.
    """

    def __init__(self):
        # TODO: store any parameters your task needs (and expose them in data.yaml).
        pass

    def __call__(self, seed: int) -> tuple[str, str]:
        random.seed(seed)
        # TODO: build your problem (the model's input).
        problem = "1 2 3"
        # TODO: compute the answer (the model's target) from the problem.
        answer = "6"
        return problem, answer
`,
    formatterBody: (_v, i, o) => genericFormatter(i, o),
    lexer: () => ({
      numbers: ["", -100, 100],
      misc: ["+", "-", "*", "^", "|", "x", "y"],
      digitGroup: 1,
      attachSign: false,
      strict: false,
    }),
    maxSeqLen: 128,
  },
];

export function getTemplate(id: string): Template {
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown template: ${id}`);
  return t;
}
