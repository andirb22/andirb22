"""
Grafos y árboles reportados en EPAM: Word Ladder (BFS), Number of Islands,
vista superior de un árbol binario y recorrido diagonal.

Regla práctica: camino más corto en grafo sin pesos -> BFS. Explorar componentes -> DFS o BFS.
"""
from collections import deque
from dataclasses import dataclass


def word_ladder(inicio: str, fin: str, palabras: list[str]) -> int:
    """Longitud de la secuencia más corta de inicio a fin cambiando una letra a la vez
    (cada palabra intermedia debe estar en la lista). 0 si no existe.
    Truco: indexar por patrones ("h*t") para no comparar todas contra todas."""
    if fin not in palabras:
        return 0
    patrones: dict[str, list[str]] = {}
    for p in palabras + [inicio]:
        for i in range(len(p)):
            patrones.setdefault(p[:i] + "*" + p[i + 1:], []).append(p)

    cola, vistos = deque([(inicio, 1)]), {inicio}
    while cola:
        palabra, pasos = cola.popleft()
        if palabra == fin:
            return pasos
        for i in range(len(palabra)):
            for vecina in patrones.get(palabra[:i] + "*" + palabra[i + 1:], []):
                if vecina not in vistos:
                    vistos.add(vecina)
                    cola.append((vecina, pasos + 1))
    return 0


def numero_de_islas(grid: list[list[str]]) -> int:
    """Cuenta componentes de '1' conectadas en 4 direcciones. BFS iterativo (evita
    el límite de recursión de Python en grids grandes). O(filas*columnas)."""
    if not grid:
        return 0
    filas, cols = len(grid), len(grid[0])
    vistos = set()
    islas = 0
    for r in range(filas):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in vistos:
                islas += 1
                cola = deque([(r, c)])
                vistos.add((r, c))
                while cola:
                    x, y = cola.popleft()
                    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                        if 0 <= nx < filas and 0 <= ny < cols and grid[nx][ny] == "1" and (nx, ny) not in vistos:
                            vistos.add((nx, ny))
                            cola.append((nx, ny))
    return islas


@dataclass
class Nodo:
    val: int
    izq: "Nodo | None" = None
    der: "Nodo | None" = None


def vista_superior(raiz: Nodo | None) -> list[int]:
    """El primer nodo visible desde arriba en cada distancia horizontal.
    BFS (no DFS) para que gane el nodo de menor profundidad."""
    if not raiz:
        return []
    primero: dict[int, int] = {}
    cola = deque([(raiz, 0)])
    while cola:
        nodo, hd = cola.popleft()
        primero.setdefault(hd, nodo.val)
        if nodo.izq:
            cola.append((nodo.izq, hd - 1))
        if nodo.der:
            cola.append((nodo.der, hd + 1))
    return [primero[k] for k in sorted(primero)]


def recorrido_diagonal(raiz: Nodo | None) -> list[list[int]]:
    """Nodos agrupados por diagonal: ir a la derecha mantiene la diagonal, ir a la izquierda suma 1."""
    diagonales: dict[int, list[int]] = {}

    def dfs(nodo, d):
        if not nodo:
            return
        diagonales.setdefault(d, []).append(nodo.val)
        dfs(nodo.izq, d + 1)
        dfs(nodo.der, d)

    dfs(raiz, 0)
    return [diagonales[d] for d in sorted(diagonales)]


def altura(raiz: Nodo | None) -> int:
    return 0 if not raiz else 1 + max(altura(raiz.izq), altura(raiz.der))


if __name__ == "__main__":
    assert word_ladder("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]) == 5
    assert word_ladder("hit", "cog", ["hot", "dot", "dog", "lot", "log"]) == 0

    grid = [list("11000"), list("11000"), list("00100"), list("00011")]
    assert numero_de_islas(grid) == 3 and numero_de_islas([]) == 0

    #         1
    #       /   \
    #      2     3
    #       \   / \
    #        4 6   7
    #         \
    #          5
    arbol = Nodo(1, Nodo(2, None, Nodo(4, None, Nodo(5))), Nodo(3, Nodo(6), Nodo(7)))
    assert vista_superior(arbol) == [2, 1, 3, 7]
    assert recorrido_diagonal(arbol) == [[1, 3, 7], [2, 4, 5, 6]]
    assert altura(arbol) == 4
    print("OK - grafos y árboles")
