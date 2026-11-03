"""
EJERCICIO 03 — Peticiones concurrentes con límite y timeout
Tema: asyncio (gather, Semaphore, wait_for), manejo de errores parciales
Basado en: "diferencia entre asyncio y threading", "¿cuándo usarías ASGI + async?"
(reportado en EPAM) y la guía: "timeouts, retries, partial outages"
Tiempo sugerido: 25 min

CONTEXTO
--------
Un endpoint de tu API arma un dashboard consultando N microservicios. Si los llamas
uno por uno tarda demasiado; si los llamas todos a la vez puedes tumbar a un servicio.
Y si uno falla o se cuelga, el dashboard debe mostrar el resto igualmente.

ENUNCIADO
---------
Implementa:

    async def obtener_todos(urls, obtener, limite=5, timeout=1.0) -> list[Resultado]

- `urls`: lista de strings.
- `obtener`: corrutina `async def obtener(url) -> Any` que hace la llamada real
  (en las pruebas es falsa). Tú solo la orquestas.

REQUISITOS
----------
1. Devuelve un `Resultado` por cada URL de entrada, EN EL MISMO ORDEN que `urls`.
2. Nunca debe haber más de `limite` llamadas a `obtener` en curso al mismo tiempo.
3. Cada llamada tiene su propio `timeout` en segundos. Si se pasa:
   Resultado(url, ok=False, dato=None, error="timeout").
4. Si `obtener` lanza una excepción: Resultado(url, ok=False, dato=None,
   error=<nombre de la clase de la excepción>), por ejemplo "ConnectionError".
   Un fallo NO debe cancelar ni afectar a las demás llamadas.
5. Si una URL aparece repetida, `obtener` se llama UNA sola vez para ella y el resultado
   se reutiliza en todas sus posiciones.
6. Las llamadas deben ser concurrentes (no una detrás de otra): las pruebas miden el tiempo.
7. `limite < 1` lanza ValueError. Lista vacía devuelve [].

PARA PENSAR
-----------
- ¿Qué diferencia hay entre asyncio.gather(..., return_exceptions=True) y asyncio.TaskGroup?
- Si `obtener` usara la librería `requests` (bloqueante), ¿qué le pasaría a este código?
- ¿Dónde agregarías reintentos con backoff? ¿Reintentarías un 400? ¿Y un 503?

Ejecutar pruebas:  python TGI_SOLUCIONES/python/03_peticiones_concurrentes.py
"""
import asyncio
import time
from dataclasses import dataclass
from typing import Any, Awaitable, Callable

from _pruebas import ejecutar


@dataclass
class Resultado:
    url: str
    ok: bool
    dato: Any = None
    error: str | None = None


async def obtener_todos(
    urls: list[str],
    obtener: Callable[[str], Awaitable[Any]],
    limite: int = 5,
    timeout: float = 1.0,
) -> list[Resultado]:
    # TODO: tu solución aquí
    raise NotImplementedError


# ============================================================================
# PRUEBAS — no modificar
# ============================================================================
class _Servicio:
    """Simula servicios: 'lento' tarda mucho, 'roto' lanza error, el resto tarda 0.1s."""

    def __init__(self):
        self.en_curso = 0
        self.maximo = 0
        self.llamadas: list[str] = []

    async def __call__(self, url: str):
        self.llamadas.append(url)
        self.en_curso += 1
        self.maximo = max(self.maximo, self.en_curso)
        try:
            if "lento" in url:
                await asyncio.sleep(5)
            await asyncio.sleep(0.1)
            if "roto" in url:
                raise ConnectionError("servicio caído")
            return url.upper()
        finally:
            self.en_curso -= 1


async def test_orden_y_resultados():
    s = _Servicio()
    r = await obtener_todos(["a", "b", "c"], s)
    assert [x.url for x in r] == ["a", "b", "c"]
    assert all(x.ok for x in r) and [x.dato for x in r] == ["A", "B", "C"]


async def test_son_concurrentes():
    s = _Servicio()
    inicio = time.perf_counter()
    await obtener_todos([f"u{i}" for i in range(10)], s, limite=10)
    duracion = time.perf_counter() - inicio
    assert duracion < 0.5, f"tardó {duracion:.2f}s: parece que las llamadas son secuenciales"


async def test_respeta_el_limite():
    s = _Servicio()
    await obtener_todos([f"u{i}" for i in range(12)], s, limite=3)
    assert s.maximo == 3, f"hubo {s.maximo} llamadas simultáneas (límite 3)"


async def test_timeout_y_errores_no_afectan_al_resto():
    s = _Servicio()
    inicio = time.perf_counter()
    r = await obtener_todos(["ok1", "lento", "roto", "ok2"], s, timeout=0.3)
    assert time.perf_counter() - inicio < 1.5, "no se respetó el timeout"
    assert r[0] == Resultado("ok1", True, "OK1", None)
    assert r[1] == Resultado("lento", False, None, "timeout"), r[1]
    assert r[2] == Resultado("roto", False, None, "ConnectionError"), r[2]
    assert r[3] == Resultado("ok2", True, "OK2", None)


async def test_urls_repetidas_una_sola_llamada():
    s = _Servicio()
    r = await obtener_todos(["a", "b", "a", "a"], s)
    assert sorted(s.llamadas) == ["a", "b"], s.llamadas
    assert [x.dato for x in r] == ["A", "B", "A", "A"]


async def test_casos_borde():
    assert await obtener_todos([], _Servicio()) == []
    try:
        await obtener_todos(["a"], _Servicio(), limite=0)
        raise AssertionError("limite=0 debió lanzar ValueError")
    except ValueError:
        pass


if __name__ == "__main__":
    ejecutar(globals())
