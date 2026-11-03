"""
EJERCICIO 04 — Predice la salida (sin ejecutar el código)
Tema: trampas clásicas de Python: argumentos mutables, closures, MRO, excepciones,
generadores, referencias
Basado en: fragmentos de "predice la salida" reportados en EPAM (herencia múltiple,
raise from, orden de except, decoradores) — LeetCode Discuss
Tiempo sugerido: 15 min

ENUNCIADO
---------
Abajo hay 10 fragmentos de código. Cada uno deja un valor en la variable `resultado`.
Escribe en el diccionario RESPUESTAS el valor que crees que tendrá `resultado`, como un
valor de Python (lista, str, número, tupla...). Hazlo SIN ejecutar los fragmentos.

Después corre las pruebas: te dirán cuáles acertaste. Para cada fallo, antes de mirar
la respuesta, intenta explicar POR QUÉ, como lo harías en la entrevista.

Ejecutar pruebas:  python TGI_SOLUCIONES/python/04_predice_la_salida.py
"""
from _pruebas import ejecutar

FRAGMENTOS = {
    # 1) Argumento por defecto mutable
    1: """
def agregar(x, lista=[]):
    lista.append(x)
    return lista

agregar(1)
resultado = agregar(2)
""",
    # 2) Closures dentro de un bucle
    2: """
funciones = [lambda: i for i in range(3)]
resultado = [f() for f in funciones]
""",
    # 3) Listas multiplicadas
    3: """
tablero = [[0] * 2] * 2
tablero[0][0] = 1
resultado = tablero
""",
    # 4) MRO con super() cooperativo (orden de los prints)
    4: """
orden = []
class A:
    def hola(self): orden.append("A")
class B(A):
    def hola(self): orden.append("B"); super().hola()
class C(A):
    def hola(self): orden.append("C"); super().hola()
class D(B, C):
    def hola(self): orden.append("D"); super().hola()
D().hola()
resultado = "".join(orden)
""",
    # 5) return dentro de finally
    5: """
def f():
    try:
        return "try"
    finally:
        return "finally"
resultado = f()
""",
    # 6) Generadores se agotan
    6: """
g = (x * 2 for x in range(3))
primera = list(g)
segunda = list(g)
resultado = (primera, segunda)
""",
    # 7) Atributo de clase mutable
    7: """
class Carrito:
    items = []
    def agregar(self, x):
        self.items.append(x)
a, b = Carrito(), Carrito()
a.agregar("pan")
resultado = b.items
""",
    # 8) raise ... from ... (¿qué guarda __cause__?)
    8: """
try:
    try:
        {}["clave"]
    except KeyError as e:
        raise ValueError("no encontrado") from e
except ValueError as err:
    resultado = type(err.__cause__).__name__
""",
    # 9) Orden de los except
    9: """
def clasificar():
    try:
        int("abc")
    except Exception:
        return "Exception"
    except ValueError:
        return "ValueError"
resultado = clasificar()
""",
    # 10) Decoradores apilados (¿en qué orden se ejecutan?)
    10: """
log = []
def deco(nombre):
    def envoltura(f):
        log.append("aplica " + nombre)
        def interna():
            log.append("entra " + nombre)
            return f()
        return interna
    return envoltura

@deco("A")
@deco("B")
def saludo():
    log.append("saludo")

saludo()
resultado = log
""",
}

# ---------------------------------------------------------------------------
# TUS RESPUESTAS: reemplaza cada None por el valor que esperas en `resultado`
# ---------------------------------------------------------------------------
RESPUESTAS = {
    1: None,
    2: None,
    3: None,
    4: None,
    5: None,
    6: None,
    7: None,
    8: None,
    9: None,
    10: None,
}


# ============================================================================
# PRUEBAS — no modificar
# ============================================================================
def _probar(n):
    if RESPUESTAS[n] is None:
        raise NotImplementedError
    espacio: dict = {}
    exec(FRAGMENTOS[n], espacio)
    real = espacio["resultado"]
    assert RESPUESTAS[n] == real, f"respondiste {RESPUESTAS[n]!r}, el resultado real es {real!r}"


def test_01(): _probar(1)
def test_02(): _probar(2)
def test_03(): _probar(3)
def test_04(): _probar(4)
def test_05(): _probar(5)
def test_06(): _probar(6)
def test_07(): _probar(7)
def test_08(): _probar(8)
def test_09(): _probar(9)
def test_10(): _probar(10)


if __name__ == "__main__":
    ejecutar(globals())
