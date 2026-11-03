"""
EXERCISE 13 — Queues with collections.deque
Topics: FIFO queues, deque.popleft / append / rotate, simulation loops
Suggested time: 30 min

Why deque? list.pop(0) is O(n) because every element shifts; deque.popleft() is O(1).

PROBLEMS
--------
A) print_order(jobs, my_index) -> int
   A shared printer has a queue of jobs, each one a priority number. Repeat:
     1. Take the job at the front of the queue.
     2. If ANY job still waiting has a higher priority, put this job at the back.
     3. Otherwise, print it.
   Return in which position (1-based) the job that started at `my_index` is printed.
       print_order([2, 1, 3, 2], 2) -> 1     (the 3 is printed first)
       print_order([1, 1, 9, 1, 1, 1], 0) -> 5

B) hot_potato(players, k) -> str
   Players stand in a circle (a list of names). Starting from the first player, the
   potato is passed k times; whoever holds it is eliminated and the game continues
   from the NEXT player. Return the name of the last player standing.
   Use deque.rotate. (This is the Josephus problem.)
       hot_potato(["Ana", "Ben", "Cris", "Dan", "Eva"], 2) -> "Dan"

C) class RecentCounter
   ping(t) records a request at time t (milliseconds, always increasing) and returns how
   many requests happened in the inclusive window [t - 3000, t].
       ping(1) -> 1, ping(100) -> 2, ping(3001) -> 3, ping(3002) -> 3
   Each ping must be amortized O(1): drop old timestamps from the front of a deque.

D) process_tickets(tickets, agents) -> list[tuple[str, str, int]]
   A support center has a queue of tickets (ticket_id, minutes) in arrival order and a
   list of agent names. Every agent is free at minute 0. Each ticket goes to the agent
   that becomes free FIRST (ties: the agent listed first). Return a list of
   (ticket_id, agent, finish_minute) in the order tickets are assigned.
       process_tickets([("T1", 5), ("T2", 3), ("T3", 2)], ["A", "B"])
       -> [("T1", "A", 5), ("T2", "B", 3), ("T3", "B", 5)]

FOLLOW-UP
---------
- What is the complexity of A? Can you avoid scanning the whole queue on every step?
- In D, what data structure would make "the agent that becomes free first" O(log n)?
- Where do queues appear in real systems? (SQS, Celery, Kafka, the browser event loop)

Run the tests:  python TGI_SOLUCIONES/python/13_queues_deque.py
"""
from collections import deque  # noqa: F401

from _pruebas import ejecutar


def print_order(jobs: list[int], my_index: int) -> int:
    # TODO
    raise NotImplementedError


def hot_potato(players: list[str], k: int) -> str:
    # TODO
    raise NotImplementedError


class RecentCounter:
    def __init__(self):
        # TODO
        raise NotImplementedError

    def ping(self, t: int) -> int:
        raise NotImplementedError


def process_tickets(tickets: list[tuple[str, int]], agents: list[str]) -> list[tuple[str, str, int]]:
    # TODO
    raise NotImplementedError


# ============================================================================
# TESTS — do not modify
# ============================================================================
def test_a_print_order():
    assert print_order([2, 1, 3, 2], 2) == 1
    assert print_order([1, 1, 9, 1, 1, 1], 0) == 5
    assert print_order([5], 0) == 1
    assert print_order([1, 2, 3], 0) == 3


def test_b_hot_potato():
    assert hot_potato(["Ana", "Ben", "Cris", "Dan", "Eva"], 2) == "Dan"
    assert hot_potato(["Ana", "Ben", "Cris"], 0) == "Cris"
    assert hot_potato(["Solo"], 7) == "Solo"
    players = ["a", "b", "c"]
    hot_potato(players, 1)
    assert players == ["a", "b", "c"], "do not modify the input list"


def test_c_recent_counter():
    rc = RecentCounter()
    assert [rc.ping(t) for t in (1, 100, 3001, 3002)] == [1, 2, 3, 3]
    rc2 = RecentCounter()
    assert rc2.ping(10_000) == 1 and rc2.ping(20_000) == 1


def test_c_recent_counter_is_fast():
    import time
    rc = RecentCounter()
    start = time.perf_counter()
    for t in range(0, 600_000, 2):
        rc.ping(t)
    assert time.perf_counter() - start < 2, "too slow: are you using list.pop(0) or scanning everything?"


def test_d_process_tickets():
    assert process_tickets([("T1", 5), ("T2", 3), ("T3", 2)], ["A", "B"]) == [
        ("T1", "A", 5), ("T2", "B", 3), ("T3", "B", 5)]
    assert process_tickets([("X", 4), ("Y", 4), ("Z", 1)], ["A", "B"]) == [
        ("X", "A", 4), ("Y", "B", 4), ("Z", "A", 5)], "ties go to the agent listed first"
    assert process_tickets([], ["A"]) == []


if __name__ == "__main__":
    ejecutar(globals())
