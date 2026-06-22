import { toGeneratorClassName } from "./utils";

/**
 * Build a ready-to-send prompt that a non-coder can paste into any AI assistant
 * (ChatGPT, Claude, Gemini…) to get a generator class that fits CALT exactly.
 *
 * The prompt encodes the full contract the generated code must satisfy, so the
 * AI's output can be pasted straight into the "Write code" editor and will run.
 */
export function buildAiPrompt(taskName: string, description: string): string {
  const className = toGeneratorClassName(taskName || "my_task");
  const desc = description.trim() || "(describe the task here: what is the problem, and what is the correct answer?)";

  return `I'm using a machine-learning tool called CALT. It trains a model to read a
problem (as text) and produce the correct answer (as text). I need you to write
the small Python class that creates the training examples.

THE TASK I WANT, in my own words:
"""
${desc}
"""

FIRST, before writing code, decide and state these explicitly (as a short comment
block at the top of the file), because the model can only learn what the examples
show:
  - INPUT  : what the problem string contains, and its assumptions
             (e.g. "two integers, each from 1 to 100, separated by a space").
  - OUTPUT : what the answer string is (e.g. "their greatest common divisor").
  - one concrete example pair, e.g.  "48 36"  ->  "12".
Keep these assumptions (ranges, counts, allowed operations) as __init__ arguments
with default values, so they are easy to change later, and they map directly to the
task's data.yaml config (the values under "problem_generator" are passed to
__init__).

Write ONE Python class named "${className}" that follows these rules EXACTLY:

1. __init__(self, ...): store the assumptions above as arguments that ALL have
   default values (e.g. low=1, high=100), so the class works with no arguments
   AND the ranges can be tuned from data.yaml.
2. __call__(self, seed: int) -> tuple[str, str]: return a (problem, answer) pair.
3. It MUST be deterministic. Call random.seed(seed) at the very start of __call__
   (and seed any other random source you use), so the same seed always returns
   the same pair.
4. "problem" and "answer" must both be plain strings:
   - separate numbers or items with single spaces, e.g. "3 7 11";
   - if one side is a list, join the items with " | ";
   - use only simple characters: digits, spaces, and + - * / ^ | ( ) . x y
     (avoid commas, quotes, brackets like [] {}, and unusual symbols).
5. Use only the Python standard library (random, math, itertools). If you truly
   need symbolic math you may "import sympy", but no other third-party packages.
6. Do not print, read files, or use the network. No global variables.

Output ONLY the Python code (imports, any helper functions, and the class),
with NO explanation and NO markdown code fences. I will paste it directly into a
file called generator.py.

Fill in this skeleton:

import random

# INPUT  : <describe the problem + assumptions, e.g. two integers 1..100>
# OUTPUT : <describe the answer, e.g. their GCD>
# EXAMPLE: "48 36" -> "12"


class ${className}:
    def __init__(self, low: int = 1, high: int = 100):
        # assumptions as tunable settings (these can be overridden from data.yaml)
        self.low = low
        self.high = high

    def __call__(self, seed: int) -> tuple[str, str]:
        random.seed(seed)
        # build the problem and compute its correct answer
        problem = ...
        answer = ...
        return problem, answer
`;
}

/**
 * Build a ready-to-send prompt for writing a custom measurement (a per-example
 * statistic). The output is meant to be pasted into the measurement "Write code"
 * editor, which injects the lines into the instance_stats(problem, answer) body.
 */
export function buildMeasureAiPrompt(description: string): string {
  const desc =
    description.trim() ||
    "(describe what you want to measure about each problem or answer)";

  return `I'm using a machine-learning tool called CALT. For every training example it
keeps a "problem" and an "answer", both plain strings. I want to measure
something about them so I can see statistics across my dataset.

WHAT I WANT TO MEASURE, in my own words:
"""
${desc}
"""

Write the Python that records my measurement(s). Follow these rules EXACTLY:

1. Your lines run INSIDE this function (you do not write the function itself):
       def instance_stats(problem, answer) -> dict:
           stats = {}
           # <-- your lines go exactly here
           return stats
   "problem" is the problem string, "answer" is the answer string.
2. Record each measurement as: stats["short_name"] = <a number>
   Use a short snake_case name (letters, digits, underscores) in the quotes.
3. The value MUST be a number (int or float) computed from "problem" and/or
   "answer". Prefer a single expression per measurement.
4. These are ALREADY available. Do NOT import or redefine them:
   - re            (regular expressions)
   - math          (standard math module)
   - _ints(text)   returns the list of all integers found in a string
5. Output ONLY the lines that go inside the function (the stats[...] = ...
   assignments, plus a few helper lines above them only if truly needed).
   NO imports, NO "def", NO "return", NO markdown fences, NO explanation.
   I will paste your lines straight into the editor.

Example, for "how many numbers are in the answer":
stats["count_numbers_in_answer"] = len(_ints(answer))
`;
}
