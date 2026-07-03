# gf17_addition

**Task**: Running sums of a list of numbers, modulo 17 (finite-field arithmetic).

*Adapted from the official [calt-codebase](https://github.com/HiroshiKERA/calt-codebase) examples.*

## Data format

```
Input  : 5,9,3,4
Output : 5,14,0,4
```

## Quick start

```bash
cd gf17_addition/experiments/toy/scripts
python generate.py    # 1. build the dataset  -> ../data/
python train.py       # 2. train the model    -> ../outputs/results/
python evaluate.py    # 3. report the success rate
```

Or `bash run.sh` (add `--dryrun` for a quick smoke test).
