"""Generate (problem, answer) pairs for the polynomial running-sum task.

Adapted from HiroshiKERA/calt-codebase examples/polynomial_addition.
Input  : several random polynomials in x, y, z, joined by " | "
Output : their running (cumulative) sums, joined by " | "
SageMath is used at generation time only; the dataset itself is plain text.
"""

import random


class PolynomialAdditionGenerator:
    def __init__(self, field: str = "ZZ", min_len: int = 3, max_len: int = 6,
                 max_num_terms: int = 3, max_degree: int = 3, min_degree: int = 1):
        self.field = field
        self.min_len = min_len
        self.max_len = max_len
        self.max_num_terms = max_num_terms
        self.max_degree = max_degree
        self.min_degree = min_degree

    def __call__(self, seed: int) -> tuple[str, str]:
        import sage.misc.randstate as randstate
        from calt.dataset.sagemath.utils.polynomial_sampler import PolynomialSampler

        random.seed(seed)
        randstate.set_random_seed(seed)
        length = random.randint(self.min_len, self.max_len)
        sampler = PolynomialSampler(
            symbols="x, y, z",
            field_str=self.field,
            order="grevlex",
            max_num_terms=self.max_num_terms,
            max_degree=self.max_degree,
            min_degree=self.min_degree,
        )
        polys = sampler.sample(length)
        cumsum = [sum(polys[:i]) for i in range(1, len(polys) + 1)]
        inp = " | ".join(str(p) for p in polys)
        out = " | ".join(str(p) for p in cumsum)
        return inp, out
