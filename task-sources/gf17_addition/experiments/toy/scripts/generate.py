"""Generate the gf17_addition dataset for the toy experiment."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

import click
from omegaconf import OmegaConf

from calt.dataset import DatasetPipeline

from gf17_addition.core.generator import Gf17AdditionGenerator
from shared.paths import config_dir
from shared.seed import set_seed


@click.command()
@click.option("--config_path", type=click.Path(exists=True), default=None)
def main(config_path: str | None) -> None:
    cfg_path = Path(config_path) if config_path else config_dir(__file__) / "data.yaml"
    cfg = OmegaConf.load(cfg_path)
    set_seed(cfg.dataset.root_seed)

    gen_cfg = OmegaConf.to_container(cfg.problem_generator, resolve=True) or {}
    problem_generator = Gf17AdditionGenerator(**gen_cfg)

    pipeline = DatasetPipeline.from_config(cfg.dataset, instance_generator=problem_generator)
    pipeline.run()
    print("Dataset generation completed")


if __name__ == "__main__":
    main()
