"""
EJERCICIO 08 — Algoritmos clásicos (estilo assessment online / live coding)
Tema: pila, ventana deslizante, ordenamiento, "next permutation"
Basado en: paréntesis válidos, anagramas/ventana deslizante, next bigger number,
arrays y strings (los temas más frecuentes reportados en EPAM)
Tiempo sugerido: 10-15 min por función

Para cada función: di primero la idea de fuerza bruta y su complejidad, luego optimiza,
y menciona los casos borde antes de escribir código (como recomienda la guía).

A) parentesis_validos(s: str) -> bool
   Los delimitadores (), [] y {} deben cerrarse en el orden correcto. Cualquier otro
   carácter se ignora.
     "f(a[1]) { }" -> True      "(]" -> False      ")(" -> False      "" -> True
   Objetivo: O(n).

B) subcadena_sin_repetir(s: str) -> tuple[int, str]
   Longitud y texto de la subcadena (contigua) más larga sin caracteres repetidos.
   Si hay empate, la que aparece primero.
     "abcabcbb" -> (3, "abc")    "bbbbb" -> (1, "b")    "pwwkew" -> (3, "wke")    "" -> (0, "")
   Objetivo: O(n) con ventana deslizante.

C) fusionar_intervalos(intervalos: list[tuple[int, int]]) -> list[tuple[int, int]]
   Fusiona intervalos que se solapan o se tocan; resultado ordenado. No modifiques la entrada.
     [(8, 10), (1, 3), (2, 6), (15, 18)] -> [(1, 6), (8, 10), (15, 18)]
     [(1, 4), (4, 5)] -> [(1, 5)]
   Uso real: unir franjas horarias ocupadas en un calendario.
   Objetivo: O(n log n).

D) siguiente_mayor(n: int) -> int
   El siguiente número mayor que n formado con exactamente los mismos dígitos, o -1.
     12 -> 21    2017 -> 2071    513 -> 531    531 -> -1    9 -> -1
   Objetivo: O(d), d = cantidad de dígitos. No generes todas las permutaciones.

E) top_k_frecuentes(palabras: list[str], k: int) -> list[str]
   Las k palabras más frecuentes, de más a menos frecuente; en empate, orden alfabético.
   Sin distinguir mayúsculas (devuélvelas en minúscula).
     (["b", "A", "a", "c", "b", "B"], 2) -> ["b", "a"]
   Pregunta extra: ¿cómo lo harías si las palabras vienen de un stream infinito?

Ejecutar pruebas:  python TGI_SOLUCIONES/python/08_algoritmos.py
"""
from _pruebas import ejecutar


def parentesis_validos(s: str) -> bool:
    # TODO
    raise NotImplementedError


def subcadena_sin_repetir(s: str) -> tuple[int, str]:
    # TODO
    raise NotImplementedError


def fusionar_intervalos(intervalos: list[tuple[int, int]]) -> list[tuple[int, int]]:
    # TODO
    raise NotImplementedError


def siguiente_mayor(n: int) -> int:
    # TODO
    raise NotImplementedError


def top_k_frecuentes(palabras: list[str], k: int) -> list[str]:
    # TODO
    raise NotImplementedError


# ============================================================================
# PRUEBAS — no modificar
# ============================================================================
def test_a_parentesis():
    casos = {
        "f(a[1]) { }": True, "": True, "([]{})": True, "(]": False,
        ")(": False, "((": False, "{[}]": False, "sin delimitadores": True,
    }
    for s, esperado in casos.items():
        assert parentesis_validos(s) is esperado, f"parentesis_validos({s!r}) debería ser {esperado}"


def test_b_subcadena():
    casos = {
        "abcabcbb": (3, "abc"), "bbbbb": (1, "b"), "pwwkew": (3, "wke"),
        "": (0, ""), "abba": (2, "ab"), "dvdf": (3, "vdf"), "tmmzuxt": (5, "mzuxt"),
    }
    for s, esperado in casos.items():
        assert subcadena_sin_repetir(s) == esperado, f"{s!r}: {subcadena_sin_repetir(s)} != {esperado}"


def test_b_subcadena_es_lineal():
    import string
    import time

    s = (string.ascii_letters * 4000)
    inicio = time.perf_counter()
    assert subcadena_sin_repetir(s)[0] == 52
    assert time.perf_counter() - inicio < 1, "demasiado lento: ¿es O(n)?"


def test_c_intervalos():
    entrada = [(8, 10), (1, 3), (2, 6), (15, 18)]
    copia = list(entrada)
    assert fusionar_intervalos(entrada) == [(1, 6), (8, 10), (15, 18)]
    assert entrada == copia, "no modifiques la lista de entrada"
    assert fusionar_intervalos([(1, 4), (4, 5)]) == [(1, 5)]
    assert fusionar_intervalos([(1, 10), (2, 3), (4, 5)]) == [(1, 10)]
    assert fusionar_intervalos([]) == []


def test_d_siguiente_mayor():
    casos = {12: 21, 2017: 2071, 513: 531, 414: 441, 531: -1, 9: -1, 111: -1, 1234: 1243, 59884848459853: 59884848483559}
    for n, esperado in casos.items():
        assert siguiente_mayor(n) == esperado, f"siguiente_mayor({n}) = {siguiente_mayor(n)}, esperado {esperado}"


def test_e_top_k():
    assert top_k_frecuentes(["b", "A", "a", "c", "b", "B"], 2) == ["b", "a"]
    assert top_k_frecuentes(["x", "y", "z"], 2) == ["x", "y"]
    assert top_k_frecuentes(["x"], 5) == ["x"]
    assert top_k_frecuentes([], 3) == []


if __name__ == "__main__":
    ejecutar(globals())
