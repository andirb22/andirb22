"""
EXERCISE 15 — Sliding window
Topics: fixed and variable windows, two indexes, deque as a monotonic queue
Suggested time: 35 min

Sliding window turns many O(n * k) brute-force loops into O(n): instead of recomputing
each window from scratch, update it by adding the element that enters and removing the
one that leaves.

PROBLEMS
--------
A) max_sum_window(nums, k) -> int
   The maximum sum of any k consecutive elements. Raise ValueError if k <= 0 or
   k > len(nums).
       max_sum_window([2, 1, 5, 1, 3, 2], 3) -> 9      (5 + 1 + 3)

B) shortest_subarray_at_least(nums, target) -> int
   nums contains only POSITIVE integers. Return the length of the shortest contiguous
   subarray whose sum is >= target, or 0 if none exists.
       shortest_subarray_at_least([2, 3, 1, 2, 4, 3], 7) -> 2      ([4, 3])

C) window_maximums(nums, k) -> list[int]
   The maximum of each window of size k as it slides from left to right.
       window_maximums([1, 3, -1, -3, 5, 3, 6, 7], 3) -> [3, 3, 5, 5, 6, 7]
   Target: O(n) using a deque that stores indexes in decreasing order of value.
   (Calling max() on every window is O(n * k): the tests include a large input.)

D) class MovingAverage
   MovingAverage(size); next(value) -> float: the average of the last `size` values
   (or of all values if fewer have arrived). Each call must be O(1).
       m = MovingAverage(3); m.next(1) -> 1.0; m.next(10) -> 5.5; m.next(3) -> 4.666...;
       m.next(5) -> 6.0

FOLLOW-UP
---------
- Why does B need the numbers to be positive? What would you use with negatives?
- Where do you see moving averages in production? (metrics dashboards, p95 latency)

Run the tests:  python python/15_sliding_window.py
"""
from collections import deque  # noqa: F401

from _pruebas import ejecutar


def max_sum_window(nums: list[int], k: int) -> int:
    # TODO
    raise NotImplementedError


def shortest_subarray_at_least(nums: list[int], target: int) -> int:
    # TODO
    raise NotImplementedError


def window_maximums(nums: list[int], k: int) -> list[int]:
    # TODO
    raise NotImplementedError


class MovingAverage:
    def __init__(self, size: int):
        # TODO
        raise NotImplementedError

    def next(self, value: float) -> float:
        raise NotImplementedError


# ============================================================================
# TESTS — do not modify
# ============================================================================
def test_a_max_sum_window():
    assert max_sum_window([2, 1, 5, 1, 3, 2], 3) == 9
    assert max_sum_window([-5, -2, -3], 2) == -5
    assert max_sum_window([4], 1) == 4
    for k in (0, 4):
        try:
            max_sum_window([1, 2, 3], k)
            raise AssertionError(f"k={k} should raise ValueError")
        except ValueError:
            pass


def test_b_shortest_subarray():
    assert shortest_subarray_at_least([2, 3, 1, 2, 4, 3], 7) == 2
    assert shortest_subarray_at_least([1, 4, 4], 4) == 1
    assert shortest_subarray_at_least([1, 1, 1, 1], 11) == 0
    assert shortest_subarray_at_least([1, 2, 3, 4, 5], 15) == 5


def test_c_window_maximums():
    assert window_maximums([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7]
    assert window_maximums([9, 8, 7], 1) == [9, 8, 7]
    assert window_maximums([4, 2, 12, 3], 4) == [12]


def test_c_window_maximums_is_linear():
    import time
    nums = list(range(200_000))
    start = time.perf_counter()
    r = window_maximums(nums, 5_000)
    assert r[0] == 4_999 and r[-1] == 199_999
    assert time.perf_counter() - start < 1.5, "too slow: is it O(n)?"


def test_d_moving_average():
    m = MovingAverage(3)
    results = [m.next(v) for v in (1, 10, 3, 5)]
    expected = [1.0, 5.5, 14 / 3, 6.0]
    assert all(abs(a - b) < 1e-9 for a, b in zip(results, expected)), results


if __name__ == "__main__":
    ejecutar(globals())
