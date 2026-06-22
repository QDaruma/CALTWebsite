// Prebuilt per-sample statistics. Each one contributes a single line to the
// generated instance_stats(problem, answer) function. Statistics operate on the
// string forms of `problem` and `answer`, so they work for any template.

export interface StatDef {
  id: string;
  /** Technical label (Python key / developer-facing). */
  label: string;
  /** Plain-English label for non-technical users. */
  friendlyLabel: string;
  /** Technical one-liner. */
  description: string;
  /** Plain-English explanation for non-technical users. */
  friendlyDescription: string;
  /** The right-hand side of `stats["<id>"] = ...` in Python. */
  expr: string;
  /** Whether this stat relies on the _ints() helper. */
  needsInts?: boolean;
  /** Selected by default. */
  defaultOn?: boolean;
}

export const STATS: StatDef[] = [
  {
    id: "input_length",
    label: "input_length",
    friendlyLabel: "Problem length",
    description: "Number of space-separated tokens in the input.",
    friendlyDescription: "How many pieces each problem is made of.",
    expr: "len(str(problem).split())",
    defaultOn: true,
  },
  {
    id: "output_length",
    label: "output_length",
    friendlyLabel: "Answer length",
    description: "Number of space-separated tokens in the target.",
    friendlyDescription: "How many pieces each answer is made of.",
    expr: "len(str(answer).split())",
    defaultOn: true,
  },
  {
    id: "input_chars",
    label: "input_chars",
    friendlyLabel: "Problem size",
    description: "Total number of characters in the input string.",
    friendlyDescription: "How many characters long each problem is.",
    expr: "len(str(problem))",
  },
  {
    id: "output_chars",
    label: "output_chars",
    friendlyLabel: "Answer size",
    description: "Total number of characters in the target string.",
    friendlyDescription: "How many characters long each answer is.",
    expr: "len(str(answer))",
  },
  {
    id: "max_abs_value",
    label: "max_abs_value",
    friendlyLabel: "Biggest number",
    description: "Largest absolute integer appearing in the input (0 if none).",
    friendlyDescription: "The largest number that appears in each problem.",
    expr: "max((abs(v) for v in _ints(problem)), default=0)",
    needsInts: true,
  },
  {
    id: "num_elements",
    label: "num_elements",
    friendlyLabel: "Number of parts",
    description: "How many '|'-separated parts the input has (useful for list inputs).",
    friendlyDescription: "How many parts the problem is split into (by the “|” symbol).",
    expr: 'len(str(problem).split("|"))',
  },
];

export function getStat(id: string): StatDef {
  const s = STATS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown stat: ${id}`);
  return s;
}

export function defaultSelectedStats(): string[] {
  return STATS.filter((s) => s.defaultOn).map((s) => s.id);
}
