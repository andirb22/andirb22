/**
 * EJERCICIO 04 — Implementa tu propio Observable (mini RxJS)
 * Tema: patrón observador, suscripciones y limpieza (teardown), Subject vs Observable,
 * operadores como funciones puras
 * Basado en: la guía EPAM ("RxJS advanced: multicasting/share, custom operators,
 * subscription management") y la pregunta "¿cómo previenes fugas de memoria con RxJS?"
 * Tiempo sugerido: 50 min
 *
 * Ejecutar:  node TGI_SOLUCIONES/typescript/04_observable.ts
 *
 * ENUNCIADO
 * ---------
 * A) class Observable<T>
 *    new Observable<T>((suscriptor) => { ...; return limpieza? })
 *      - `suscriptor` tiene next(v), error(e), complete().
 *      - La función puede devolver una función de limpieza (teardown).
 *    .subscribe(observador | next) -> Suscripcion { unsubscribe(): void; readonly cerrada: boolean }
 *    Contrato (es lo que de verdad evalúan):
 *    1. Es PEREZOSO (cold): la función no se ejecuta hasta que alguien se suscribe, y se
 *       ejecuta una vez POR CADA suscripción.
 *    2. Después de error() o complete() no se entrega nada más.
 *    3. La limpieza se ejecuta UNA sola vez: al completar, al dar error, o al desuscribirse
 *       (lo que pase primero). Si el stream terminó de forma síncrona antes de devolver la
 *       limpieza, se ejecuta igual en cuanto se devuelve.
 *    4. Después de unsubscribe() no se entrega nada más.
 *    5. Si el observador no tiene `error` y llega un error, no debe lanzar al productor
 *       (puedes ignorarlo o reportarlo con console.error).
 *    .pipe(...operadores) -> aplica los operadores de izquierda a derecha.
 *
 * B) Creadores:  de(...valores)  -> emite los valores de forma síncrona y completa.
 *                intervalo(ms)   -> emite 0, 1, 2... cada ms; al desuscribirse limpia el timer.
 *
 * C) Operadores (funciones que reciben un Observable y devuelven otro):
 *    mapear(fn), filtrar(predicado), tomar(n) -> emite los primeros n y COMPLETA,
 *    desuscribiéndose de la fuente (sin tomar(n), intervalo seguiría corriendo para siempre).
 *
 * D) class Subject<T>: es a la vez Observable y observador. Multicast: todos los
 *    suscriptores reciben los mismos valores; los que llegan tarde solo reciben los
 *    siguientes. Si ya completó, un suscriptor nuevo recibe complete de inmediato.
 *    class BehaviorSubject<T> extends Subject<T>: tiene valor actual (`.valor`) y lo
 *    entrega de inmediato a cada suscriptor nuevo.
 *
 * PARA PENSAR
 * -----------
 * - ¿Por qué un HttpClient de Angular hace una petición nueva por cada subscribe?
 * - ¿Qué hace shareReplay(1) y qué problema resuelve?
 * - ¿Qué streams de Angular NO completan solos y por eso pueden fugar memoria?
 */
import { ejecutar, espera, igual, ok, pendiente } from "./_pruebas.ts";

export interface Observador<T> {
  next?: (valor: T) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
}
export interface Suscriptor<T> {
  next(valor: T): void;
  error(err: unknown): void;
  complete(): void;
}
export interface Suscripcion {
  unsubscribe(): void;
  readonly cerrada: boolean;
}
export type Limpieza = (() => void) | void;
export type Operador<A, B> = (fuente: Observable<A>) => Observable<B>;

// ==== TU SOLUCIÓN (inicio) ====
export class Observable<T> {
  constructor(alSuscribirse: (suscriptor: Suscriptor<T>) => Limpieza) {
    pendiente();
  }

  subscribe(observador?: Observador<T> | ((valor: T) => void)): Suscripcion {
    pendiente();
  }

  pipe(...operadores: Operador<any, any>[]): Observable<any> {
    pendiente();
  }
}

export function de<T>(...valores: T[]): Observable<T> {
  pendiente();
}

export function intervalo(ms: number): Observable<number> {
  pendiente();
}

export function mapear<A, B>(fn: (valor: A) => B): Operador<A, B> {
  pendiente();
}

export function filtrar<T>(predicado: (valor: T) => boolean): Operador<T, T> {
  pendiente();
}

export function tomar<T>(n: number): Operador<T, T> {
  pendiente();
}

export class Subject<T> extends Observable<T> implements Suscriptor<T> {
  constructor() {
    super(() => {});
    pendiente();
  }
  next(valor: T): void {
    pendiente();
  }
  error(err: unknown): void {
    pendiente();
  }
  complete(): void {
    pendiente();
  }
}

export class BehaviorSubject<T> extends Subject<T> {
  constructor(inicial: T) {
    super();
    pendiente();
  }
  get valor(): T {
    return pendiente();
  }
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
function registrar<T>(obs: Observable<T>) {
  const eventos: unknown[] = [];
  const sub = obs.subscribe({
    next: (v) => eventos.push(v),
    error: (e) => eventos.push(["error", (e as Error).message ?? e]),
    complete: () => eventos.push("fin"),
  });
  return { eventos, sub };
}

ejecutar({
  perezoso_y_por_suscripcion() {
    let ejecuciones = 0;
    const obs = new Observable<number>((s) => {
      ejecuciones++;
      s.next(ejecuciones);
      s.complete();
    });
    igual(ejecuciones, 0, "no debe ejecutarse antes de subscribe");
    igual(registrar(obs).eventos, [1, "fin"]);
    igual(registrar(obs).eventos, [2, "fin"], "cada suscripción ejecuta la función de nuevo");
  },
  nada_despues_de_complete_o_error() {
    const obs = new Observable<number>((s) => {
      s.next(1);
      s.complete();
      s.next(2);
      s.error(new Error("tarde"));
    });
    igual(registrar(obs).eventos, [1, "fin"]);
    const obs2 = new Observable<number>((s) => {
      s.error(new Error("boom"));
      s.next(1);
      s.complete();
    });
    igual(registrar(obs2).eventos, [["error", "boom"]]);
  },
  limpieza_una_sola_vez() {
    let limpiezas = 0;
    const sincrono = new Observable<number>((s) => {
      s.next(1);
      s.complete();
      return () => limpiezas++;
    });
    const { sub } = registrar(sincrono);
    igual(limpiezas, 1, "si completó de forma síncrona, la limpieza debe correr al devolverse");
    ok(sub.cerrada, "la suscripción debe quedar cerrada");
    sub.unsubscribe();
    igual(limpiezas, 1, "la limpieza no debe correr dos veces");
  },
  async unsubscribe_detiene_y_limpia() {
    let limpio = false;
    const { eventos, sub } = registrar(
      new Observable<number>((s) => {
        let i = 0;
        const id = setInterval(() => s.next(i++), 10);
        return () => {
          clearInterval(id);
          limpio = true;
        };
      }),
    );
    await espera(35);
    sub.unsubscribe();
    const n = eventos.length;
    ok(n >= 2, "debió emitir antes de desuscribirse");
    ok(limpio, "unsubscribe debe ejecutar la limpieza");
    await espera(30);
    igual(eventos.length, n, "siguió emitiendo después de unsubscribe");
  },
  observador_como_funcion_y_sin_error() {
    const vistos: number[] = [];
    de(1, 2, 3).subscribe((v) => vistos.push(v));
    igual(vistos, [1, 2, 3]);
    new Observable<number>((s) => s.error(new Error("sin handler"))).subscribe(() => {});
  },
  operadores_y_pipe() {
    const r = registrar(de(1, 2, 3, 4, 5, 6).pipe(filtrar((x: number) => x % 2 === 0), mapear((x: number) => x * 10)));
    igual(r.eventos, [20, 40, 60, "fin"]);
    const fuente = de(1, 2, 3);
    igual(registrar(fuente.pipe()).eventos, [1, 2, 3, "fin"]);
  },
  async tomar_completa_y_corta_la_fuente() {
    const r = registrar(intervalo(10).pipe(tomar(3)));
    await espera(80);
    igual(r.eventos, [0, 1, 2, "fin"]);
    ok(r.sub.cerrada);
    let limpiezaFuente = false;
    const fuente = new Observable<number>((s) => {
      s.next(1);
      s.next(2);
      s.next(3);
      return () => (limpiezaFuente = true);
    });
    igual(registrar(fuente.pipe(tomar(2))).eventos, [1, 2, "fin"]);
    ok(limpiezaFuente, "tomar debe desuscribirse de la fuente al completar");
  },
  subject_multicast() {
    const s = new Subject<string>();
    const a = registrar(s);
    s.next("x");
    const b = registrar(s);
    s.next("y");
    b.sub.unsubscribe();
    s.next("z");
    s.complete();
    igual(a.eventos, ["x", "y", "z", "fin"]);
    igual(b.eventos, ["y"]);
    igual(registrar(s).eventos, ["fin"], "un suscriptor tardío de un Subject completado recibe solo complete");
  },
  behavior_subject() {
    const estado = new BehaviorSubject({ items: 0 });
    estado.next({ items: 1 });
    const a = registrar(estado);
    estado.next({ items: 2 });
    igual(a.eventos, [{ items: 1 }, { items: 2 }]);
    igual(estado.valor, { items: 2 });
  },
});
