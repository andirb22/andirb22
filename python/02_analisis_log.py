"""
EJERCICIO 02 — Analizar un log de accesos enorme (streaming + async)
Tema: archivos grandes, generadores, asyncio sin bloquear el event loop
Basado en: "procesa un archivo de log de 10 GB de forma asíncrona" (reportado en EPAM, Glassdoor 2025)
Tiempo sugerido: 30-40 min

CONTEXTO
--------
Producción reporta lentitud. Tienes el access log del API Gateway (puede pesar 10 GB)
y necesitas un resumen rápido para encontrar el problema.

Formato de cada línea (campos separados por un espacio):

    2026-11-02T10:00:01Z GET /api/users?page=2 200 123ms

    fecha  método  ruta(+query opcional)  status  latencia_en_ms

ENUNCIADO
---------
1. Implementa `analizar_log(ruta: str) -> dict` (síncrona).
2. Implementa `async def analizar_log_async(ruta: str) -> dict`, que devuelve exactamente
   lo mismo pero SIN bloquear el event loop mientras lee el archivo.

El dict resultante debe tener esta forma:

    {
        "total": 6,                       # líneas válidas
        "invalidas": 1,                   # líneas que no cumplen el formato (se ignoran)
        "por_status": {200: 4, 500: 2},   # conteo por código HTTP (claves int)
        "errores_5xx": {"/api/pagos": 2}, # cuántos 5xx tuvo cada endpoint
        "mas_lentos": [("/api/pagos", 850.0), ("/api/users", 110.5)],
    }

REQUISITOS
----------
1. NO cargues el archivo entero en memoria (nada de read() ni readlines() sin límite).
   Procesa línea a línea o por lotes.
2. El endpoint es la ruta SIN query string: "/api/users?page=2" cuenta como "/api/users".
3. Una línea es inválida si no tiene exactamente 5 campos, si el status no es un entero
   entre 100 y 599, o si la latencia no tiene la forma "<entero>ms". Las líneas vacías
   se ignoran sin contarlas como inválidas.
4. "mas_lentos": los 3 endpoints con mayor latencia PROMEDIO, de mayor a menor,
   redondeada a 1 decimal. En empate, orden alfabético del endpoint. Si hay menos de 3
   endpoints, devuelve los que haya.
5. "errores_5xx" solo incluye endpoints con al menos un error 5xx.
6. La versión async debe delegar la lectura bloqueante (asyncio.to_thread, run_in_executor
   o similar). Las pruebas comprueban que otra corrutina sigue ejecutándose mientras tanto.

PARA PENSAR
-----------
- ¿Por qué asyncio no hace "asíncrona" la lectura de un archivo local?
- Parsear es trabajo de CPU: ¿threads o procesos para usar todos los núcleos? ¿Cómo
  partirías el archivo para procesarlo en paralelo sin cortar líneas a la mitad?
- ¿Cómo calcularías el p95 de latencia sin guardar todas las latencias?

Ejecutar pruebas:  python python/02_analisis_log.py
"""
import asyncio
import os
import tempfile

from _pruebas import ejecutar


def analizar_log(ruta: str) -> dict:
    # TODO: tu solución aquí
    raise NotImplementedError


async def analizar_log_async(ruta: str) -> dict:
    # TODO: tu solución aquí
    raise NotImplementedError


# ============================================================================
# PRUEBAS — no modificar
# ============================================================================
_EJEMPLO = """\
2026-11-02T10:00:01Z GET /api/users?page=2 200 100ms
2026-11-02T10:00:02Z GET /api/users 200 121ms
2026-11-02T10:00:03Z POST /api/pagos 500 900ms
2026-11-02T10:00:04Z POST /api/pagos 503 800ms
linea corrupta
2026-11-02T10:00:05Z GET /api/health 200 5ms

2026-11-02T10:00:06Z GET /api/health 200 7ms
2026-11-02T10:00:07Z GET /api/users 999 10ms
2026-11-02T10:00:08Z GET /api/users 200 abc
"""

_ESPERADO = {
    "total": 6,
    "invalidas": 3,
    "por_status": {200: 4, 500: 1, 503: 1},
    "errores_5xx": {"/api/pagos": 2},
    "mas_lentos": [("/api/pagos", 850.0), ("/api/users", 110.5), ("/api/health", 6.0)],
}


def _archivo(contenido: str) -> str:
    fd, ruta = tempfile.mkstemp(suffix=".log")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(contenido)
    return ruta


def test_resumen_basico():
    ruta = _archivo(_EJEMPLO)
    try:
        assert analizar_log(ruta) == _ESPERADO, analizar_log(ruta)
    finally:
        os.remove(ruta)


def test_empate_en_latencia_y_menos_de_3_endpoints():
    ruta = _archivo(
        "t GET /b 200 10ms\n"
        "t GET /a 200 10ms\n"
    )
    try:
        r = analizar_log(ruta)
        assert r["mas_lentos"] == [("/a", 10.0), ("/b", 10.0)], r["mas_lentos"]
        assert r["errores_5xx"] == {}
    finally:
        os.remove(ruta)


def test_no_lee_todo_en_memoria():
    import builtins

    original_open = builtins.open
    prohibido = []

    class _Espia:
        def __init__(self, f):
            self._f = f

        def read(self, *a):
            if not a or a[0] is None or a[0] < 0:
                prohibido.append("read()")
            return self._f.read(*a)

        def readlines(self, *a):
            if not a or not a[0] or a[0] <= 0:
                prohibido.append("readlines()")
            return self._f.readlines(*a)

        def __iter__(self):
            return iter(self._f)

        def __enter__(self):
            self._f.__enter__()
            return self

        def __exit__(self, *exc):
            return self._f.__exit__(*exc)

        def __getattr__(self, nombre):
            return getattr(self._f, nombre)

    ruta = _archivo(_EJEMPLO)
    builtins.open = lambda *a, **k: _Espia(original_open(*a, **k))
    try:
        analizar_log(ruta)
    finally:
        builtins.open = original_open
        os.remove(ruta)
    assert not prohibido, f"se usó {prohibido[0]} sin límite: carga todo el archivo"


async def test_version_async_igual_y_no_bloquea():
    lineas = [f"t GET /api/x{i % 7} {200 if i % 10 else 500} {i % 300}ms" for i in range(300_000)]
    ruta = _archivo("\n".join(lineas) + "\n")
    latidos = 0
    terminado = False

    async def latido():
        nonlocal latidos
        while not terminado:
            latidos += 1
            await asyncio.sleep(0.005)

    try:
        tarea = asyncio.create_task(latido())
        r = await analizar_log_async(ruta)
        terminado = True
        await tarea
        assert r == analizar_log(ruta), "la versión async devuelve algo distinto"
        assert latidos > 3, "el event loop estuvo bloqueado mientras se leía el archivo"
    finally:
        os.remove(ruta)


if __name__ == "__main__":
    ejecutar(globals())
