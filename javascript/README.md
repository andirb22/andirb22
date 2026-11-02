# JavaScript — ejercicios para resolver

10 ejercicios basados en lo reportado en entrevistas de EPAM (live coding de Full Stack JS,
reto de preselección en JavaScript) y en la guía del rol Senior Full-Stack.

Cada archivo trae el **enunciado**, los **requisitos**, preguntas de **"para pensar"** y
**pruebas** al final. Escribe tu código entre las marcas
`// ==== TU SOLUCIÓN (inicio) ====` y `// ==== TU SOLUCIÓN (fin) ====`, reemplazando los
`pendiente()`. En los ejercicios 05 y 07 solo llenas el objeto `RESPUESTAS`.

```bash
node javascript/01_curry_y_composicion.js
```

Salida: ✅ pasa · ❌ falla (con el motivo) · ⏳ pendiente. Requiere Node 18+; no hay que instalar nada.

| # | Archivo | Tema | Tiempo |
|---|---------|------|--------|
| 01 | `01_curry_y_composicion.js` | curry genérico, suma infinita, pipe/compose | 20 min |
| 02 | `02_arrays_y_objetos.js` | únicos, agrupar, aplanar sin `.flat`, clonado profundo con ciclos | 30 min |
| 03 | `03_utilidades_de_promesas.js` | Promise.all propio, timeout, reintentos con backoff, pool de concurrencia | 35 min |
| 04 | `04_async_await_refactor.js` | Refactor de callbacks/then a async/await en paralelo, promisificar | 30 min |
| 05 | `05_predice_la_salida.js` | 10 fragmentos: `this`, call/bind, closures, hoisting, coerción | 15 min |
| 06 | `06_temporizadores.js` | Contador con setInterval/clearInterval y cuenta regresiva cancelable | 30 min |
| 07 | `07_event_loop.js` | Orden de ejecución: microtareas vs macrotareas | 15 min |
| 08 | `08_debounce_throttle.js` | debounce (leading/trailing, cancel, flush) y throttle | 30 min |
| 09 | `09_strings_y_regex.js` | Pig Latin, delimitadores, regex múltiplo de 3, next bigger, separador de miles | 10-15 min c/u |
| 10 | `10_eventos_y_store.js` | EventEmitter y un store tipo Redux/NgRx | 40 min |

**Para practicar como en la entrevista:** temporizador, explica tu enfoque en voz alta antes
de escribir, y responde las preguntas de "para pensar" al terminar.

`_pruebas.js` es el ejecutor de pruebas: no hace falta tocarlo.
