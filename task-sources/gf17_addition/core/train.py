"""Training runner for the gf17_addition task.

Plain-text storage means CALT's default text loader handles parsing, so no
custom load_preprocessor is needed (same simple pipeline as the parity task).
"""

import os

from omegaconf import DictConfig, OmegaConf

from shared.calt_adapter import (
    IOPipeline,
    ModelPipeline,
    TrainerPipeline,
    apply_dryrun_settings,
)


def run_training(cfg: DictConfig, dryrun: bool = False) -> float:
    """Run the full pipeline (load -> build -> train -> evaluate)."""
    if dryrun:
        apply_dryrun_settings(cfg)

    save_dir = cfg.train.get("save_dir", cfg.train.get("output_dir", "./results"))
    os.makedirs(save_dir, exist_ok=True)
    OmegaConf.save(cfg, os.path.join(save_dir, "train.yaml"))

    io_dict = IOPipeline.from_config(cfg.data).build()
    model = ModelPipeline.from_io_dict(cfg.model, io_dict).build()
    trainer_pipeline = TrainerPipeline.from_io_dict(cfg.train, model, io_dict).build()

    trainer_pipeline.train()
    trainer_pipeline.save_model()
    return trainer_pipeline.evaluate_and_save_generation()
