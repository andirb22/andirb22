# Python — ejercicios para resolver

10 ejercicios basados en lo que se ha reportado en entrevistas de EPAM y en la guía de
preparación del rol Senior Full-Stack (Python + Angular + AWS).

Cada archivo trae el **contexto**, el **enunciado**, los **requisitos**, preguntas de
**"para pensar"** (las que haría el entrevistador) y **pruebas** al final.
Solo tienes que reemplazar los `raise NotImplementedError` / `-- TODO` por tu solución.

```bash
python python/01_cache_ttl.py      # ejecuta las pruebas de ese ejercicio
```

Salida: ✅ pasa · ❌ falla (con el motivo) · ⏳ pendiente (aún sin implementar).
También funcionan con `pytest python/`.

| # | Archivo | Tema | Tiempo |
|---|---------|------|--------|
| 01 | `01_cache_ttl.py` | Decorador con argumentos: caché con expiración | 20 min |
| 02 | `02_analisis_log.py` | Log enorme: streaming + versión async sin bloquear el event loop | 30-40 min |
| 03 | `03_peticiones_concurrentes.py` | asyncio: límite de concurrencia, timeouts, fallos parciales | 25 min |
| 04 | `04_predice_la_salida.py` | 10 trampas de Python: predice el resultado sin ejecutar | 15 min |
| 05 | `05_context_managers.py` | Escritura atómica, cronómetro, cambio de directorio | 25 min |
| 06 | `06_lru_cache.py` | LRU cache O(1) sin OrderedDict (+ bonus thread-safe) | 30 min |
| 07 | `07_rate_limiter.py` | Rate limiter de ventana deslizante + middleware 429 | 25 min |
| 08 | `08_algoritmos.py` | Paréntesis, ventana deslizante, intervalos, next bigger, top-k | 10-15 min c/u |
| 09 | `09_servicio_pedidos.py` | Diseño de API: validación, idempotencia, paginación, estados | 40 min |
| 10 | `10_sql_ventas.py` | SQL: ventanas, LEFT JOIN, HAVING, CTE recursiva, índices | 40 min |

**Consejo para practicar como en la entrevista:** pon un temporizador, explica en voz alta
tu enfoque antes de escribir (fuerza bruta → optimización → casos borde) y responde las
preguntas de "para pensar" al terminar.

`_pruebas.py` es el ejecutor de pruebas: no hace falta tocarlo.
