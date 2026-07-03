# eigvec_3x3

**Task**: Dominant eigenvector of a 3x3 symmetric matrix (real-valued, finite precision).

*Adapted from the official [calt-codebase](https://github.com/HiroshiKERA/calt-codebase) examples.*

## Data format

```
Input  : 2.10,0.30,-0.50;0.30,1.40,0.20;-0.50,0.20,3.10
Output : -0.20,0.10,0.97
```

## Quick start

```bash
cd eigvec_3x3/experiments/toy/scripts
python generate.py    # 1. build the dataset  -> ../data/
python train.py       # 2. train the model    -> ../outputs/results/
python evaluate.py    # 3. report the success rate
```

Or `bash run.sh` (add `--dryrun` for a quick smoke test).
