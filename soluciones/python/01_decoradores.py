"""
Decoradores (reportado en EPAM: "escribe un decorador" en live coding de 10-15 min,
y "cómo se apilan varios decoradores").

Puntos clave para explicar en voz alta:
- Un decorador es una función que recibe una función y devuelve otra (azúcar sintáctico:
  `@deco def f` == `f = deco(f)`).
- Usar functools.wraps para conservar __name__, __doc__, etc.
- Decorador con argumentos = una fábrica que devuelve el decorador (3 niveles).
- Apilados: se APLICAN de abajo hacia arriba, se EJECUTAN de afuera hacia adentro.
- Senior: soportar funciones async sin romperlas.
"""
import asyncio
import functools
import inspect
import time


# 1) Decorador simple: mide el tiempo de ejecución
def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:  # se ejecuta incluso si func lanza excepción
            elapsed = time.perf_counter() - start
            print(f"[timer] {func.__name__} tardó {elapsed:.4f}s")

    return wrapper


# 2) Decorador con argumentos: reintentos
def retry(times=3, exceptions=(Exception,), delay=0.0):
    if times < 1:
        raise ValueError("times debe ser >= 1")

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions:
                    if attempt == times:
                        raise  # re-lanza la última excepción con su traceback original
                    if delay:
                        time.sleep(delay * 2 ** (attempt - 1))  # backoff exponencial

        return wrapper

    return decorator


# 3) Memoización simple (equivalente didáctico a functools.lru_cache)
def memoize(func):
    cache = {}

    @functools.wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]

    wrapper.cache = cache
    return wrapper


# 4) Orden de apilado
def tag(name):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return f"<{name}>{func(*args, **kwargs)}</{name}>"

        return wrapper

    return decorator


@tag("b")
@tag("i")
def saludo():
    return "hola"
# Equivale a: saludo = tag("b")(tag("i")(saludo))
# Resultado: "<b><i>hola</i></b>"


# 5) Decorador que funciona con funciones sync y async (nivel Senior)
def log_calls(func):
    if inspect.iscoroutinefunction(func):

        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            print(f"[log] -> {func.__name__}{args}")
            result = await func(*args, **kwargs)
            print(f"[log] <- {func.__name__} = {result!r}")
            return result

        return async_wrapper

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[log] -> {func.__name__}{args}")
        result = func(*args, **kwargs)
        print(f"[log] <- {func.__name__} = {result!r}")
        return result

    return wrapper


# 6) Decorador de clase (también se puede decorar clases)
def singleton(cls):
    instances = {}

    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance


if __name__ == "__main__":
    # timer
    @timer
    def lento():
        """doc original"""
        time.sleep(0.01)
        return 42

    assert lento() == 42
    assert lento.__name__ == "lento" and lento.__doc__ == "doc original"  # gracias a wraps

    # retry
    calls = {"n": 0}

    @retry(times=3, exceptions=(ConnectionError,))
    def flaky():
        calls["n"] += 1
        if calls["n"] < 3:
            raise ConnectionError("falló")
        return "ok"

    assert flaky() == "ok" and calls["n"] == 3

    @retry(times=2, exceptions=(ValueError,))
    def siempre_falla():
        raise ValueError("x")

    try:
        siempre_falla()
        raise AssertionError("debió fallar")
    except ValueError:
        pass

    # memoize
    @memoize
    def fib(n):
        return n if n < 2 else fib(n - 1) + fib(n - 2)

    assert fib(80) == 23416728348467685

    # orden de apilado
    assert saludo() == "<b><i>hola</i></b>"

    # sync + async
    @log_calls
    def suma(a, b):
        return a + b

    @log_calls
    async def suma_async(a, b):
        await asyncio.sleep(0)
        return a + b

    assert suma(1, 2) == 3
    assert asyncio.run(suma_async(1, 2)) == 3

    @singleton
    class Config:
        pass

    assert Config() is Config()
    print("OK - decoradores")
