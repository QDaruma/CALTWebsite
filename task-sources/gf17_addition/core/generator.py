"""Generate (problem, answer) pairs for the GF(17) running-sum task.

Adapted from HiroshiKERA/calt-codebase examples/gf17_addition.
Input  : a list of integers in GF(17), comma-separated
Output : their running (cumulative) sums mod 17  (e.g. "5,9,3,4" -> "5,14,0,4")
"""

import random


class Gf17AdditionGenerator:
    def __init__(self, p: int = 17, min_len: int = 3, max_len: int = 6):
        self.p = p
        self.min_len = min_len
        self.max_len = max_len

    def __call__(self, seed: int) -> tuple[str, str]:
        random.seed(seed)
        length = random.randint(self.min_len, self.max_len)
        numbers = [random.randint(0, self.p - 1) for _ in range(length)]
        cumulative, s = [], 0
        for n in numbers:
            s = (s + n) % self.p
            cumulative.append(s)
        return ",".join(map(str, numbers)), ",".join(map(str, cumulative))
