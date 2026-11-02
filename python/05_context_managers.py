"""
EJERCICIO 05 — Context managers
Tema: __enter__/__exit__, contextlib, garantías ante excepciones
Basado en: "gestión de contexto en Python y cómo funciona en Flask" (reportado en EPAM)
Tiempo sugerido: 25 min

CONTEXTO
--------
Un proceso batch genera reportes y configuración en disco. Si el proceso se cae a la
mitad de escribir, hoy queda un archivo corrupto a medio escribir. Queremos garantías.

ENUNCIADO
---------
Implementa tres context managers (puedes usar clases o @contextlib.contextmanager):

A) escritura_atomica(ruta, modo="w", encoding="utf-8")
       with escritura_atomica("config.json") as f:
           f.write(...)
   1. Escribe en un archivo TEMPORAL dentro de la misma carpeta que `ruta`.
   2. Si el bloque termina bien, reemplaza `ruta` por el temporal de forma atómica
      (os.replace). Si `ruta` no existía, se crea.
   3. Si el bloque lanza una excepción: el archivo original queda INTACTO, el temporal
      se borra y la excepción se propaga.
   4. No deben quedar archivos temporales en la carpeta en ningún caso.
   5. `modo` puede ser "w" (texto) o "wb" (binario; en ese caso no se pasa encoding).

B) Cronometro()
       with Cronometro() as c:
           ...
       c.duracion   # segundos (float) que tardó el bloque
   1. `duracion` se calcula aunque el bloque lance una excepción, y la excepción se propaga.
   2. BONUS: que también funcione como decorador (@Cronometro()) -> mira
      contextlib.ContextDecorator. En ese caso guarda la última duración en el objeto.

C) cambiar_directorio(ruta)
       with cambiar_directorio("/tmp"):
           ...   # aquí os.getcwd() es /tmp
   1. Al salir (con o sin excepción) se vuelve al directorio anterior.
   2. Si `ruta` no existe, lanza FileNotFoundError y NO cambia de directorio.

PARA PENSAR
-----------
- ¿Por qué el temporal debe estar en la MISMA carpeta y no en /tmp? (pista: os.replace
  entre sistemas de archivos distintos)
- ¿Qué significa que __exit__ devuelva True?
- ¿Qué relación tiene esto con @app.teardown_appcontext en Flask o con una transacción de BD?

Ejecutar pruebas:  python python/05_context_managers.py
"""
import contextlib  # noqa: F401
import os
import tempfile
import time  # noqa: F401

from _pruebas import ejecutar


def escritura_atomica(ruta, modo="w", encoding="utf-8"):
    # TODO: tu solución aquí
    raise NotImplementedError


class Cronometro:
    # TODO: tu solución aquí
    def __init__(self):
        raise NotImplementedError


def cambiar_directorio(ruta):
    # TODO: tu solución aquí
    raise NotImplementedError


# ============================================================================
# PRUEBAS — no modificar
# ============================================================================
def _carpeta():
    return tempfile.mkdtemp()


def test_escritura_atomica_ok():
    d = _carpeta()
    ruta = os.path.join(d, "config.json")
    with open(ruta, "w") as f:
        f.write("viejo")
    with escritura_atomica(ruta) as f:
        f.write("nuevo ñ")
    with open(ruta, encoding="utf-8") as f:
        assert f.read() == "nuevo ñ"
    assert os.listdir(d) == ["config.json"], f"quedaron archivos de más: {os.listdir(d)}"


def test_escritura_atomica_archivo_nuevo_y_binario():
    d = _carpeta()
    ruta = os.path.join(d, "datos.bin")
    with escritura_atomica(ruta, "wb") as f:
        f.write(b"\x00\x01")
    with open(ruta, "rb") as f:
        assert f.read() == b"\x00\x01"


def test_escritura_atomica_con_error_no_toca_el_original():
    d = _carpeta()
    ruta = os.path.join(d, "config.json")
    with open(ruta, "w") as f:
        f.write("original")
    class _ProcesoCaido(Exception):
        pass

    try:
        with escritura_atomica(ruta) as f:
            f.write("a medias...")
            raise _ProcesoCaido("se cayó el proceso")
    except _ProcesoCaido:
        pass
    else:
        raise AssertionError("la excepción no se propagó")
    with open(ruta) as f:
        assert f.read() == "original", "el archivo original fue modificado"
    assert os.listdir(d) == ["config.json"], f"quedó el temporal: {os.listdir(d)}"


def test_escritura_atomica_usa_la_misma_carpeta():
    d = _carpeta()
    ruta = os.path.join(d, "x.txt")
    with escritura_atomica(ruta) as f:
        f.write("x")
        f.flush()
        dentro = os.listdir(d)
        assert len(dentro) == 1 and dentro[0] != "x.txt", \
            "mientras se escribe, el temporal debe existir en la misma carpeta que el destino"


def test_cronometro():
    with Cronometro() as c:
        time.sleep(0.05)
    assert 0.04 < c.duracion < 0.5, c.duracion


def test_cronometro_con_excepcion():
    c = Cronometro()
    try:
        with c:
            time.sleep(0.02)
            raise ValueError
    except ValueError:
        pass
    else:
        raise AssertionError("la excepción no se propagó")
    assert c.duracion >= 0.02


def test_cronometro_como_decorador_bonus():
    c = Cronometro()

    @c
    def trabajo():
        time.sleep(0.02)
        return 7

    assert trabajo() == 7 and c.duracion >= 0.02


def test_cambiar_directorio():
    antes = os.getcwd()
    d = os.path.realpath(_carpeta())
    with cambiar_directorio(d):
        assert os.path.realpath(os.getcwd()) == d
    assert os.getcwd() == antes
    try:
        with cambiar_directorio(d):
            raise KeyError
    except KeyError:
        pass
    assert os.getcwd() == antes, "no volvió al directorio original tras una excepción"


def test_cambiar_directorio_inexistente():
    antes = os.getcwd()
    try:
        with cambiar_directorio("/no/existe/esta/ruta"):
            pass
        raise AssertionError("debió lanzar FileNotFoundError")
    except FileNotFoundError:
        pass
    assert os.getcwd() == antes


if __name__ == "__main__":
    ejecutar(globals())
