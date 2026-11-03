"""
Rate limiter (reportado en EPAM como pregunta de diseño de sistemas).

Algoritmos a comparar en voz alta:
- Token bucket: permite ráfagas hasta `capacidad` y una tasa media sostenida. Muy usado (AWS API Gateway).
- Ventana fija: simple, pero permite el doble del límite en el borde entre dos ventanas.
- Ventana deslizante (log): exacta, pero guarda un timestamp por petición (más memoria).

En producción con varias instancias del servicio el estado no puede vivir en memoria:
se usa Redis (INCR + EXPIRE o un script Lua atómico), o el rate limiting del API Gateway
/ WAF. Responder 429 Too Many Requests con el header Retry-After.

El reloj se inyecta para poder testear sin sleeps.
"""
import threading
import time
from collections import defaultdict, deque


class TokenBucket:
    def __init__(self, capacidad: int, tokens_por_segundo: float, reloj=time.monotonic):
        self.capacidad = capacidad
        self.tasa = tokens_por_segundo
        self.reloj = reloj
        self.tokens = float(capacidad)
        self.ultimo = reloj()
        self._lock = threading.Lock()

    def permitir(self, costo: int = 1) -> bool:
        with self._lock:
            ahora = self.reloj()
            # recargar según el tiempo transcurrido, sin pasar de la capacidad
            self.tokens = min(self.capacidad, self.tokens + (ahora - self.ultimo) * self.tasa)
            self.ultimo = ahora
            if self.tokens >= costo:
                self.tokens -= costo
                return True
            return False


class VentanaDeslizante:
    """Máximo `limite` peticiones por cliente en los últimos `ventana` segundos."""

    def __init__(self, limite: int, ventana: float, reloj=time.monotonic):
        self.limite, self.ventana, self.reloj = limite, ventana, reloj
        self.peticiones: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def permitir(self, cliente: str) -> bool:
        with self._lock:
            ahora = self.reloj()
            q = self.peticiones[cliente]
            while q and q[0] <= ahora - self.ventana:
                q.popleft()  # descartar las que salieron de la ventana
            if len(q) < self.limite:
                q.append(ahora)
                return True
            return False


class RelojFalso:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        return self.t


if __name__ == "__main__":
    reloj = RelojFalso()
    tb = TokenBucket(capacidad=3, tokens_por_segundo=1, reloj=reloj)
    assert [tb.permitir() for _ in range(4)] == [True, True, True, False]  # ráfaga de 3
    reloj.t = 1.0
    assert tb.permitir() and not tb.permitir()  # recargó 1 token
    reloj.t = 100
    assert sum(tb.permitir() for _ in range(10)) == 3  # nunca pasa de la capacidad

    reloj2 = RelojFalso()
    vd = VentanaDeslizante(limite=2, ventana=10, reloj=reloj2)
    assert vd.permitir("ana") and vd.permitir("ana") and not vd.permitir("ana")
    assert vd.permitir("luis")  # límite por cliente
    reloj2.t = 10.0
    assert vd.permitir("ana")
    print("OK - rate limiter")
