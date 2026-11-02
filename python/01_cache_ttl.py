"""
EJERCICIO 01 — Decorador de caché con expiración (TTL)
Tema: decoradores, closures, functools.wraps
Basado en: "escribe un decorador" (live coding de 10-15 min reportado en EPAM, Glassdoor 2025)
Tiempo sugerido: 20 min

CONTEXTO
--------
Una API llama a un servicio externo lento para obtener el tipo de cambio. El valor
cambia poco, así que queremos cachear el resultado durante unos segundos.

ENUNCIADO
---------
Implementa el decorador con argumentos `cache_ttl(segundos, reloj=time.monotonic)`:

    @cache_ttl(segundos=60)
    def tipo_cambio(origen, destino):
        ...

REQUISITOS
----------
1. La primera llamada con unos argumentos ejecuta la función y guarda el resultado.
   Las siguientes llamadas con los MISMOS argumentos, antes de que pasen `segundos`,
   devuelven el valor guardado sin ejecutar la función.
2. Pasado el tiempo (ahora - momento_guardado >= segundos), el valor expira y la función
   se vuelve a ejecutar.
3. Los argumentos con nombre cuentan, y su orden NO importa:
   f(1, b=2, c=3) y f(1, c=3, b=2) son la misma entrada.
4. Si la función lanza una excepción, NO se guarda nada y la excepción se propaga.
5. La función decorada conserva su __name__ y __doc__.
6. La función decorada expone:
     - .cache_clear()  -> vacía la caché
     - .cache_info()   -> dict {"hits": int, "misses": int, "size": int}
       (hit = respondió desde caché; miss = tuvo que ejecutar la función;
        size = entradas guardadas en este momento, contando también las expiradas que
        aún no se hayan reemplazado)
7. `segundos <= 0` lanza ValueError al crear el decorador.
8. `reloj` es una función sin argumentos que devuelve la hora en segundos. Se inyecta
   para poder probar sin esperar (las pruebas usan un reloj falso).

PARA PENSAR (lo que te preguntaría el entrevistador)
----------------------------------------------------
- ¿Qué pasa si un argumento no es hashable (una lista)? ¿Cómo lo manejarías?
- ¿Y si 10 hilos piden el mismo valor expirado a la vez? (cache stampede)
- ¿Cómo crece la memoria? ¿Cómo limitarías el tamaño?

Ejecutar pruebas:  python python/01_cache_ttl.py
"""
import functools  # noqa: F401  (lo vas a necesitar)
import time

from _pruebas import ejecutar


def cache_ttl(segundos: float, reloj=time.monotonic):
    # TODO: tu solución aquí
    raise NotImplementedError


# ============================================================================
# PRUEBAS — no modificar
# ============================================================================
class _Reloj:
    def __init__(self):
        self.t = 1000.0

    def __call__(self):
        return self.t


def _crear():
    reloj = _Reloj()
    llamadas = []

    @cache_ttl(segundos=10, reloj=reloj)
    def tipo_cambio(origen, destino="USD", redondeo=2):
        """Consulta el tipo de cambio."""
        llamadas.append((origen, destino, redondeo))
        return f"{origen}->{destino}:{len(llamadas)}"

    return tipo_cambio, reloj, llamadas


def test_cachea_misma_entrada():
    f, _, llamadas = _crear()
    assert f("COP") == f("COP") == "COP->USD:1"
    assert len(llamadas) == 1, "la función se ejecutó más de una vez"


def test_argumentos_distintos_no_comparten_cache():
    f, _, llamadas = _crear()
    f("COP")
    f("EUR")
    assert len(llamadas) == 2


def test_expira_despues_del_ttl():
    f, reloj, llamadas = _crear()
    f("COP")
    reloj.t += 9.99
    f("COP")
    assert len(llamadas) == 1, "expiró antes de tiempo"
    reloj.t += 0.01
    assert f("COP") == "COP->USD:2", "no expiró al cumplirse el TTL"


def test_kwargs_en_cualquier_orden():
    f, _, llamadas = _crear()
    f("COP", destino="EUR", redondeo=4)
    f("COP", redondeo=4, destino="EUR")
    assert len(llamadas) == 1


def test_no_cachea_excepciones():
    reloj = _Reloj()
    intentos = []

    @cache_ttl(5, reloj=reloj)
    def inestable(x):
        intentos.append(x)
        if len(intentos) == 1:
            raise ConnectionError("caído")
        return "ok"

    try:
        inestable(1)
        raise AssertionError("debió propagar la excepción")
    except ConnectionError:
        pass
    assert inestable(1) == "ok" and len(intentos) == 2


def test_conserva_metadatos():
    f, _, _ = _crear()
    assert f.__name__ == "tipo_cambio"
    assert f.__doc__ == "Consulta el tipo de cambio."


def test_cache_info_y_clear():
    f, _, llamadas = _crear()
    f("COP")
    f("COP")
    f("EUR")
    assert f.cache_info() == {"hits": 1, "misses": 2, "size": 2}, f.cache_info()
    f.cache_clear()
    assert f.cache_info()["size"] == 0
    f("COP")
    assert len(llamadas) == 3


def test_ttl_invalido():
    for valor in (0, -1):
        try:
            cache_ttl(valor)
            raise AssertionError(f"cache_ttl({valor}) debió lanzar ValueError")
        except ValueError:
            pass


if __name__ == "__main__":
    ejecutar(globals())
