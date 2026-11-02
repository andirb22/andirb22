"""
Implementar un HashMap sin usar dict (reportado en EPAM: "Design HashMap sin clases
de la librería estándar").

Diseño: arreglo de "buckets" con encadenamiento separado (cada bucket es una lista de
pares). Al superar un factor de carga de 0.75 se duplica la capacidad y se re-insertan
todos los elementos (rehash) -> operaciones O(1) amortizadas.

Cosas a mencionar:
- hash(key) % capacidad elige el bucket; dos claves distintas pueden colisionar.
- Peor caso O(n) si todas colisionan (Java 8 convierte buckets grandes en árboles).
- Las claves deben ser inmutables / hashables: si el hash cambia, la clave "se pierde".
- Alternativa: direccionamiento abierto (sondeo lineal), que es lo que usa el dict de CPython.
"""


class HashMap:
    _VACIO = object()

    def __init__(self, capacity: int = 8, load_factor: float = 0.75):
        self._capacity = capacity
        self._load_factor = load_factor
        self._size = 0
        self._buckets = [[] for _ in range(capacity)]

    def _index(self, key) -> int:
        return hash(key) % self._capacity

    def put(self, key, value) -> None:
        bucket = self._buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))
        self._size += 1
        if self._size / self._capacity > self._load_factor:
            self._resize(self._capacity * 2)

    def get(self, key, default=None):
        for k, v in self._buckets[self._index(key)]:
            if k == key:
                return v
        return default

    def remove(self, key) -> bool:
        bucket = self._buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self._size -= 1
                return True
        return False

    def _resize(self, new_capacity: int) -> None:
        old = self._buckets
        self._capacity = new_capacity
        self._buckets = [[] for _ in range(new_capacity)]
        self._size = 0
        for bucket in old:
            for k, v in bucket:
                self.put(k, v)

    # Azúcar para que se use como un dict
    def __setitem__(self, key, value):
        self.put(key, value)

    def __getitem__(self, key):
        value = self.get(key, self._VACIO)
        if value is self._VACIO:
            raise KeyError(key)
        return value

    def __contains__(self, key):
        return self.get(key, self._VACIO) is not self._VACIO

    def __len__(self):
        return self._size

    def __iter__(self):
        for bucket in self._buckets:
            for k, _ in bucket:
                yield k


if __name__ == "__main__":
    m = HashMap()
    for i in range(1000):
        m[f"k{i}"] = i
    assert len(m) == 1000 and m["k500"] == 500
    m["k500"] = -1
    assert m["k500"] == -1 and len(m) == 1000
    assert m.remove("k500") and "k500" not in m and len(m) == 999
    assert not m.remove("no-existe")
    assert m.get(None) is None
    m[None] = "ok"  # None también es hashable
    assert m[None] == "ok"
    try:
        m["nada"]
        raise AssertionError
    except KeyError:
        pass
    assert None in set(m) and len(list(m)) == len(m)
    print("OK - HashMap")
