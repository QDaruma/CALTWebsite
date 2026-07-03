# polynomial_addition

**Task**: Running sums of random multivariate polynomials (uses SageMath to generate).

*Adapted from the official [calt-codebase](https://github.com/HiroshiKERA/calt-codebase) examples.*

## Data format

```
Input  : x + 2*y | y^2 | x*z
Output : x + 2*y | x + 2*y + y^2 | x + 2*y + y^2 + x*z
```

> **Needs SageMath** (used only when generating the dataset).

## Quick start

```bash
cd polynomial_addition/experiments/toy/scripts
python generate.py    # 1. build the dataset  -> ../data/
python train.py       # 2. train the model    -> ../outputs/results/
python evaluate.py    # 3. report the success rate
```

Or `bash run.sh` (add `--dryrun` for a quick smoke test).
