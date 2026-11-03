# Soluciones — ejercicios reportados en entrevistas EPAM

Ejercicios y preguntas encontrados en relatos de candidatos (Glassdoor, LeetCode Discuss,
Medium, GitHub) y en la guía oficial de preparación de EPAM para el rol
**Senior Full-Stack (Python + Angular) con AWS — nivel A3**.

Cada archivo trae la solución, la explicación que conviene dar en voz alta y pruebas.

## Cómo ejecutarlos

```bash
# Python (3.11+). Solo 06 necesita dependencias: pip install flask sqlalchemy
python TGI_SOLUCIONES/soluciones/python/01_decoradores.py

# JavaScript (Node 18+)
node TGI_SOLUCIONES/soluciones/javascript/03_promesa_propia.js

# TypeScript puro (Node 22.18+)
node TGI_SOLUCIONES/soluciones/typescript/09_tipos_avanzados.mts
```

Los archivos de Angular (`typescript/01` a `08`) son de referencia: se copian dentro de
un proyecto Angular 17+ (standalone). `08` es un test que corre con `ng test`.

## Python — `python/`

| # | Archivo | Ejercicio | Dónde se reportó |
|---|---------|-----------|------------------|
| 01 | `01_decoradores.py` | Escribir un decorador; orden al apilarlos; con argumentos; sync + async | Glassdoor 2025 (live coding 10-15 min), LeetCode Discuss |
| 02 | `02_log_10gb_async.py` | Procesar un log de 10 GB de forma asíncrona (cola con backpressure y versión paralela por rangos de bytes) | Glassdoor 2025 |
| 03 | `03_mro_herencia_multiple.py` | ¿Qué método se ejecuta con herencia múltiple? MRO, `super()` cooperativo | LeetCode Discuss |
| 04 | `04_excepciones.py` | Orden de los `except`, `raise ... from`, `__cause__` vs `__context__`, `except*` | LeetCode Discuss |
| 05 | `05_context_managers.py` | Context managers y cómo funcionan los contextos en Flask | LeetCode Discuss |
| 06 | `06_flask_di_sqlalchemy.py` | Inyección de dependencias en Flask + SQLAlchemy (app factory, sesión por petición, repositorio) | LeetCode Discuss |
| 07 | `07_lru_cache.py` | LRU cache O(1): con OrderedDict, manual y thread-safe | TechPrep, Hacking the Case |
| 08 | `08_hashmap.py` | HashMap sin `dict` (encadenamiento + resize) | TechPrep, Hacking the Case |
| 09 | `09_singleton_thread_safe.py` | Singleton thread-safe (double-checked locking) | TechPrep, Hacking the Case |
| 10 | `10_strings.py` | Paréntesis válidos, palíndromos, anagramas, ventana deslizante, Magic Latin | TechPrep, Codejeet, reto de GitHub |
| 11 | `11_arrays_matrices.py` | Rotar matriz, siguiente número mayor, eliminar duplicados, rotar arreglo | TechPrep, Codejeet, reto de GitHub |
| 12 | `12_programacion_dinamica.py` | Edit Distance, LCS, Kadane | TechPrep, Hacking the Case |
| 13 | `13_grafos_arboles.py` | Word Ladder, Number of Islands, vista superior y diagonal de un árbol | TechPrep |
| 14 | `14_rate_limiter.py` | Rate limiter: token bucket y ventana deslizante | Hacking the Case (diseño) |
| 15 | `15_asyncio_vs_threading.py` | asyncio vs threads vs procesos, GIL, bloquear el event loop | Glassdoor 2025, guía EPAM |
| 16 | `16_flatten_json_csv.py` | Aplanar JSON anidado a CSV con notación de punto | prepare.sh (EPAM) |
| 17 | `17_sql.py` + `sql/consultas.sql` | Top 3 salarios (ventanas), self-join, cadena de mando (CTE recursiva), índices | TechPrep, Hacking the Case |

## JavaScript — `javascript/`

| # | Archivo | Ejercicio | Dónde se reportó |
|---|---------|-----------|------------------|
| 01 | `01_currying.js` | `add(3)(4) === 7`, curry genérico | Medium (Full Stack JS en EPAM) |
| 02 | `02_eliminar_duplicados.js` | Eliminar números repetidos de un arreglo | Medium (EPAM) |
| 03 | `03_promesa_propia.js` | Implementar una Promise (then, catch, finally, all, race, allSettled) | Medium (EPAM) |
| 04 | `04_async_await_fetch.js` | Pasar promesas a async/await; fetch con timeout y reintentos | Medium (EPAM) |
| 05 | `05_this_call_referencias.js` | Predecir salidas: referencias, `this`, call/apply/bind, var vs let | Medium (EPAM) |
| 06 | `06_contador_intervalo.js` / `06b_contador_react.jsx` | Contador con setInterval/clearInterval | Medium (EPAM) |
| 07 | `07_reto_preseleccion.js` | Magic Latin, paréntesis, regex binario divisible por 5, next bigger | GitHub (reto de preselección EPAM) |
| 08 | `08_event_loop.js` | Orden de ejecución: microtareas vs macrotareas | Complemento a las preguntas de promesas |
| 09 | `09_debounce_throttle.js` | Debounce y throttle | Complemento frecuente en frontend |

## TypeScript / Angular — `typescript/`

No se encontraron relatos de ejercicios de Angular específicos de EPAM. Estos cubren las
preguntas de ejemplo de la guía oficial.

| # | Archivo | Tema (pregunta de la guía) |
|---|---------|----------------------------|
| 01 | `01_token_refresh.interceptor.ts` | Refresh de token seguro con interceptores (single-flight) |
| 02 | `02_suscripciones_sin_fugas.component.ts` | Evitar fugas de memoria con RxJS |
| 03 | `03_onpush_change_detection.component.ts` | Change detection y OnPush, inmutabilidad, signals |
| 04 | `04_control_value_accessor.ts` | ControlValueAccessor + validador propio |
| 05 | `05_busqueda_rxjs.ts` | Typeahead: debounceTime, switchMap, catchError, operador propio |
| 06 | `06_formularios_tipados.ts` | Typed forms, validadores síncronos, cruzados y asíncronos |
| 07 | `07_rutas_guards_resolvers.ts` | Lazy loading, guards funcionales, resolvers, preloading |
| 08 | `08_usuarios.component.spec.ts` | Testear un componente con HTTP (HttpTestingController) |
| 09 | `09_tipos_avanzados.mts` | TypeScript puro: uniones discriminadas, genéricos, tipos utilitarios |

## Fuentes

- [Glassdoor – EPAM Python Developer](https://www.glassdoor.sg/Interview/EPAM-Systems-Python-Developer-Interview-Questions-EI_IE15544.0,12_KO13,29.htm)
- [LeetCode Discuss – EPAM Python interview](https://leetcode.com/discuss/interview-experience/7303754/)
- [Medium – Full Stack JS interview at EPAM](https://javokhirm.medium.com/interview-questions-for-a-junior-full-stack-javascript-developer-position-epam-1584c18d92ce)
- [GitHub – EPAM JS pre-screening challenge](https://github.com/Alex--wu/challenge-epam-js)
- [TechPrep – EPAM interview process](https://www.techprep.app/blog/epam-systems-interview-process)
- [Hacking the Case – EPAM interview rounds](https://www.hackingthecaseinterview.com/pages/epam-interview)
- [Codejeet – EPAM coding interviews](https://codejeet.com/blog/how-to-crack-epam-systems-coding-interviews)
- [prepare.sh – EPAM hands-on questions](https://prepare.sh/interview-questions/companies/epam)
