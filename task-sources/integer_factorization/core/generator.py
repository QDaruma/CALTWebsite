"""Generate (problem, answer) pairs for the integer factorization task.

Adapted from HiroshiKERA/calt-codebase examples/integer_factorization.
Input  : the product of `n_primes` distinct primes (each <= max_number)
Output : those primes, sorted, joined by " | "  (e.g. "2310" -> "2 | 3 | 5 | 7 | 11")
"""

import math
import random


class IntegerFactorizationGenerator:
    def __init__(self, n_primes: int = 5, max_number: int = 30):
        self.n_primes = n_primes
        self.max_number = max_number
        self._primes = self._sieve(max_number)
        if len(self._primes) < n_primes:
            raise ValueError("max_number too small for n_primes distinct primes")

    def __call__(self, seed: int) -> tuple[str, str]:
        random.seed(seed)
        sampled = random.sample(self._primes, self.n_primes)
        product = math.prod(sampled)
        return str(product), " | ".join(str(p) for p in sorted(sampled))

    @staticmethod
    def _sieve(n: int) -> list[int]:
        flags = [True] * (n + 1)
        flags[0] = flags[1] = False
        for i in range(2, int(n**0.5) + 1):
            if flags[i]:
                for j in range(i * i, n + 1, i):
                    flags[j] = False
        return [i for i in range(2, n + 1) if flags[i]]
