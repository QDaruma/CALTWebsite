"""String format for the polynomial_addition task.

Input  : x + 2*y | y^2 | x*z
Output : x + 2*y | x + 2*y + y^2 | x + 2*y + y^2 + x*z

The generator already returns ready-to-write strings; these helpers mirror that.
"""


def format_input(problem) -> str:
    return str(problem)


def format_target(answer) -> str:
    return str(answer)
