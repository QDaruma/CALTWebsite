"""Metrics for the polynomial_addition task."""


def success_rate(predictions: list[str], targets: list[str]) -> float:
    """Fraction of predictions that exactly match the target (after .strip())."""
    if not targets:
        return 0.0
    correct = sum(1 for p, t in zip(predictions, targets) if p.strip() == t.strip())
    return correct / len(targets)
