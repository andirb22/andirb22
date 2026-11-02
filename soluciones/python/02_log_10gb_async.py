"""
Procesar un archivo de log de 10 GB de forma asíncrona
(reportado en EPAM, Glassdoor 2025: el candidato se trabó con la sintaxis async).

Tarea típica: contar cuántas líneas hay por nivel (INFO, WARNING, ERROR...) sin
cargar el archivo en memoria.

Lo que conviene decir antes de escribir código (es lo que diferencia a un Senior):
1. NUNCA `f.read()` ni `f.readlines()` sin límite: 10 GB no caben en RAM. Hay que leer en streaming.
2. asyncio NO hace asíncrona la lectura de archivos: el SO no ofrece I/O de disco no bloqueante
   de forma portable. Opciones: `asyncio.to_thread` / `run_in_executor`, o la librería `aiofiles`
   (que por dentro también usa un thread pool).
3. Parsear líneas es trabajo de CPU -> con el GIL, más threads no aceleran. Para paralelismo real:
   dividir el archivo en rangos de bytes y procesar cada rango en un proceso aparte.
4. Backpressure: una cola con maxsize evita que el productor llene la memoria.

Se dan dos soluciones:
- Opción A: productor/consumidor con asyncio.Queue (la que suelen esperar en la entrevista).
- Opción B: paralela por rangos de bytes con ProcessPoolExecutor (la más rápida de verdad).
"""
import asyncio
import os
import re
import tempfile
from collections import Counter
from concurrent.futures import ProcessPoolExecutor

LEVEL_RE = re.compile(rb"\b(DEBUG|INFO|WARNING|ERROR|CRITICAL)\b")
BATCH_BYTES = 4 * 1024 * 1024  # ~4 MB por lote


def count_levels(lines) -> Counter:
    counter = Counter()
    for line in lines:
        m = LEVEL_RE.search(line)
        if m:
            counter[m.group(1).decode()] += 1
    return counter


# ---------------------------------------------------------------------------
# Opción A: productor / consumidor con asyncio
# ---------------------------------------------------------------------------
async def _producer(path: str, queue: asyncio.Queue) -> None:
    with open(path, "rb") as f:
        while True:
            # readlines(hint) devuelve líneas COMPLETAS hasta ~hint bytes.
            # Se ejecuta en un thread para no bloquear el event loop.
            batch = await asyncio.to_thread(f.readlines, BATCH_BYTES)
            if not batch:
                break
            await queue.put(batch)  # si la cola está llena, espera (backpressure)
    await queue.put(None)  # señal de fin


async def _consumer(queue: asyncio.Queue) -> Counter:
    total = Counter()
    while (batch := await queue.get()) is not None:
        total.update(count_levels(batch))
    return total


async def count_levels_async(path: str) -> Counter:
    queue: asyncio.Queue = asyncio.Queue(maxsize=8)  # máx ~32 MB en memoria
    _, result = await asyncio.gather(_producer(path, queue), _consumer(queue))
    return result


# ---------------------------------------------------------------------------
# Opción B: paralelismo real por rangos de bytes
# ---------------------------------------------------------------------------
def _process_range(path: str, start: int, end: int) -> Counter:
    """Procesa las líneas que EMPIEZAN dentro de [start, end)."""
    counter = Counter()
    with open(path, "rb") as f:
        if start > 0:
            # Alinear al inicio de la siguiente línea: si start-1 es '\n',
            # readline() consume solo ese byte y quedamos justo en start.
            f.seek(start - 1)
            f.readline()
        while f.tell() < end:
            line = f.readline()
            if not line:
                break
            m = LEVEL_RE.search(line)
            if m:
                counter[m.group(1).decode()] += 1
    return counter


async def count_levels_parallel(path: str, workers: int | None = None) -> Counter:
    workers = workers or os.cpu_count() or 2
    size = os.path.getsize(path)
    step = max(1, size // workers)
    ranges = [(i, min(i + step, size)) for i in range(0, size, step)]

    loop = asyncio.get_running_loop()
    with ProcessPoolExecutor(max_workers=workers) as pool:
        partials = await asyncio.gather(
            *(loop.run_in_executor(pool, _process_range, path, s, e) for s, e in ranges)
        )
    total = Counter()
    for p in partials:
        total.update(p)
    return total


# ---------------------------------------------------------------------------
# Variante con generador (sync) — también vale mencionarla: simple y O(1) en memoria
# ---------------------------------------------------------------------------
def count_levels_streaming(path: str) -> Counter:
    with open(path, "rb") as f:  # iterar el archivo lee línea a línea con buffer
        return count_levels(f)


if __name__ == "__main__":
    import random

    levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    expected = Counter()
    with tempfile.NamedTemporaryFile("wb", delete=False, suffix=".log") as tmp:
        for i in range(200_000):
            lvl = random.choice(levels)
            expected[lvl] += 1
            tmp.write(f"2026-11-02T10:00:{i % 60:02d} {lvl} servicio=api msg=evento {i}\n".encode())
        tmp.write(b"linea sin nivel\n")
        path = tmp.name

    try:
        assert count_levels_streaming(path) == expected
        assert asyncio.run(count_levels_async(path)) == expected
        assert asyncio.run(count_levels_parallel(path, workers=4)) == expected
        print("OK - log async:", dict(expected))
    finally:
        os.remove(path)
