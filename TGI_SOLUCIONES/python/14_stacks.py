"""
EXERCISE 14 — Stacks
Topics: LIFO with list.append / list.pop, monotonic stack, parsing
Suggested time: 30 min

PROBLEMS
--------
A) eval_rpn(tokens) -> int
   Evaluate an expression in Reverse Polish Notation. Operators: + - * /.
   Division truncates toward zero (int(a / b)). Raise ValueError if the expression is
   invalid (not enough operands, or more than one value left at the end).
       ["2", "1", "+", "3", "*"] -> 9          ["4", "13", "5", "/", "+"] -> 6
       ["-7", "2", "/"] -> -3

B) daily_temperatures(temps) -> list[int]
   For each day, how many days you have to wait for a warmer temperature (0 if never).
       [73, 74, 75, 71, 69, 72, 76, 73] -> [1, 1, 4, 2, 1, 1, 0, 0]
   Target: O(n) with a monotonic stack of indexes (the tests include a large input).

C) simplify_path(path) -> str
   Simplify an absolute Unix path: "." is the current folder, ".." goes up one level
   (staying at root if already there), multiple slashes count as one, and the result has
   no trailing slash.
       "/home//user/./docs/../photos/" -> "/home/user/photos"
       "/../" -> "/"

D) class MinStack
   push(x), pop() -> x, top() -> x, get_min() -> current minimum. ALL in O(1).
   pop/top/get_min on an empty stack raise IndexError.

FOLLOW-UP
---------
- Where is a stack used implicitly in every program? (call stack, recursion)
- How would you convert a recursive DFS to an iterative one?
- In B, why does each index enter and leave the stack at most once?

Run the tests:  python TGI_SOLUCIONES/python/14_stacks.py
"""
from _pruebas import ejecutar


def eval_rpn(tokens: list[str]) -> int:
    # TODO
    raise NotImplementedError


def daily_temperatures(temps: list[int]) -> list[int]:
    # TODO
    raise NotImplementedError


def simplify_path(path: str) -> str:
    # TODO
    raise NotImplementedError


class MinStack:
    def __init__(self):
        # TODO
        raise NotImplementedError

    def push(self, x: int) -> None:
        raise NotImplementedError

    def pop(self) -> int:
        raise NotImplementedError

    def top(self) -> int:
        raise NotImplementedError

    def get_min(self) -> int:
        raise NotImplementedError


# ============================================================================
# TESTS — do not modify
# ============================================================================
def test_a_eval_rpn():
    assert eval_rpn(["2", "1", "+", "3", "*"]) == 9
    assert eval_rpn(["4", "13", "5", "/", "+"]) == 6
    assert eval_rpn(["-7", "2", "/"]) == -3
    assert eval_rpn(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]) == 22
    assert eval_rpn(["42"]) == 42


def test_a_eval_rpn_invalid():
    for bad in (["+"], ["1", "2"], ["1", "+"], []):
        try:
            eval_rpn(bad)
            raise AssertionError(f"{bad} should raise ValueError")
        except ValueError:
            pass


def test_b_daily_temperatures():
    assert daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]) == [1, 1, 4, 2, 1, 1, 0, 0]
    assert daily_temperatures([30, 60, 90]) == [1, 1, 0]
    assert daily_temperatures([90, 80, 70]) == [0, 0, 0]
    assert daily_temperatures([]) == []


def test_b_daily_temperatures_is_linear():
    import time
    temps = list(range(100_000, 0, -1)) + [200_000]
    start = time.perf_counter()
    r = daily_temperatures(temps)
    assert r[0] == 100_000 and r[-1] == 0
    assert time.perf_counter() - start < 1, "too slow: is it O(n)?"


def test_c_simplify_path():
    cases = {
        "/home//user/./docs/../photos/": "/home/user/photos", "/../": "/", "/": "/",
        "/a/./b/../../c/": "/c", "/a//b////c/d//././/..": "/a/b/c", "/...": "/...",
    }
    for path, expected in cases.items():
        assert simplify_path(path) == expected, f"{path!r} -> {simplify_path(path)!r}, expected {expected!r}"


def test_d_min_stack():
    s = MinStack()
    s.push(5)
    s.push(2)
    s.push(8)
    s.push(2)
    assert s.get_min() == 2 and s.top() == 2
    assert s.pop() == 2
    assert s.get_min() == 2, "the other 2 is still in the stack"
    s.pop()
    s.pop()
    assert s.get_min() == 5 and s.top() == 5
    s.pop()
    for method in (s.pop, s.top, s.get_min):
        try:
            method()
            raise AssertionError(f"{method.__name__} on an empty stack should raise IndexError")
        except IndexError:
            pass


if __name__ == "__main__":
    ejecutar(globals())
