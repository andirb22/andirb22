"""
EXERCISE 18 — Breadth-first search on grids
Topics: BFS with deque, visited sets of (row, col) tuples, direction lists,
reconstructing a path, multi-source BFS
Suggested time: 45 min

A grid is a list of strings. Movement is in 4 directions (up, down, left, right) unless a
problem says otherwise. Positions are (row, col) tuples.

PROBLEMS
--------
A) shortest_path(grid) -> list[tuple[int, int]] | None
   "S" is the start, "E" the exit, "#" a wall, "." free space. Return the list of positions
   of a shortest path from S to E (both included), or None if E is unreachable.
   When several shortest paths exist, any of them is valid (the tests check the length and
   that each step is a valid move).
       ["S.#",
        ".##",      -> 5 positions: [(0,0), (1,0), (2,0), (2,1), (2,2)]
        "..E"]

B) minutes_to_rot(grid) -> int
   "2" is a rotten orange, "1" a fresh one, "0" an empty cell. Every minute, each rotten
   orange rots its fresh neighbors. Return the minutes until no fresh orange is left, or
   -1 if that is impossible. Start the BFS from ALL rotten oranges at once.
       ["211",
        "110",      -> 4
        "011"]

C) knight_moves(start, end, size=8) -> int
   Minimum number of knight moves on a size x size chessboard to go from start to end
   (both (row, col) tuples). -1 if unreachable (it can happen on tiny boards).
       knight_moves((0, 0), (7, 7)) -> 6

D) count_regions(grid) -> dict[str, int]
   The grid contains letters; a region is a group of equal letters connected in 4
   directions. Return how many regions each letter has.
       ["AAB",
        "ABB",      -> {"A": 2, "B": 1, "C": 1}
        "CBA"]

FOLLOW-UP
---------
- Why does BFS find the shortest path in an unweighted grid, and DFS does not?
- What changes if moving into some cells costs more? (Dijkstra with heapq)
- Why mark a cell as visited when you ENQUEUE it and not when you dequeue it?

Run the tests:  python TGI_SOLUCIONES/python/18_bfs_grid.py
"""
from collections import deque  # noqa: F401

from _pruebas import ejecutar


def shortest_path(grid: list[str]) -> list[tuple[int, int]] | None:
    # TODO
    raise NotImplementedError


def minutes_to_rot(grid: list[str]) -> int:
    # TODO
    raise NotImplementedError


def knight_moves(start: tuple[int, int], end: tuple[int, int], size: int = 8) -> int:
    # TODO
    raise NotImplementedError


def count_regions(grid: list[str]) -> dict[str, int]:
    # TODO
    raise NotImplementedError


# ============================================================================
# TESTS — do not modify
# ============================================================================
def _valid_path(grid, path):
    assert grid[path[0][0]][path[0][1]] == "S", "the path must start at S"
    assert grid[path[-1][0]][path[-1][1]] == "E", "the path must end at E"
    for (r1, c1), (r2, c2) in zip(path, path[1:]):
        assert abs(r1 - r2) + abs(c1 - c2) == 1, f"invalid step {(r1, c1)} -> {(r2, c2)}"
        assert grid[r2][c2] != "#", f"the path goes through a wall at {(r2, c2)}"


def test_a_shortest_path():
    g = ["S.#", ".##", "..E"]
    p = shortest_path(g)
    assert p is not None and len(p) == 5, p
    _valid_path(g, p)
    g2 = ["S...", ".##.", "...E"]
    p2 = shortest_path(g2)
    assert len(p2) == 6, p2
    _valid_path(g2, p2)
    assert all(isinstance(x, tuple) for x in p2), "positions must be tuples"


def test_a_unreachable_and_trivial():
    assert shortest_path(["S#", "#E"]) is None
    assert shortest_path(["SE"]) == [(0, 0), (0, 1)]


def test_b_minutes_to_rot():
    assert minutes_to_rot(["211", "110", "011"]) == 4
    assert minutes_to_rot(["211", "011", "101"]) == -1
    assert minutes_to_rot(["02"]) == 0
    assert minutes_to_rot(["2", "1", "1", "1", "2"]) == 2, "rot spreads from all rotten oranges at once"


def test_c_knight_moves():
    assert knight_moves((0, 0), (7, 7)) == 6
    assert knight_moves((0, 0), (0, 0)) == 0
    assert knight_moves((0, 0), (1, 2)) == 1
    assert knight_moves((0, 0), (1, 1), size=3) == -1, "on a 3x3 board the center is unreachable"


def test_d_count_regions():
    assert count_regions(["AAB", "ABB", "CBA"]) == {"A": 2, "B": 1, "C": 1}
    assert count_regions(["XYX", "YXY"]) == {"X": 3, "Y": 3}
    assert count_regions([]) == {}


if __name__ == "__main__":
    ejecutar(globals())
