"""
EXERCISE 12 — Matrix problems (lists of lists and nested loops)
Topics: 2D lists, index arithmetic, nested loops, in-place updates, aliasing
Suggested time: 30 min

PROBLEMS
--------
A) spiral_order(matrix) -> list[int]
   Return all elements in clockwise spiral order, starting at the top-left corner.
       [[1, 2, 3],
        [4, 5, 6],      -> [1, 2, 3, 6, 9, 8, 7, 4, 5]
        [7, 8, 9]]
   Must work for non-square matrices and for an empty matrix ([] -> []).

B) set_zeroes(matrix) -> None
   If an element is 0, set its whole row and column to 0. Modify the matrix IN PLACE
   (return nothing). Zeros created by this process must not spread further.
       [[1, 1, 1],          [[1, 0, 1],
        [1, 0, 1],    ->     [0, 0, 0],
        [1, 1, 1]]           [1, 0, 1]]

C) pascal_triangle(n) -> list[list[int]]
   Return the first n rows of Pascal's triangle.
       pascal_triangle(5) -> [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]
   Each row must be an independent list (no shared references between rows).

D) transpose(matrix) -> list[list[int]]
   Return the transpose WITHOUT using zip() or numpy. The original must not change.
       [[1, 2, 3], [4, 5, 6]] -> [[1, 4], [2, 5], [3, 6]]

E) diagonal_difference(matrix) -> int
   For a square matrix, return the absolute difference between the sum of the main
   diagonal and the sum of the anti-diagonal, using a SINGLE loop.
       [[11, 2, 4], [4, 5, 6], [10, 8, -12]] -> |(11 + 5 - 12) - (4 + 5 + 10)| = 15

FOLLOW-UP
---------
- Why does [[0] * 3] * 3 create a bug when you later modify one cell?
- Can you solve B using O(1) extra memory (using the first row/column as markers)?
- What is the complexity of A in terms of rows (m) and columns (n)?

Run the tests:  python TGI_SOLUCIONES/python/12_lists_matrix.py
"""
from _pruebas import ejecutar


def spiral_order(matrix: list[list[int]]) -> list[int]:
    # TODO
    raise NotImplementedError


def set_zeroes(matrix: list[list[int]]) -> None:
    # TODO
    raise NotImplementedError


def pascal_triangle(n: int) -> list[list[int]]:
    # TODO
    raise NotImplementedError


def transpose(matrix: list[list[int]]) -> list[list[int]]:
    # TODO
    raise NotImplementedError


def diagonal_difference(matrix: list[list[int]]) -> int:
    # TODO
    raise NotImplementedError


# ============================================================================
# TESTS — do not modify
# ============================================================================
def test_a_spiral_order():
    assert spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) == [1, 2, 3, 6, 9, 8, 7, 4, 5]
    assert spiral_order([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]) == [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
    assert spiral_order([[1], [2], [3]]) == [1, 2, 3]
    assert spiral_order([[1, 2, 3]]) == [1, 2, 3]
    assert spiral_order([]) == []


def test_b_set_zeroes():
    m = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
    assert set_zeroes(m) is None, "must modify in place and return None"
    assert m == [[1, 0, 1], [0, 0, 0], [1, 0, 1]], m
    m2 = [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]
    set_zeroes(m2)
    assert m2 == [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]], m2


def test_c_pascal_triangle():
    assert pascal_triangle(5) == [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]
    assert pascal_triangle(0) == []
    t = pascal_triangle(3)
    t[1][0] = 99
    assert t[2] == [1, 2, 1], "rows must not share references"


def test_d_transpose():
    original = [[1, 2, 3], [4, 5, 6]]
    assert transpose(original) == [[1, 4], [2, 5], [3, 6]]
    assert original == [[1, 2, 3], [4, 5, 6]]
    assert transpose([]) == []
    import inspect
    assert "zip(" not in inspect.getsource(transpose), "solve it without zip()"


def test_e_diagonal_difference():
    assert diagonal_difference([[11, 2, 4], [4, 5, 6], [10, 8, -12]]) == 15
    assert diagonal_difference([[5]]) == 0
    assert diagonal_difference([[1, 2], [3, 4]]) == 0


if __name__ == "__main__":
    ejecutar(globals())
