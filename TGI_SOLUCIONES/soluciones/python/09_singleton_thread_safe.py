"""
Singleton thread-safe (reportado en EPAM como ejercicio de diseño de bajo nivel).

Respuesta Senior:
1. En Python lo más idiomático es un módulo: los módulos se importan una sola vez
   (el import está protegido por un lock), así que una instancia a nivel de módulo
   ya es un singleton seguro.
2. Si piden una clase: metaclase con "double-checked locking". El primer chequeo sin
   lock evita pagar el lock en cada llamada; el segundo, dentro del lock, evita que dos
   hilos creen dos instancias a la vez.
3. Mencionar el costo: los singletons son estado global, complican los tests (hay que
   poder resetearlos) y ocultan dependencias. Muchas veces es mejor inyectar la instancia.
"""
import threading
import time


class SingletonMeta(type):
    _instances: dict = {}
    _lock = threading.Lock()

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:  # 1er chequeo, rápido y sin lock
            with cls._lock:
                if cls not in cls._instances:  # 2do chequeo, ya con el lock
                    cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

    def _reset(cls):  # útil en tests
        cls._instances.pop(cls, None)


class Configuracion(metaclass=SingletonMeta):
    creaciones = 0

    def __init__(self):
        time.sleep(0.01)  # simula una inicialización lenta para provocar la carrera
        type(self).creaciones += 1
        self.valores = {"env": "prod"}


# Alternativa con __new__ (cuidado: __init__ se vuelve a ejecutar en cada llamada)
class SingletonNew:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance


if __name__ == "__main__":
    resultados = []
    hilos = [threading.Thread(target=lambda: resultados.append(Configuracion())) for _ in range(20)]
    for h in hilos:
        h.start()
    for h in hilos:
        h.join()
    assert all(r is resultados[0] for r in resultados)
    assert Configuracion.creaciones == 1

    Configuracion._reset()
    assert Configuracion() is not resultados[0]

    assert SingletonNew() is SingletonNew()
    print("OK - singleton")
