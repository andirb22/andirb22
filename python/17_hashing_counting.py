"""
EXERCISE 17 — Dictionaries, sets and counting
Topics: dict, set, Counter, defaultdict, O(1) lookups, tuples as dict keys
Suggested time: 35 min

PROBLEMS
--------
A) two_sum(nums, target) -> tuple[int, int] | None
   Indexes (i, j) with i < j and nums[i] + nums[j] == target. If several pairs exist,
   return the one with the smallest j (and then the smallest i). None if no pair exists.
   Target O(n) with a dict.
       two_sum([2, 7, 11, 15], 9) -> (0, 1)

B) longest_consecutive(nums) -> int
   Length of the longest run of consecutive integers (in any order in the list).
   Target O(n) with a set: only start counting from numbers that have no predecessor.
       longest_consecutive([100, 4, 200, 1, 3, 2]) -> 4      (1, 2, 3, 4)

C) first_unique_char(s) -> int
   Index of the first character that appears exactly once, or -1.
       "leetcode" -> 0      "loveleetcode" -> 2      "aabb" -> -1

D) is_isomorphic(a, b) -> bool
   True if the characters of a can be replaced one-to-one to get b (two different
   characters cannot map to the same one).
       ("egg", "add") -> True     ("foo", "bar") -> False     ("badc", "baba") -> False

E) count_pairs_by_city(trips) -> list[tuple[tuple[str, str], int]]
   trips is a list of (origin, destination) tuples. Count trips per route, treating
   (A, B) and (B, A) as the SAME route, stored as the alphabetically sorted tuple.
   Return (route, count) sorted by count descending, then by route ascending.
       [("BOG", "MDE"), ("MDE", "BOG"), ("CLO", "BOG")]
       -> [(("BOG", "MDE"), 2), (("BOG", "CLO"), 1)]

FOLLOW-UP
---------
- Why can a tuple be a dict key but a list cannot?
- What is the worst-case complexity of a dict lookup, and why does it almost never happen?

Run the tests:  python python/17_hashing_counting.py
"""
from collections import Counter, defaultdict  # noqa: F401

from _pruebas import ejecutar


def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    # TODO
    raise NotImplementedError


def longest_consecutive(nums: list[int]) -> int:
    # TODO
    raise NotImplementedError


def first_unique_char(s: str) -> int:
    # TODO
    raise NotImplementedError


def is_isomorphic(a: str, b: str) -> bool:
    # TODO
    raise NotImplementedError


def count_pairs_by_city(trips: list[tuple[str, str]]) -> list[tuple[tuple[str, str], int]]:
    # TODO
    raise NotImplementedError


# ============================================================================
# TESTS — do not modify
# ============================================================================
def test_a_two_sum():
    assert two_sum([2, 7, 11, 15], 9) == (0, 1)
    assert two_sum([3, 2, 4], 6) == (1, 2)
    assert two_sum([3, 3], 6) == (0, 1)
    assert two_sum([1, 2], 7) is None
    assert two_sum([1, 5, 5, 1], 6) == (0, 1)


def test_a_two_sum_is_linear():
    import time
    nums = list(range(300_000))
    start = time.perf_counter()
    assert two_sum(nums, 599_997) == (299_998, 299_999)
    assert time.perf_counter() - start < 1, "too slow: is it O(n)?"


def test_b_longest_consecutive():
    assert longest_consecutive([100, 4, 200, 1, 3, 2]) == 4
    assert longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9
    assert longest_consecutive([]) == 0
    assert longest_consecutive([5, 5, 5]) == 1


def test_b_longest_consecutive_is_linear():
    import random
    import time
    nums = list(range(400_000))
    random.shuffle(nums)
    start = time.perf_counter()
    assert longest_consecutive(nums) == 400_000
    assert time.perf_counter() - start < 1.5, "too slow: is it O(n)?"


def test_c_first_unique_char():
    assert first_unique_char("leetcode") == 0
    assert first_unique_char("loveleetcode") == 2
    assert first_unique_char("aabb") == -1
    assert first_unique_char("") == -1


def test_d_is_isomorphic():
    assert is_isomorphic("egg", "add")
    assert not is_isomorphic("foo", "bar")
    assert not is_isomorphic("badc", "baba")
    assert is_isomorphic("paper", "title")
    assert not is_isomorphic("ab", "abc")


def test_e_count_pairs_by_city():
    trips = [("BOG", "MDE"), ("MDE", "BOG"), ("CLO", "BOG")]
    assert count_pairs_by_city(trips) == [(("BOG", "MDE"), 2), (("BOG", "CLO"), 1)]
    trips2 = [("A", "B"), ("C", "D"), ("D", "C"), ("B", "A"), ("E", "F")]
    assert count_pairs_by_city(trips2) == [(("A", "B"), 2), (("C", "D"), 2), (("E", "F"), 1)]
    assert count_pairs_by_city([]) == []


if __name__ == "__main__":
    ejecutar(globals())
