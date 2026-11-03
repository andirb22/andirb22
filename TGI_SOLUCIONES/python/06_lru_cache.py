"""
EJERCICIO 06 — LRU Cache desde cero
Tema: estructuras de datos (hash map + lista doblemente enlazada), complejidad O(1)
Basado en: "Design LRU Cache" e "implementa sin clases de la librería estándar"
(reportados en EPAM: TechPrep, Hacking the Case)
Tiempo sugerido: 30 min

CONTEXTO
--------
Un servicio de catálogo consulta precios en una base de datos lenta. Queremos guardar
en memoria los N productos más usados recientemente (Least Recently Used): cuando se
llena, se expulsa el que lleva más tiempo sin usarse.

ENUNCIADO
---------
Implementa la clase `LRUCache(capacidad)` con:

    get(clave, default=None)  -> valor guardado, o default si no está
    put(clave, valor)         -> guarda o actualiza
    len(cache)                -> número de elementos
    clave in cache            -> True/False
    cache.stats()             -> {"hits": int, "misses": int, "expulsiones": int}

REQUISITOS
----------
1. get y put en O(1). (Las pruebas incluyen una de rendimiento con 300.000 operaciones.)
2. PROHIBIDO usar collections.OrderedDict, functools.lru_cache o cualquier caché ya hecha.
   Sí puedes usar un dict normal.
3. get de una clave existente la marca como "usada recientemente". put también
   (tanto al insertar como al actualizar).
4. `clave in cache` NO cambia el orden de uso y no cuenta como hit ni miss.
5. Al insertar una clave NUEVA con la caché llena, se expulsa la menos usada recientemente.
   Actualizar una clave existente nunca expulsa a nadie.
6. hits/misses solo los cuenta get. "expulsiones" cuenta los elementos expulsados.
7. `capacidad < 1` lanza ValueError.

BONUS
-----
Haz una subclase `LRUCacheThreadSafe` que se pueda usar desde varios hilos.
Pregunta trampa: ¿get también necesita el lock, si "solo lee"?

PARA PENSAR
-----------
- ¿Por qué una lista doblemente enlazada y no una lista de Python normal?
- ¿Qué cambia si el caché vive en 5 instancias del servicio detrás de un balanceador?
  (pista: Redis / ElastiCache)

Ejecutar pruebas:  python TGI_SOLUCIONES/python/06_lru_cache.py
"""
import threading  # noqa: F401  (para el bonus)

from _pruebas import ejecutar


class LRUCache:
    def __init__(self, capacidad: int):
        # TODO: tu solución aquí
        raise NotImplementedError

    def get(self, clave, default=None):
        raise NotImplementedError

    def put(self, clave, valor) -> None:
        raise NotImplementedError

    def __len__(self) -> int:
        raise NotImplementedError

    def __contains__(self, clave) -> bool:
        raise NotImplementedError

    def stats(self) -> dict:
        raise NotImplementedError


class LRUCacheThreadSafe(LRUCache):
    """BONUS: versión segura para varios hilos."""
    # TODO: tu solución aquí


# ============================================================================
# PRUEBAS — no modificar
# ============================================================================
def test_basico():
    c = LRUCache(2)
    c.put("a", 1)
    c.put("b", 2)
    assert c.get("a") == 1
    c.put("c", 3)  # expulsa "b" (el menos usado)
    assert c.get("b") is None and c.get("b", "x") == "x"
    assert c.get("a") == 1 and c.get("c") == 3
    assert len(c) == 2


def test_put_tambien_marca_uso():
    c = LRUCache(2)
    c.put("a", 1)
    c.put("b", 2)
    c.put("a", 10)  # actualiza y marca "a" como reciente
    c.put("c", 3)  # debe expulsar "b"
    assert "b" not in c and c.get("a") == 10 and len(c) == 2


def test_contains_no_cambia_el_orden():
    c = LRUCache(2)
    c.put("a", 1)
    c.put("b", 2)
    assert "a" in c  # no debe "refrescar" a "a"
    c.put("c", 3)
    assert "a" not in c and "b" in c


def test_valores_falsy_y_none():
    c = LRUCache(3)
    c.put("cero", 0)
    c.put("nada", None)
    assert c.get("cero", "default") == 0
    assert c.get("nada", "default") is None
    assert "nada" in c


def test_stats():
    c = LRUCache(1)
    c.put("a", 1)
    c.get("a")
    c.get("zzz")
    c.put("b", 2)
    c.put("b", 3)  # actualizar no expulsa
    "a" in c
    assert c.stats() == {"hits": 1, "misses": 1, "expulsiones": 1}, c.stats()


def test_capacidad_invalida():
    for cap in (0, -3):
        try:
            LRUCache(cap)
            raise AssertionError(f"LRUCache({cap}) debió lanzar ValueError")
        except ValueError:
            pass


def test_no_usa_ordereddict():
    import inspect
    import re

    LRUCache(1).put("x", 1)  # primero debe estar implementada
    codigo = inspect.getsource(LRUCache)
    assert not re.search(r"OrderedDict|lru_cache|move_to_end", codigo), \
        "no se permite OrderedDict / lru_cache"


def test_rendimiento_o1():
    import time

    c = LRUCache(1000)
    inicio = time.perf_counter()
    for i in range(150_000):
        c.put(i, i)
        c.get(i - 500)
    duracion = time.perf_counter() - inicio
    assert duracion < 3, f"300.000 operaciones tardaron {duracion:.1f}s: ¿no es O(1)?"
    assert len(c) == 1000


def test_bonus_thread_safe():
    import threading

    c = LRUCacheThreadSafe(50)

    def trabajo(base):
        for i in range(3000):
            c.put((base + i) % 200, i)
            c.get((base + i * 7) % 200)

    hilos = [threading.Thread(target=trabajo, args=(k * 13,)) for k in range(8)]
    for h in hilos:
        h.start()
    for h in hilos:
        h.join()
    assert len(c) == 50, f"tamaño {len(c)}: la estructura se corrompió con varios hilos"
    s = c.stats()
    assert s["hits"] + s["misses"] == 8 * 3000


if __name__ == "__main__":
    ejecutar(globals())
