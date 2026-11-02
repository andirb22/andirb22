"""
Context managers (reportado en EPAM: "gestión de contexto en Python y cómo funciona
en una app Flask").

Protocolo: `with obj as x:` llama a obj.__enter__() (su retorno es x) y al salir a
obj.__exit__(exc_type, exc, tb), incluso si hubo excepción. Si __exit__ devuelve True,
la excepción se SUPRIME.

En Flask (para explicarlo de palabra):
- Hay dos contextos: el de aplicación (current_app, g) y el de request (request, session).
- Flask los "empuja" al iniciar cada petición y los "saca" al terminar; internamente
  usa contextvars, por eso `request` parece global pero es distinto en cada petición/hilo.
- `g` vive lo que dura el contexto de aplicación (una petición): ideal para guardar
  la sesión de BD de esa petición.
- @app.teardown_appcontext se ejecuta al cerrar el contexto (aunque haya error): ahí se
  cierra la sesión/conexión. Es el mismo patrón que __exit__.
- Fuera de una petición (scripts, tests, CLI) hay que crear el contexto a mano:
  `with app.app_context(): ...`
"""
import asyncio
import contextlib
import time


# 1) Basado en clase
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.start
        return False  # no suprime excepciones


# 2) Con contextlib.contextmanager (generador): todo lo anterior al yield es __enter__
class FakeConn:
    def __init__(self):
        self.ops, self.closed = [], False

    def commit(self):
        self.ops.append("commit")

    def rollback(self):
        self.ops.append("rollback")

    def close(self):
        self.closed = True


@contextlib.contextmanager
def transaccion(conn: FakeConn):
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise  # no tragarse el error
    finally:
        conn.close()


# 3) Suprimir excepciones devolviendo True en __exit__ (contextlib.suppress hace esto)
class Ignorar:
    def __init__(self, *tipos):
        self.tipos = tipos

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return exc_type is not None and issubclass(exc_type, self.tipos)


# 4) Async context manager (__aenter__ / __aexit__) — p. ej. sesiones HTTP o de BD async
class RecursoAsync:
    def __init__(self):
        self.abierto = False

    async def __aenter__(self):
        await asyncio.sleep(0)
        self.abierto = True
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await asyncio.sleep(0)
        self.abierto = False


# 5) ExitStack: número dinámico de recursos, todos se cierran en orden inverso
class Recurso:
    cerrados: list = []

    def __init__(self, nombre):
        self.nombre = nombre

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        Recurso.cerrados.append(self.nombre)


if __name__ == "__main__":
    with Timer() as t:
        time.sleep(0.01)
    assert t.elapsed >= 0.01

    ok = FakeConn()
    with transaccion(ok):
        pass
    assert ok.ops == ["commit"] and ok.closed

    mal = FakeConn()
    try:
        with transaccion(mal):
            raise ValueError("boom")
    except ValueError:
        pass
    assert mal.ops == ["rollback"] and mal.closed

    with Ignorar(KeyError):
        {}["x"]  # suprimida

    async def main():
        async with RecursoAsync() as r:
            assert r.abierto
        assert not r.abierto

    asyncio.run(main())

    with contextlib.ExitStack() as stack:
        for n in ["a", "b", "c"]:
            stack.enter_context(Recurso(n))
    assert Recurso.cerrados == ["c", "b", "a"]
    print("OK - context managers")
