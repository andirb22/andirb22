"""
EXERCISE 19 — Heaps and priority queues (heapq)
Topics: heapq.heappush / heappop, tuples as (priority, tiebreaker, value), min-heap vs
max-heap, top-k, merging sorted streams
Suggested time: 45 min

Python's heapq is a MIN-heap over a plain list. Tuples are compared element by element,
so (priority, order, item) works as a priority queue entry. For a max-heap, push -value.

PROBLEMS
--------
A) merge_k_sorted(lists) -> list[int]
   Merge k sorted lists into one sorted list in O(N log k), where N is the total number of
   elements. Do NOT concatenate and sort, and do not use heapq.merge.
       merge_k_sorted([[1, 4, 5], [1, 3, 4], [2, 6]]) -> [1, 1, 2, 3, 4, 4, 5, 6]

B) class KthLargest
   KthLargest(k, initial_numbers); add(x) -> the k-th largest number seen so far.
   Keep a min-heap of size k (each add is O(log k)).
       kl = KthLargest(3, [4, 5, 8, 2]); kl.add(3) -> 4; kl.add(5) -> 5; kl.add(10) -> 5

C) min_meeting_rooms(meetings) -> int
   meetings is a list of (start, end) tuples. A meeting ending at time t frees its room
   for a meeting starting at t. Return the minimum number of rooms needed.
       [(0, 30), (5, 10), (15, 20)] -> 2

D) top_k_frequent_words(words, k) -> list[str]
   The k most frequent words, from most to least frequent; ties in alphabetical order.
       (["i", "love", "code", "i", "love", "coding"], 2) -> ["i", "love"]

E) class RunningMedian
   add(x) and median() -> float. Use TWO heaps: a max-heap with the lower half and a
   min-heap with the upper half, keeping their sizes balanced. median() on an empty
   structure raises ValueError.
       add(5) -> median 5.0; add(15) -> 10.0; add(1) -> 5.0; add(3) -> 4.0

FOLLOW-UP
---------
- Why add a counter as the second element of the tuple when items cannot be compared?
- Which AWS or backend system behaves like a priority queue? (job schedulers, SQS with
  several queues, Celery priorities)

Run the tests:  python python/19_heaps_priority.py
"""
import heapq  # noqa: F401

from _pruebas import ejecutar


def merge_k_sorted(lists: list[list[int]]) -> list[int]:
    # TODO
    raise NotImplementedError


class KthLargest:
    def __init__(self, k: int, initial_numbers: list[int]):
        # TODO
        raise NotImplementedError

    def add(self, x: int) -> int:
        raise NotImplementedError


def min_meeting_rooms(meetings: list[tuple[int, int]]) -> int:
    # TODO
    raise NotImplementedError


def top_k_frequent_words(words: list[str], k: int) -> list[str]:
    # TODO
    raise NotImplementedError


class RunningMedian:
    def __init__(self):
        # TODO
        raise NotImplementedError

    def add(self, x: float) -> None:
        raise NotImplementedError

    def median(self) -> float:
        raise NotImplementedError


# ============================================================================
# TESTS — do not modify
# ============================================================================
def test_a_merge_k_sorted():
    assert merge_k_sorted([[1, 4, 5], [1, 3, 4], [2, 6]]) == [1, 1, 2, 3, 4, 4, 5, 6]
    assert merge_k_sorted([]) == []
    assert merge_k_sorted([[], [1], []]) == [1]
    import inspect
    import re
    body = inspect.getsource(merge_k_sorted).split(":", 1)[1]
    assert not re.search(r"(?<![\w.])sorted\(|\.sort\(|heapq\.merge", body), "use a heap, not sorting or heapq.merge"


def test_b_kth_largest():
    kl = KthLargest(3, [4, 5, 8, 2])
    assert [kl.add(x) for x in (3, 5, 10, 9, 4)] == [4, 5, 5, 8, 8]
    kl2 = KthLargest(1, [])
    assert kl2.add(-1) == -1 and kl2.add(1) == 1


def test_c_min_meeting_rooms():
    assert min_meeting_rooms([(0, 30), (5, 10), (15, 20)]) == 2
    assert min_meeting_rooms([(7, 10), (2, 4)]) == 1
    assert min_meeting_rooms([(1, 5), (5, 10)]) == 1, "a room is free at the exact end time"
    assert min_meeting_rooms([(1, 10), (2, 9), (3, 8), (4, 7)]) == 4
    assert min_meeting_rooms([]) == 0


def test_d_top_k_frequent_words():
    assert top_k_frequent_words(["i", "love", "code", "i", "love", "coding"], 2) == ["i", "love"]
    words = ["the", "day", "is", "sunny", "the", "the", "the", "sunny", "is", "is"]
    assert top_k_frequent_words(words, 4) == ["the", "is", "sunny", "day"]
    assert top_k_frequent_words(["b", "a"], 5) == ["a", "b"]


def test_e_running_median():
    rm = RunningMedian()
    medians = []
    for x in (5, 15, 1, 3):
        rm.add(x)
        medians.append(rm.median())
    assert medians == [5.0, 10.0, 5.0, 4.0], medians
    try:
        RunningMedian().median()
        raise AssertionError("median() on an empty structure should raise ValueError")
    except ValueError:
        pass


def test_e_running_median_is_fast():
    import random
    import statistics
    import time
    rm = RunningMedian()
    data = [random.randint(-1000, 1000) for _ in range(50_000)]
    start = time.perf_counter()
    for x in data:
        rm.add(x)
        rm.median()
    assert time.perf_counter() - start < 2, "too slow: are you sorting on every add?"
    assert rm.median() == statistics.median(data)


if __name__ == "__main__":
    ejecutar(globals())
