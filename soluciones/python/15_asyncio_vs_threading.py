"""
asyncio vs threading vs multiprocessing (reportado en EPAM: "diferencia entre asyncio
y threading", "el GIL", "¿cuándo usar ASGI + endpoints async?").

Resumen para decirlo en 30 segundos:
- I/O-bound (red, BD, disco): asyncio o threads. asyncio = 1 hilo, concurrencia
  cooperativa (cambia de tarea solo en cada `await`), muy barato por tarea (miles).
  Threads = el SO cambia de hilo en cualquier momento (preemptivo), más caros, y
  requieren locks para estado compartido.
- CPU-bound: el GIL deja ejecutar bytecode Python a un solo hilo a la vez -> threads
  no aceleran. Usar procesos (ProcessPoolExecutor) o librerías en C que liberan el GIL
  (numpy). Python 3.13+ tiene un build experimental "free-threaded" sin GIL.
- Errores típicos con async: llamar código bloqueante (requests, time.sleep, un driver
  de BD sync) dentro de una corrutina congela TODO el event loop. Solución:
  asyncio.to_thread o librerías async (httpx, asyncpg).
- Deployment: con FastAPI/ASGI una ruta `async def` corre en el event loop; una `def`
  normal corre en un thread pool. Con Gunicorn + Uvicorn workers: N procesos (≈ núcleos),
  cada uno con su event loop.
"""
import asyncio
import math
import threading
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor


def io_bloqueante(_):
    time.sleep(0.2)  # simula una llamada HTTP/BD
    return 1


async def io_async(_):
    await asyncio.sleep(0.2)
    return 1


def cpu(n):
    return sum(math.isqrt(i) for i in range(n))


def medir(nombre, fn):
    t = time.perf_counter()
    fn()
    dt = time.perf_counter() - t
    print(f"{nombre:<38} {dt:6.2f}s")
    return dt


# Patrones asyncio útiles: gather con límite de concurrencia y timeout
async def descargar_todo(urls, limite=5, timeout=1.0):
    sem = asyncio.Semaphore(limite)

    async def una(url):
        async with sem:  # nunca más de `limite` a la vez
            return await asyncio.wait_for(io_async(url), timeout)

    # return_exceptions=True: un fallo no cancela a los demás
    return await asyncio.gather(*(una(u) for u in urls), return_exceptions=True)


async def bloqueo_del_loop():
    """Demuestra el error clásico: time.sleep dentro de una corrutina bloquea a las demás."""
    marcas = []

    async def latido():
        for _ in range(3):
            marcas.append(time.perf_counter())
            await asyncio.sleep(0.05)

    async def mala():
        time.sleep(0.3)  # bloquea el loop entero

    async def buena():
        await asyncio.to_thread(time.sleep, 0.3)  # el loop sigue libre

    await asyncio.gather(latido(), buena())
    huecos_buena = max(b - a for a, b in zip(marcas, marcas[1:]))
    marcas.clear()
    await asyncio.gather(latido(), mala())
    huecos_mala = max(b - a for a, b in zip(marcas, marcas[1:]))
    return huecos_buena, huecos_mala


if __name__ == "__main__":
    n = 10
    secuencial = medir("I/O secuencial (10 x 0.2s)", lambda: [io_bloqueante(i) for i in range(n)])
    hilos = medir("I/O con 10 threads", lambda: list(ThreadPoolExecutor(n).map(io_bloqueante, range(n))))
    async def todas():
        return await asyncio.gather(*(io_async(i) for i in range(n)))

    asincrono = medir("I/O con asyncio.gather", lambda: asyncio.run(todas()))
    assert hilos < secuencial / 3 and asincrono < secuencial / 3

    trabajo = [2_000_000] * 4
    cpu_seq = medir("CPU secuencial", lambda: [cpu(x) for x in trabajo])
    medir("CPU con threads (GIL -> no mejora)", lambda: list(ThreadPoolExecutor(4).map(cpu, trabajo)))
    with ProcessPoolExecutor(4) as pool:
        medir("CPU con procesos (paralelo real)", lambda: list(pool.map(cpu, trabajo)))

    assert asyncio.run(descargar_todo(range(20))) == [1] * 20

    buena, mala = asyncio.run(bloqueo_del_loop())
    print(f"hueco máx. entre latidos: con to_thread={buena:.2f}s, con time.sleep={mala:.2f}s")
    assert mala > 0.25 > buena
    print("OK - asyncio vs threading", threading.active_count())
