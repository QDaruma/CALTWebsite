"""Generate (problem, answer) pairs for the 3x3 dominant-eigenvector task.

Adapted from HiroshiKERA/calt-codebase examples/eigvec_3x3.
Input  : a 3x3 symmetric PSD matrix (rows ';'-separated, entries ','-separated)
Output : the unit eigenvector of its largest eigenvalue, rounded.
Real-valued data with finite precision.
"""

import numpy as np


class Eigvec3x3Generator:
    def __init__(self, decimals: int = 2):
        self.decimals = decimals

    def __call__(self, seed: int) -> tuple[str, str]:
        rng = np.random.default_rng(seed)
        A = rng.normal(size=(3, 3))
        M = A.T @ A  # symmetric PSD -> real eigenvalues
        vals, vecs = np.linalg.eigh(M)
        v = vecs[:, int(np.argmax(vals))]
        norm = np.linalg.norm(v)
        if norm > 0:
            v = v / norm
        d = self.decimals
        m_str = ";".join(",".join(f"{x:.{d}f}" for x in row) for row in M.tolist())
        v_str = ",".join(f"{x:.{d}f}" for x in v.tolist())
        return m_str, v_str
