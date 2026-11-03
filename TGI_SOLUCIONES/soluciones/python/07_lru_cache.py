"""
LRU Cache (reportado en EPAM: "Design LRU Cache", a veces "sin clases de la librería estándar").

get y put en O(1). Idea: diccionario (clave -> nodo) + lista doblemente enlazada
ordenada por uso (más reciente al frente, menos reciente al final).

Se dan dos versiones:
1. Con OrderedDict (lo que harías en producción; menciónalo primero).
2. Manual con lista doblemente enlazada (lo que suelen pedir para ver estructuras de datos).
Extra Senior: versión thread-safe con un Lock.
"""
import threading
from collections import OrderedDict


class LRUCacheOrderedDict:
    def __init__(self, capacity: int):
        if capacity <= 0:
            raise ValueError("capacity debe ser > 0")
        self.capacity = capacity
        self.data: OrderedDict = OrderedDict()

    def get(self, key, default=None):
        if key not in self.data:
            return default
        self.data.move_to_end(key)  # marcar como usado recientemente
        return self.data[key]

    def put(self, key, value) -> None:
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)  # expulsa el menos usado


class _Node:
    __slots__ = ("key", "value", "prev", "next")

    def __init__(self, key=None, value=None):
        self.key, self.value = key, value
        self.prev = self.next = None


class LRUCache:
    """Versión manual. head/tail son centinelas para evitar casos borde con None."""

    def __init__(self, capacity: int):
        if capacity <= 0:
            raise ValueError("capacity debe ser > 0")
        self.capacity = capacity
        self.map: dict = {}
        self.head, self.tail = _Node(), _Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node: _Node) -> None:
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node: _Node) -> None:
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key, default=None):
        node = self.map.get(key)
        if node is None:
            return default
        self._remove(node)
        self._add_front(node)
        return node.value

    def put(self, key, value) -> None:
        node = self.map.get(key)
        if node:
            node.value = value
            self._remove(node)
            self._add_front(node)
            return
        if len(self.map) == self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]
        node = _Node(key, value)
        self.map[key] = node
        self._add_front(node)

    def __len__(self):
        return len(self.map)


class ThreadSafeLRUCache(LRUCache):
    """get también modifica la estructura (mueve el nodo), así que también necesita lock."""

    def __init__(self, capacity: int):
        super().__init__(capacity)
        self._lock = threading.Lock()

    def get(self, key, default=None):
        with self._lock:
            return super().get(key, default)

    def put(self, key, value) -> None:
        with self._lock:
            super().put(key, value)


def _probar(cls):
    c = cls(2)
    c.put(1, "a")
    c.put(2, "b")
    assert c.get(1) == "a"  # 1 pasa a ser el más reciente
    c.put(3, "c")  # expulsa 2
    assert c.get(2) is None
    c.put(4, "d")  # expulsa 1
    assert c.get(1) is None and c.get(3) == "c" and c.get(4) == "d"
    c.put(3, "C")  # actualizar no cambia el tamaño
    assert c.get(3) == "C"


if __name__ == "__main__":
    for cls in (LRUCacheOrderedDict, LRUCache, ThreadSafeLRUCache):
        _probar(cls)

    cache = ThreadSafeLRUCache(100)
    hilos = [threading.Thread(target=lambda i=i: [cache.put(j, j) for j in range(i, i + 500)]) for i in range(8)]
    for h in hilos:
        h.start()
    for h in hilos:
        h.join()
    assert len(cache) == 100
    print("OK - LRU cache")
