# TypeScript — ejercicios para resolver

10 ejercicios en TypeScript puro que modelan los temas de Angular que pide la guía de EPAM
(DI jerárquica, RxJS, signals, interceptores, formularios tipados, router con guards) y
tipos avanzados. No necesitan Angular ni instalar nada para ejecutar las pruebas: así
entiendes **cómo funciona por dentro** lo que en la entrevista te van a preguntar.

## Cómo ejecutarlos

```bash
node typescript/04_observable.ts     # pruebas de ese ejercicio (Node 22.18+ ejecuta .ts directo)
npx tsx typescript/04_observable.ts  # alternativa si tu Node es más antiguo

cd typescript && npm install && npm run tipos   # revisa los TIPOS con tsc
```

Escribe tu código entre `// ==== TU SOLUCIÓN (inicio) ====` y `// ==== TU SOLUCIÓN (fin) ====`.
Salida: ✅ pasa · ❌ falla (con el motivo) · ⏳ pendiente.

Los ejercicios **01, 03 y 09** tienen además **pruebas de tipos**: las revisa `npm run tipos`.
Al empezar verás errores de `tsc` en esos archivos; el objetivo es dejarlos en cero.

Node ejecuta TypeScript quitando los tipos, así que no uses `enum`, `namespace` ni
parámetros con modificador en el constructor (`constructor(private x: X)`): declara el campo
y asígnalo. `tsconfig.json` ya lo marca con `erasableSyntaxOnly`.

| # | Archivo | Tema | Tiempo |
|---|---------|------|--------|
| 01 | `01_tipos_utilidad.ts` | Pick/Omit/DeepReadonly propios, infer, tipos de parámetros de ruta | 40 min |
| 02 | `02_estado_remoto.ts` | Uniones discriminadas, `never` exhaustivo, type guards para datos de API | 35 min |
| 03 | `03_genericos.ts` | Bus de eventos tipado, agruparPor genérico, caché single-flight | 40 min |
| 04 | `04_observable.ts` | Tu propio Observable, operadores, Subject y BehaviorSubject | 50 min |
| 05 | `05_buscador_con_cancelacion.ts` | Typeahead: debounce, switchMap a mano con AbortController, caché | 45 min |
| 06 | `06_inyeccion_dependencias.ts` | Injector jerárquico: useClass/useFactory/useExisting, multi, self/skipSelf, ciclos | 50 min |
| 07 | `07_signals.ts` | signal, computed (perezoso, memoizado, deps dinámicas) y effect | 60 min |
| 08 | `08_interceptores_http.ts` | Cadena de interceptores, refresh de token single-flight, reintentos idempotentes | 50 min |
| 09 | `09_formularios_tipados.ts` | FormControl/FormGroup tipados, validadores, dirty/touched/disabled | 50 min |
| 10 | `10_router.ts` | Router con params, hijos, redirecciones, guards, resolvers y lazy loading | 60 min |

**Orden sugerido:** 02 → 03 → 01 (tipos) · 04 → 05 (RxJS) · 06 → 07 (núcleo de Angular) · 08 → 09 → 10.

`_pruebas.ts` es el ejecutor de pruebas: no hace falta tocarlo.
