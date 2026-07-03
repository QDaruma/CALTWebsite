# integer_factorization

**Task**: Recover the prime factors whose product is a given integer.

*Adapted from the official [calt-codebase](https://github.com/HiroshiKERA/calt-codebase) examples.*

## Data format

```
Input  : 2310
Output : 2 | 3 | 5 | 7 | 11
```

## Quick start

```bash
cd integer_factorization/experiments/toy/scripts
python generate.py    # 1. build the dataset  -> ../data/
python train.py       # 2. train the model    -> ../outputs/results/
python evaluate.py    # 3. report the success rate
```

Or `bash run.sh` (add `--dryrun` for a quick smoke test).
