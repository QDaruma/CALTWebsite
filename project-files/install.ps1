# One-step setup for this CALT project (Windows PowerShell).
# Creates a local virtual environment (.venv) and installs the dependencies.
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

# 1. Find a usable Python. calt-x needs 3.10, 3.11, or 3.12.
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: Python was not found."
  Write-Host "       Install Python 3.10, 3.11, or 3.12 first: https://www.python.org/downloads/"
  exit 1
}

$pyver = (python -c "import sys; print('%d.%d' % sys.version_info[:2])")
$ok = (python -c "import sys; print(1 if (3, 10) <= sys.version_info[:2] < (3, 13) else 0)")
if ($ok -ne "1") {
  Write-Host "ERROR: CALT needs Python 3.10, 3.11, or 3.12, but found $pyver."
  Write-Host "       Install a supported version and run this script again."
  exit 1
}
Write-Host "==> Using Python $pyver"

# 2. Create the virtual environment and install the pip dependencies.
Write-Host "==> Creating a virtual environment in .venv"
python -m venv .venv

Write-Host "==> Activating the environment"
& .\.venv\Scripts\Activate.ps1

Write-Host "==> Upgrading pip"
python -m pip install --upgrade pip

Write-Host "==> Installing dependencies from requirements.txt"
pip install -r requirements.txt

Write-Host ""
Write-Host "All set. The 'parity' task is ready to run."
Write-Host "Next time, activate the environment with:  .\.venv\Scripts\Activate.ps1"

# 3. SageMath is only needed for the polynomial tasks (groebner_basis, border_basis).
Write-Host ""
if (Get-Command sage -ErrorAction SilentlyContinue) {
  Write-Host "==> SageMath detected. The polynomial tasks (groebner_basis, border_basis) will work."
} else {
  Write-Host "Note: the polynomial tasks (groebner_basis, border_basis) need SageMath."
  Write-Host "      SageMath does not run natively on Windows and pip cannot install it."
  Write-Host "      Use WSL (Windows Subsystem for Linux) with conda:"
  Write-Host "          wsl --install                 # once, then reopen in Ubuntu"
  Write-Host "          conda create -n calt -c conda-forge sage python=3.11"
  Write-Host "          conda activate calt"
  Write-Host "          pip install -r requirements.txt"
  Write-Host ""
  Write-Host "      The 'parity' task works on Windows without any of this."
}
