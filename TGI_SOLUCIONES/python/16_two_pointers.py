"""
EXERCISE 16 — Two pointers
Topics: indexes moving toward each other or in the same direction, in-place list edits,
sorted inputs, tuples as results
Suggested time: 35 min

PROBLEMS
--------
A) merge_sorted(a, b) -> list[int]
   Merge two sorted lists into one sorted list in O(len(a) + len(b)).
   Do NOT use sort(), sorted() or heapq.merge.
       merge_sorted([1, 4, 7], [2, 3, 8, 9]) -> [1, 2, 3, 4, 7, 8, 9]

B) three_sum(nums) -> list[tuple[int, int, int]]
   All UNIQUE triplets (a, b, c) with a + b + c == 0. Each triplet sorted ascending,
   and the list of triplets sorted ascending. Target O(n^2): sort once, then for each
   element use two pointers on the rest.
       three_sum([-1, 0, 1, 2, -1, -4]) -> [(-1, -1, 2), (-1, 0, 1)]

C) sort_colors(colors) -> None
   colors only contains 0, 1 and 2. Sort it IN PLACE in a single pass with three
   pointers (Dutch national flag). Do not use sort() or count the values.
       [2, 0, 2, 1, 1, 0] -> [0, 0, 1, 1, 2, 2]

D) is_palindrome_sentence(s) -> bool
   True if s reads the same forwards and backwards, ignoring case and any character that
   is not a letter or digit. Use two pointers; do not build a reversed copy.
       "A man, a plan, a canal: Panama" -> True

E) container_most_water(heights) -> tuple[int, int, int]
   heights[i] is the height of a vertical line at position i. Pick two lines that, with the
   x-axis, hold the most water. Return (left_index, right_index, area). If several pairs
   have the same max area, return the one with the smallest left_index, then the
   smallest right_index. Target O(n).
       [1, 8, 6, 2, 5, 4, 8, 3, 7] -> (1, 8, 49)

FOLLOW-UP
---------
- Why is it safe in E to move the pointer of the SHORTER line?
- In B, how do you skip duplicates without a set?

Run the tests:  python TGI_SOLUCIONES/python/16_two_pointers.py
"""
from _pruebas import ejecutar


def merge_sorted(a: list[int], b: list[int]) -> list[int]:
    # TODO
    raise NotImplementedError


def three_sum(nums: list[int]) -> list[tuple[int, int, int]]:
    # TODO
    raise NotImplementedError


def sort_colors(colors: list[int]) -> None:
    # TODO
    raise NotImplementedError


def is_palindrome_sentence(s: str) -> bool:
    # TODO
    raise NotImplementedError


def container_most_water(heights: list[int]) -> tuple[int, int, int]:
    # TODO
    raise NotImplementedError


# ============================================================================
# TESTS — do not modify
# ============================================================================
def _uses(fn, *patterns):
    import inspect
    import re
    body = inspect.getsource(fn).split(":", 1)[1]  # skip the "def name(...)" line
    return any(re.search(p, body) for p in patterns)


_SORTING = (r"(?<![\w.])sorted\(", r"\.sort\(", r"heapq")


def test_a_merge_sorted():
    assert merge_sorted([1, 4, 7], [2, 3, 8, 9]) == [1, 2, 3, 4, 7, 8, 9]
    assert merge_sorted([], [1, 2]) == [1, 2]
    assert merge_sorted([1, 1], [1]) == [1, 1, 1]
    assert not _uses(merge_sorted, *_SORTING), "no sorting helpers: merge with two pointers"


def test_b_three_sum():
    assert three_sum([-1, 0, 1, 2, -1, -4]) == [(-1, -1, 2), (-1, 0, 1)]
    assert three_sum([0, 0, 0, 0]) == [(0, 0, 0)]
    assert three_sum([1, 2, 3]) == []
    assert three_sum([-2, 0, 1, 1, 2, -1, -4, 3]) == [(-4, 1, 3), (-2, -1, 3), (-2, 0, 2), (-2, 1, 1), (-1, 0, 1)]


def test_c_sort_colors():
    c = [2, 0, 2, 1, 1, 0]
    assert sort_colors(c) is None
    assert c == [0, 0, 1, 1, 2, 2]
    c2 = [2, 2, 2, 0]
    sort_colors(c2)
    assert c2 == [0, 2, 2, 2]
    assert not _uses(sort_colors, *_SORTING, r"\.count\("), "use pointers, not sort() or count()"


def test_d_palindrome_sentence():
    assert is_palindrome_sentence("A man, a plan, a canal: Panama")
    assert is_palindrome_sentence("") and is_palindrome_sentence(".,!")
    assert not is_palindrome_sentence("race a car")
    assert is_palindrome_sentence("No 'x' in Nixon")


def test_e_container_most_water():
    assert container_most_water([1, 8, 6, 2, 5, 4, 8, 3, 7]) == (1, 8, 49)
    assert container_most_water([1, 1]) == (0, 1, 1)
    assert container_most_water([4, 3, 2, 1, 4]) == (0, 4, 16)


if __name__ == "__main__":
    ejecutar(globals())
