/**
 * EJERCICIO 07 — Implementa signals reactivos (signal, computed, effect)
 * Tema: reactividad de grano fino, seguimiento automático de dependencias, memoización,
 * evaluación perezosa, agrupar actualizaciones (batching)
 * Basado en: la guía EPAM ("change detection: OnPush, zone-less ideas") — los signals son
 * la base de la detección de cambios zoneless en Angular moderno
 * Tiempo sugerido: 60 min (es el más difícil; hazlo por partes)
 *
 * Ejecutar:  node TGI_SOLUCIONES/typescript/07_signals.ts
 *
 * ENUNCIADO
 * ---------
 * A) signal(inicial, { igual = Object.is }?)
 *    Devuelve una función lectora con métodos:
 *      const contador = signal(0);
 *      contador()            -> lee el valor (y registra la dependencia si hay un
 *                               computed/effect "escuchando")
 *      contador.set(5)
 *      contador.update(v => v + 1)
 *      contador.soloLectura()-> una función que solo lee (sin set/update)
 *    Si el valor nuevo es "igual" al actual (según `igual`), NO notifica a nadie.
 *
 * B) computed(fn, { igual = Object.is }?)
 *    1. PEREZOSO: no ejecuta fn hasta que alguien lo lee.
 *    2. MEMOIZADO: si sus dependencias no cambiaron, leerlo otra vez no ejecuta fn.
 *    3. Dependencias DINÁMICAS: se registran en cada ejecución. En
 *       computed(() => mostrar() ? nombre() : "oculto"), mientras mostrar() sea false,
 *       cambiar nombre NO debe recalcular.
 *    4. Un computed puede depender de otros computed.
 *    5. Si el resultado recalculado es "igual" al anterior, quien depende de él no se
 *       considera cambiado (un effect que solo lee ese computed no se vuelve a ejecutar).
 *
 * C) effect(fn) -> { destruir() }
 *    1. Se ejecuta una vez de inmediato (síncrono) y registra sus dependencias.
 *    2. Cuando alguna cambia, se vuelve a ejecutar en una MICROTAREA (queueMicrotask), y
 *       varios set seguidos en el mismo tick producen UNA sola ejecución.
 *    3. fn recibe `alLimpiar(cb)`: cb se ejecuta antes de la siguiente ejecución y al destruir
 *       (para cancelar timers, suscripciones...).
 *    4. Después de destruir() no se vuelve a ejecutar.
 *
 * D) noRastrear(fn): ejecuta fn y devuelve su valor SIN registrar dependencias.
 *
 * PARA PENSAR
 * -----------
 * - ¿En qué se diferencia un signal de un BehaviorSubject?
 * - ¿Por qué Angular agenda los effects en vez de ejecutarlos en cada set?
 * - ¿Cómo permiten los signals actualizar solo el componente afectado, sin revisar todo el árbol?
 */
import { ejecutar, igual, microtareas, ok, pendiente } from "./_pruebas.ts";

export type SignalLectura<T> = () => T;
export interface SignalEscritura<T> extends SignalLectura<T> {
  set(valor: T): void;
  update(fn: (actual: T) => T): void;
  soloLectura(): SignalLectura<T>;
}
export interface OpcionesSignal<T> {
  igual?: (a: T, b: T) => boolean;
}

// ==== TU SOLUCIÓN (inicio) ====
export function signal<T>(inicial: T, opciones?: OpcionesSignal<T>): SignalEscritura<T> {
  pendiente();
}

export function computed<T>(fn: () => T, opciones?: OpcionesSignal<T>): SignalLectura<T> {
  pendiente();
}

export function effect(fn: (alLimpiar: (cb: () => void) => void) => void): { destruir(): void } {
  pendiente();
}

export function noRastrear<T>(fn: () => T): T {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
ejecutar({
  signal_basico() {
    const s = signal(1);
    igual(s(), 1);
    s.set(2);
    s.update((v) => v * 10);
    igual(s(), 20);
    const ro = s.soloLectura();
    igual(ro(), 20);
    ok(!("set" in ro), "soloLectura no debe exponer set");
  },
  computed_perezoso_y_memoizado() {
    const a = signal(2);
    let ejecuciones = 0;
    const doble = computed(() => {
      ejecuciones++;
      return a() * 2;
    });
    igual(ejecuciones, 0, "computed debe ser perezoso");
    igual(doble(), 4);
    igual(doble(), 4);
    igual(ejecuciones, 1, "sin cambios no debe recalcular");
    a.set(5);
    igual(ejecuciones, 1, "tampoco recalcula hasta que se lee");
    igual(doble(), 10);
    igual(ejecuciones, 2);
  },
  computed_encadenado() {
    const precio = signal(100);
    const cantidad = signal(2);
    const subtotal = computed(() => precio() * cantidad());
    const total = computed(() => Math.round(subtotal() * 1.19));
    igual(total(), 238);
    cantidad.set(3);
    igual(total(), 357);
  },
  computed_dependencias_dinamicas() {
    const mostrar = signal(false);
    const nombre = signal("Ana");
    let ejecuciones = 0;
    const etiqueta = computed(() => {
      ejecuciones++;
      return mostrar() ? nombre() : "oculto";
    });
    igual(etiqueta(), "oculto");
    nombre.set("Luis");
    igual(etiqueta(), "oculto");
    igual(ejecuciones, 1, "nombre no es dependencia mientras mostrar() es false");
    mostrar.set(true);
    igual(etiqueta(), "Luis");
    mostrar.set(false);
    igual(etiqueta(), "oculto");
    const antes = ejecuciones;
    nombre.set("Eva");
    igual(etiqueta(), "oculto");
    igual(ejecuciones, antes, "al volver a false, nombre debe dejar de ser dependencia");
  },
  async effect_inmediato_y_agrupado() {
    const a = signal(1);
    const b = signal(10);
    const vistos: number[] = [];
    const ef = effect(() => {
      vistos.push(a() + b());
    });
    igual(vistos, [11], "el effect se ejecuta de inmediato");
    a.set(2);
    b.set(20);
    a.set(3);
    igual(vistos, [11], "no debe ejecutarse de forma síncrona en cada set");
    await microtareas();
    igual(vistos, [11, 23], "varios set en el mismo tick -> una sola ejecución");
    ef.destruir();
    a.set(100);
    await microtareas();
    igual(vistos, [11, 23], "después de destruir no se ejecuta");
  },
  async effect_y_computed_igual() {
    const edad = signal(17);
    const esMayor = computed(() => edad() >= 18);
    let ejecuciones = 0;
    effect(() => {
      esMayor();
      ejecuciones++;
    });
    edad.set(16);
    await microtareas();
    igual(ejecuciones, 1, "el computed dio el mismo resultado: el effect no debe repetirse");
    edad.set(20);
    await microtareas();
    igual(ejecuciones, 2);
    edad.set(20); // mismo valor en el signal
    await microtareas();
    igual(ejecuciones, 2);
  },
  async effect_limpieza() {
    const id = signal(1);
    const log: string[] = [];
    const ef = effect((alLimpiar) => {
      const actual = id();
      log.push(`suscribe ${actual}`);
      alLimpiar(() => log.push(`limpia ${actual}`));
    });
    id.set(2);
    await microtareas();
    ef.destruir();
    igual(log, ["suscribe 1", "limpia 1", "suscribe 2", "limpia 2"]);
  },
  async no_rastrear_y_comparador() {
    const a = signal(1);
    const b = signal(1);
    let n = 0;
    effect(() => {
      a();
      noRastrear(() => b());
      n++;
    });
    b.set(2);
    await microtareas();
    igual(n, 1, "b se leyó con noRastrear: no es dependencia");
    const lista = signal([1, 2], { igual: (x, y) => x.length === y.length });
    let m = 0;
    effect(() => {
      lista();
      m++;
    });
    lista.set([3, 4]);
    await microtareas();
    igual(m, 1, "el comparador dice que son iguales: no notifica");
    lista.set([1]);
    await microtareas();
    igual(m, 2);
  },
});
