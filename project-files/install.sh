#!/usr/bin/env bash
# One-step setup for this CALT project.
# Creates a local virtual environment (.venv) and installs the dependencies.
# For the polynomial tasks (groebner_basis, border_basis) it can also help set
# up SageMath through conda.
set -e

cd "$(dirname "$0")"

# 1. Find a usable Python. calt-x needs 3.10, 3.11, or 3.12.
PY=python3
command -v "$PY" >/dev/null 2>&1 || PY=python
if ! command -v "$PY" >/dev/null 2>&1; then
  echo "ERROR: Python was not found."
  echo "       Install Python 3.10, 3.11, or 3.12 first: https://www.python.org/downloads/"
  exit 1
fi

PYVER=$("$PY" -c 'import sys; print("%d.%d" % sys.version_info[:2])')
if ! "$PY" -c 'import sys; raise SystemExit(0 if (3, 10) <= sys.version_info[:2] < (3, 13) else 1)'; then
  echo "ERROR: CALT needs Python 3.10, 3.11, or 3.12, but found $PYVER."
  echo "       Install a supported version and run this script again."
  exit 1
fi
echo "==> Using Python $PYVER"

# 2. Create the virtual environment and install the pip dependencies.
echo "==> Creating a virtual environment in .venv"
"$PY" -m venv .venv

# shellcheck disable=SC1091
source .venv/bin/activate

echo "==> Upgrading pip"
python -m pip install --upgrade pip

echo "==> Installing dependencies from requirements.txt"
pip install -r requirements.txt

echo ""
echo "All set. The 'parity' task is ready to run."
echo "Next time, activate the environment with:  source .venv/bin/activate"

# 3. SageMath is only needed for the polynomial tasks (groebner_basis, border_basis).
echo ""
if command -v sage >/dev/null 2>&1; then
  echo "==> SageMath detected. The polynomial tasks (groebner_basis, border_basis) will work."
else
  echo "Note: the polynomial tasks (groebner_basis, border_basis) need SageMath."
  echo "      pip cannot install it; the easiest way is a conda environment."
  if command -v conda >/dev/null 2>&1; then
    printf "      Create a conda env 'calt' with SageMath now? It is a large download. [y/N] "
    read -r reply
    case "$reply" in
      [Yy]*)
        echo "==> Creating conda env 'calt' with SageMath (this can take a while)..."
        conda create -y -n calt -c conda-forge sage "python=3.11"
        echo "==> Installing requirements into the 'calt' env"
        conda run -n calt pip install -r requirements.txt
        echo ""
        echo "Done. For the polynomial tasks, use that env:  conda activate calt"
        ;;
      *)
        echo "      Skipped. When you are ready, run:"
        echo "          conda create -n calt -c conda-forge sage python=3.11"
        echo "          conda activate calt"
        echo "          pip install -r requirements.txt"
        ;;
    esac
  else
    echo "      Install conda first (Miniforge: https://github.com/conda-forge/miniforge), then:"
    echo "          conda create -n calt -c conda-forge sage python=3.11"
    echo "          conda activate calt"
    echo "          pip install -r requirements.txt"
  fi
fi
