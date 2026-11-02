"""
EXERCISE 20 — Simulations with loops
Topics: while/for loops, state machines, tuples for state, cycle detection,
copying vs mutating, modular arithmetic
Suggested time: 45 min

PROBLEMS
--------
A) game_of_life(board) -> list[list[int]]
   Conway's Game of Life. board is a list of lists of 0 (dead) and 1 (alive). Return the
   NEXT generation as a new board (do not modify the input). Rules, using the 8 neighbors:
     - A live cell with 2 or 3 live neighbors survives; otherwise it dies.
     - A dead cell with exactly 3 live neighbors becomes alive.
   Cells outside the board count as dead.

B) robot_position(commands) -> tuple[tuple[int, int], str, bool]
   A robot starts at (0, 0) facing "N". Commands: "G" go one step forward, "L" turn left
   90°, "R" turn right 90°. Return (final_position, final_direction, bounded), where
   bounded is True if repeating the command string forever keeps the robot inside a
   circle (hint: after one run it is back at the origin OR not facing north).
       robot_position("GGLLGG") -> ((0, 0), "S", True)
       robot_position("GG")     -> ((0, 2), "N", False)

C) first_repeated_state(start, step) -> tuple[int, int]
   Apply `step` (a function from int to int) repeatedly starting at `start`. Return
   (mu, lam): mu is the index of the first value that will repeat, and lam is the length
   of the cycle. Store the index where each value was first seen in a dict.
       step = lambda x: (x * x + 1) % 10, start = 3
       sequence: 3, 0, 1, 2, 5, 6, 7, 0, ...  -> (1, 6)

D) bank_simulation(customers, tellers) -> dict
   customers is a list of (arrival_minute, service_minutes) tuples sorted by arrival.
   There are `tellers` tellers. A customer is served by any free teller as soon as possible
   (first come, first served). Return:
     {"average_wait": float rounded to 2 decimals,
      "max_wait": int,
      "last_finish": int}       # minute when the last customer leaves
       bank_simulation([(0, 5), (1, 3), (2, 4), (2, 6)], 2)
       -> {"average_wait": 1.25, "max_wait": 3, "last_finish": 11}

FOLLOW-UP
---------
- In A, how would you update the board in place with O(1) extra memory?
- C is Floyd's cycle detection when you cannot use extra memory: how does it work?
- How would D change if VIP customers could skip the line? (priority queue)

Run the tests:  python python/20_simulations.py
"""
from _pruebas import ejecutar


def game_of_life(board: list[list[int]]) -> list[list[int]]:
    # TODO
    raise NotImplementedError


def robot_position(commands: str) -> tuple[tuple[int, int], str, bool]:
    # TODO
    raise NotImplementedError


def first_repeated_state(start: int, step) -> tuple[int, int]:
    # TODO
    raise NotImplementedError


def bank_simulation(customers: list[tuple[int, int]], tellers: int) -> dict:
    # TODO
    raise NotImplementedError


# ============================================================================
# TESTS — do not modify
# ============================================================================
def test_a_game_of_life():
    board = [[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]
    assert game_of_life(board) == [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]]
    assert board == [[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]], "do not modify the input"
    blinker = [[0, 0, 0], [1, 1, 1], [0, 0, 0]]
    assert game_of_life(game_of_life(blinker)) == blinker, "a blinker returns after 2 generations"


def test_b_robot_position():
    assert robot_position("GGLLGG") == ((0, 0), "S", True)
    assert robot_position("GG") == ((0, 2), "N", False)
    assert robot_position("GL") == ((0, 1), "W", True)
    assert robot_position("") == ((0, 0), "N", True)
    assert robot_position("RRRR") == ((0, 0), "N", True)
    assert robot_position("GR") == ((0, 1), "E", True)


def test_c_first_repeated_state():
    assert first_repeated_state(3, lambda x: (x * x + 1) % 10) == (1, 6)
    assert first_repeated_state(0, lambda x: x) == (0, 1)
    assert first_repeated_state(1, lambda x: (x + 1) % 5) == (0, 5)


def test_d_bank_simulation():
    assert bank_simulation([(0, 5), (1, 3), (2, 4), (2, 6)], 2) == {"average_wait": 1.25, "max_wait": 3, "last_finish": 11}
    assert bank_simulation([(0, 5), (1, 3), (2, 4), (6, 2)], 2) == {"average_wait": 0.5, "max_wait": 2, "last_finish": 8}
    assert bank_simulation([(0, 2), (10, 2)], 1) == {"average_wait": 0.0, "max_wait": 0, "last_finish": 12}
    assert bank_simulation([(0, 4), (0, 4), (0, 4)], 1) == {"average_wait": 4.0, "max_wait": 8, "last_finish": 12}
    assert bank_simulation([], 3) == {"average_wait": 0.0, "max_wait": 0, "last_finish": 0}


if __name__ == "__main__":
    ejecutar(globals())
