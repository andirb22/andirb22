"""
EJERCICIO 07 — Rate limiter para una API
Tema: diseño de sistemas pequeño, ventana deslizante, inyección del reloj para tests
Basado en: "diseña un rate limiter" (pregunta de diseño reportada en EPAM) y la guía:
"middleware: auth, correlation IDs, rate limiting"
Tiempo sugerido: 25 min

CONTEXTO
--------
Tu API pública está recibiendo abuso de algunos clientes. Quieres limitar cada API key
a `limite` peticiones por cada `ventana` segundos y responder 429 Too Many Requests con
el header Retry-After cuando se pase.

ENUNCIADO
---------
Implementa `LimitadorVentanaDeslizante(limite, ventana, reloj=time.monotonic)` con:

    permitir(cliente: str) -> Decision

`Decision` ya está definida abajo: (permitido: bool, restantes: int, reintentar_en: float)

REQUISITOS
----------
1. Ventana DESLIZANTE: en cualquier intervalo de `ventana` segundos, un cliente no puede
   tener más de `limite` peticiones permitidas. Una petición hecha en el instante t deja
   de contar en el instante t + ventana (en ese instante exacto ya no cuenta).
2. Cada cliente tiene su propio contador.
3. Si se permite: Decision(True, restantes=peticiones que le quedan en la ventana
   DESPUÉS de esta, reintentar_en=0.0).
4. Si se rechaza: Decision(False, restantes=0, reintentar_en=segundos que faltan para
   que se libere un cupo). Las peticiones rechazadas NO consumen cupo.
5. `limite < 1` o `ventana <= 0` lanzan ValueError.
6. Debe ser seguro con varios hilos (usa un Lock).
7. Implementa además `middleware(limitador, handler)`: devuelve una función
   `(request: dict) -> dict` que lee la API key de request["headers"]["X-Api-Key"]:
   - sin API key -> {"status": 401, "body": "falta X-Api-Key"}
   - rechazado   -> {"status": 429, "headers": {"Retry-After": "<segundos redondeados hacia arriba>"}}
   - permitido   -> la respuesta de handler(request), agregando a sus headers
                    "X-RateLimit-Remaining": "<restantes>"

PARA PENSAR
-----------
- Compara con token bucket y ventana fija: ¿cuál permite ráfagas? ¿cuál tiene el
  problema del "doble límite" en el borde de la ventana?
- Con 10 instancias del servicio detrás de un ALB, ¿dónde guardas los contadores?
- ¿Lo resolverías en el código, en API Gateway o en AWS WAF? ¿Por qué?

Ejecutar pruebas:  python TGI_SOLUCIONES/python/07_rate_limiter.py
"""
import threading  # noqa: F401
import time
from dataclasses import dataclass

from _pruebas import ejecutar


@dataclass(frozen=True)
class Decision:
    permitido: bool
    restantes: int
    reintentar_en: float


class LimitadorVentanaDeslizante:
    def __init__(self, limite: int, ventana: float, reloj=time.monotonic):
        # TODO: tu solución aquí
        raise NotImplementedError

    def permitir(self, cliente: str) -> Decision:
        raise NotImplementedError


def middleware(limitador: LimitadorVentanaDeslizante, handler):
    # TODO: tu solución aquí
    raise NotImplementedError


# ============================================================================
# PRUEBAS — no modificar
# ============================================================================
class _Reloj:
    def __init__(self):
        self.t = 100.0

    def __call__(self):
        return self.t


def test_permite_hasta_el_limite():
    r = _Reloj()
    lim = LimitadorVentanaDeslizante(3, 10, reloj=r)
    assert lim.permitir("ana") == Decision(True, 2, 0.0)
    assert lim.permitir("ana") == Decision(True, 1, 0.0)
    assert lim.permitir("ana") == Decision(True, 0, 0.0)
    d = lim.permitir("ana")
    assert d.permitido is False and d.restantes == 0
    assert abs(d.reintentar_en - 10.0) < 1e-9, d


def test_ventana_deslizante():
    r = _Reloj()
    lim = LimitadorVentanaDeslizante(2, 10, reloj=r)
    lim.permitir("x")  # t=100
    r.t = 105
    lim.permitir("x")  # t=105
    r.t = 109
    d = lim.permitir("x")
    assert not d.permitido and abs(d.reintentar_en - 1.0) < 1e-9, d  # se libera en t=110
    r.t = 110
    assert lim.permitir("x").permitido, "en t=110 la petición de t=100 ya no cuenta"
    assert not lim.permitir("x").permitido


def test_rechazos_no_consumen_cupo():
    r = _Reloj()
    lim = LimitadorVentanaDeslizante(1, 10, reloj=r)
    lim.permitir("x")
    for _ in range(5):
        r.t += 1
        lim.permitir("x")  # rechazadas
    r.t = 110
    assert lim.permitir("x").permitido


def test_clientes_independientes():
    r = _Reloj()
    lim = LimitadorVentanaDeslizante(1, 60, reloj=r)
    assert lim.permitir("a").permitido and lim.permitir("b").permitido
    assert not lim.permitir("a").permitido


def test_parametros_invalidos():
    for args in ((0, 10), (5, 0), (5, -1)):
        try:
            LimitadorVentanaDeslizante(*args)
            raise AssertionError(f"{args} debió lanzar ValueError")
        except ValueError:
            pass


def test_hilos():
    import threading

    lim = LimitadorVentanaDeslizante(100, 1000)
    permitidas = []

    def golpear():
        for _ in range(50):
            if lim.permitir("k").permitido:
                permitidas.append(1)

    hilos = [threading.Thread(target=golpear) for _ in range(8)]
    for h in hilos:
        h.start()
    for h in hilos:
        h.join()
    assert len(permitidas) == 100, f"se permitieron {len(permitidas)} (límite 100)"


def test_middleware():
    r = _Reloj()
    lim = LimitadorVentanaDeslizante(1, 30, reloj=r)
    app = middleware(lim, lambda req: {"status": 200, "body": "ok", "headers": {"X-Otro": "1"}})

    assert app({"headers": {}})["status"] == 401
    ok = app({"headers": {"X-Api-Key": "k1"}})
    assert ok["status"] == 200 and ok["body"] == "ok"
    assert ok["headers"] == {"X-Otro": "1", "X-RateLimit-Remaining": "0"}, ok["headers"]
    r.t += 0.5
    no = app({"headers": {"X-Api-Key": "k1"}})
    assert no["status"] == 429 and no["headers"]["Retry-After"] == "30", no


if __name__ == "__main__":
    ejecutar(globals())
