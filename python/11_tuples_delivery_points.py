"""
EXERCISE 11 — Delivery points (tuples)
Topics: tuples, unpacking, sorting with keys, tuple comparison, sets of tuples
Suggested time: 20 min

CONTEXT
-------
A delivery app stores each stop as a tuple (x, y) on a city grid. Tuples are immutable and
hashable, so they can be dictionary keys and set members, and Python compares them
element by element, which makes them great sort keys.

PROBLEMS
--------
A) closest_stops(stops, k) -> list[tuple[int, int]]
   Return the k stops closest to the warehouse at (0, 0), using Euclidean distance.
   Ties are broken by the stop itself in natural tuple order ((1, 2) before (2, 1)).
   Duplicated stops count only once. If k is larger than the number of unique stops,
   return all of them.
       closest_stops([(3, 3), (1, 2), (-2, 1), (2, 1), (1, 2)], 2) -> [(-2, 1), (1, 2)]

B) bounding_box(stops) -> tuple[tuple[int, int], tuple[int, int]]
   Return ((min_x, min_y), (max_x, max_y)) using a SINGLE pass over the list
   (do not call min()/max() several times). Raise ValueError for an empty list.
       bounding_box([(1, 5), (-2, 3), (4, -1)]) -> ((-2, -1), (4, 5))

C) route_distance(route) -> int
   A route is a list of stops visited in order. Return the total Manhattan distance
   (|x1 - x2| + |y1 - y2| between consecutive stops). Use zip() over consecutive pairs.
       route_distance([(0, 0), (2, 3), (2, 1)]) -> 7

D) group_by_quadrant(stops) -> dict[str, list[tuple[int, int]]]
   Keys: "NE" (x > 0, y > 0), "NW" (x < 0, y > 0), "SW" (x < 0, y < 0),
   "SE" (x > 0, y < 0), "AXIS" (x == 0 or y == 0). Keep the original order inside each
   group and include only quadrants that have stops.

E) swap_coordinates(stops) -> list[tuple[int, int]]
   Return a new list where each (x, y) becomes (y, x). The original list must not change.
   Bonus question: why can't you do stop[0], stop[1] = stop[1], stop[0]?

FOLLOW-UP (what an interviewer would ask)
-----------------------------------------
- What is the complexity of A? How would you get O(n log k) with heapq.nsmallest?
- Why do we compare squared distances instead of calling math.sqrt?
- When would you use a namedtuple or a dataclass(frozen=True) instead of a plain tuple?

Run the tests:  python python/11_tuples_delivery_points.py
"""
from _pruebas import ejecutar


def closest_stops(stops: list[tuple[int, int]], k: int) -> list[tuple[int, int]]:
    # TODO: your solution here
    raise NotImplementedError


def bounding_box(stops: list[tuple[int, int]]) -> tuple[tuple[int, int], tuple[int, int]]:
    # TODO
    raise NotImplementedError


def route_distance(route: list[tuple[int, int]]) -> int:
    # TODO
    raise NotImplementedError


def group_by_quadrant(stops: list[tuple[int, int]]) -> dict[str, list[tuple[int, int]]]:
    # TODO
    raise NotImplementedError


def swap_coordinates(stops: list[tuple[int, int]]) -> list[tuple[int, int]]:
    # TODO
    raise NotImplementedError


# ============================================================================
# TESTS — do not modify
# ============================================================================
def test_a_closest_stops():
    stops = [(3, 3), (1, 2), (-2, 1), (2, 1), (1, 2)]
    assert closest_stops(stops, 2) == [(-2, 1), (1, 2)], closest_stops(stops, 2)
    assert closest_stops(stops, 10) == [(-2, 1), (1, 2), (2, 1), (3, 3)]
    assert closest_stops([], 3) == []
    assert closest_stops([(5, 5)], 0) == []


def test_b_bounding_box():
    assert bounding_box([(1, 5), (-2, 3), (4, -1)]) == ((-2, -1), (4, 5))
    assert bounding_box([(7, 7)]) == ((7, 7), (7, 7))
    try:
        bounding_box([])
        raise AssertionError("an empty list must raise ValueError")
    except ValueError:
        pass


def test_c_route_distance():
    assert route_distance([(0, 0), (2, 3), (2, 1)]) == 7
    assert route_distance([(1, 1)]) == 0
    assert route_distance([]) == 0
    assert route_distance([(0, 0), (-3, -4), (0, 0)]) == 14


def test_d_group_by_quadrant():
    stops = [(1, 1), (-1, 2), (0, 5), (-3, -3), (2, -2), (4, 4), (3, 0)]
    assert group_by_quadrant(stops) == {
        "NE": [(1, 1), (4, 4)], "NW": [(-1, 2)], "AXIS": [(0, 5), (3, 0)],
        "SW": [(-3, -3)], "SE": [(2, -2)],
    }, group_by_quadrant(stops)
    assert group_by_quadrant([(1, 1)]) == {"NE": [(1, 1)]}


def test_e_swap_coordinates():
    stops = [(1, 2), (3, 4)]
    assert swap_coordinates(stops) == [(2, 1), (4, 3)]
    assert stops == [(1, 2), (3, 4)], "the original list must not change"
    assert all(isinstance(p, tuple) for p in swap_coordinates(stops)), "results must be tuples"


if __name__ == "__main__":
    ejecutar(globals())
