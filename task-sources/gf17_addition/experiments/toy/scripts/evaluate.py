"""Print evaluation results for the gf17_addition toy experiment."""

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
    print()
    show_examples(generated, references, n=5, successes=False)
