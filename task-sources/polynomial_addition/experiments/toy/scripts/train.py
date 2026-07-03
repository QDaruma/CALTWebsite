"""Train the polynomial_addition model for the toy experiment."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

import click
from omegaconf import OmegaConf

from polynomial_addition.core.train import run_training
from shared.paths import config_dir
from shared.seed import set_seed


@click.command()
@click.option("--config_path", type=click.Path(exists=True), default=None)
@click.option("--dryrun", is_flag=True, help="Reduced settings for a fast smoke test.")
def main(config_path: str | None, dryrun: bool) -> None:
    cfg_path = Path(config_path) if config_path else config_dir(__file__) / "train.yaml"
    cfg = OmegaConf.load(cfg_path)
    set_seed(cfg.train.seed)
    success = run_training(cfg, dryrun=dryrun)
    print(f"Success rate: {100 * success:.1f}%")


if __name__ == "__main__":
    main()
