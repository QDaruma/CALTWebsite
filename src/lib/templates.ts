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
  /** 0 = whole number as one token; N = group digits in chunks of N. */
  digitGroup: number;
  attachSign: boolean;
  /** Allow decimal points (real-valued tasks like PCA). */
  allowFloat?: boolean;
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
    beginnerSummary: "Define your own problem-and-answer rule from scratch.",
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

  {
    id: "gcd",
    name: "Greatest common divisor",
    icon: "Divide",
    tagline: "a b  →  gcd(a, b)",
    beginnerSummary: "Given two whole numbers, find the largest number that divides both.",
    description:
      "A simple arithmetic warm-up: the model reads two integers and outputs their greatest common divisor.",
    exampleInput: "48 36",
    exampleOutput: "12",
    backend: "sympy",
    params: [],
    generatorBody: (_v, cls) => `import math
import random


class ${cls}:
    """Greatest common divisor of two integers.

    INPUT  : two integers "a b" (each from low..high)
    OUTPUT : their gcd, e.g. "48 36" -> "12"
    Assumptions live in __init__ defaults below; edit them to change the ranges.
    """

    def __init__(self, low: int = 1, high: int = 100):
        self.low = low
        self.high = high

    def __call__(self, seed: int) -> tuple[str, str]:
        random.seed(seed)
        a = random.randint(self.low, self.high)
        b = random.randint(self.low, self.high)
        return f"{a} {b}", str(math.gcd(a, b))
`,
    formatterBody: (_v, i, o) => genericFormatter(i, o),
    lexer: () => ({ numbers: ["", 0, 1000], misc: [], digitGroup: 1, attachSign: false, strict: false }),
    maxSeqLen: 64,
  },

  {
    id: "integer_factorization",
    name: "Integer factorization",
    icon: "Binary",
    tagline: "60  →  2^2 * 3 * 5",
    beginnerSummary: "Break a number down into the prime numbers that multiply to make it.",
    description:
      "An arithmetic task: the model reads an integer and outputs its prime factorization. Uses pure-Python trial division, so no extra packages are needed.",
    exampleInput: "60",
    exampleOutput: "2^2 * 3 * 5",
    backend: "sympy",
    params: [],
    generatorBody: (_v, cls) => `import random


class ${cls}:
    """Prime factorization of an integer.

    INPUT  : one integer n (from low..high)
    OUTPUT : its prime factorization "p^a * q^b ...", e.g. "60" -> "2^2 * 3 * 5"
    Assumptions live in __init__ defaults below; edit them to change the ranges.
    """

    def __init__(self, low: int = 2, high: int = 1000):
        self.low = low
        self.high = high

    def __call__(self, seed: int) -> tuple[str, str]:
        random.seed(seed)
        n = random.randint(self.low, self.high)
        parts = []
        for p, a in self._factorize(n):
            parts.append(f"{p}^{a}" if a > 1 else f"{p}")
        return str(n), " * ".join(parts)

    @staticmethod
    def _factorize(n: int) -> list[tuple[int, int]]:
        factors, d = [], 2
        while d * d <= n:
            if n % d == 0:
                a = 0
                while n % d == 0:
                    n //= d
                    a += 1
                factors.append((d, a))
            d += 1
        if n > 1:
            factors.append((n, 1))
        return factors
`,
    formatterBody: (_v, i, o) => genericFormatter(i, o),
    lexer: () => ({ numbers: ["", 0, 10000], misc: ["*", "^"], digitGroup: 1, attachSign: false, strict: false }),
    maxSeqLen: 96,
  },

  {
    id: "pca",
    name: "Principal component",
    icon: "ScatterChart",
    tagline: "points  →  top component",
    beginnerSummary: "From a small cloud of 2-D points, find the main direction they spread along.",
    description:
      "A matrix / linear-algebra task on real-valued, finite-precision data: the model reads a set of 2-D points and outputs the unit vector of their first principal component (rounded).",
    exampleInput: "1.2 0.5 | -0.3 2.1 | 0.8 -1.4",
    exampleOutput: "0.71 0.70",
    backend: "sympy",
    requiresSage: false,
    extraDeps: ["numpy"],
    params: [],
    generatorBody: (_v, cls) => `import random

import numpy as np


class ${cls}:
    """First principal component of a small 2-D point cloud.

    INPUT  : k 2-D points "x y | x y | ...", finite precision
    OUTPUT : the unit vector of the top principal component, rounded,
             e.g. "1.2 0.5 | -0.3 2.1 | 0.8 -1.4" -> "0.71 0.70"
    Assumptions live in __init__ defaults below; edit them to change the data.
    """

    def __init__(self, n_points: int = 6, scale: float = 5.0, decimals: int = 2):
        self.n_points = n_points
        self.scale = scale
        self.decimals = decimals

    def __call__(self, seed: int) -> tuple[str, str]:
        np.random.seed(seed)
        pts = np.round(
            np.random.uniform(-self.scale, self.scale, size=(self.n_points, 2)), self.decimals
        )
        problem = " | ".join(f"{x} {y}" for x, y in pts)
        centered = pts - pts.mean(axis=0)
        cov = centered.T @ centered
        _, vecs = np.linalg.eigh(cov)
        pc = vecs[:, -1]
        if pc[0] < 0:  # canonical sign so the target is unique
            pc = -pc
        answer = " ".join(f"{c:.{self.decimals}f}" for c in pc)
        return problem, answer
`,
    formatterBody: (_v, i, o) => genericFormatter(i, o),
    lexer: () => ({
      numbers: ["", -99, 99],
      misc: [".", "|", "-"],
      digitGroup: 2,
      attachSign: true,
      allowFloat: true,
      strict: false,
    }),
    maxSeqLen: 160,
  },
];

export function getTemplate(id: string): Template {
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown template: ${id}`);
  return t;
}
