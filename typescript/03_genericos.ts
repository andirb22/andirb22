/**
 * EJERCICIO 03 — Genéricos: bus de eventos tipado y caché con carga deduplicada
 * Tema: genéricos con restricciones, keyof, tipos indexados, tuplas condicionales,
 * promesas compartidas (single-flight)
 * Basado en: la guía EPAM (comunicación entre módulos, "caching", "async communication")
 * y el patrón de servicios con estado en Angular
 * Tiempo sugerido: 40 min
 *
 * Ejecutar:  node typescript/03_genericos.ts      Tipos:  npx tsc -p typescript
 *
 * ENUNCIADO
 * ---------
 * A) class BusEventos<M>  — M es un "mapa" evento -> payload, por ejemplo EventosApp (abajo).
 *    Los métodos ya existen pero están tipados con `any`/`string`. Tu trabajo es doble:
 *    1. Implementarlos:
 *       on(evento, handler)   -> registra; devuelve función para desregistrar
 *       once(evento, handler) -> solo la primera vez; devuelve función para desregistrar
 *       emit(evento, payload?)-> llama a los handlers en orden de registro
 *       cantidad(evento)      -> número de handlers registrados
 *    2. TIPARLOS para que el compilador (sección PRUEBAS DE TIPOS) obligue a:
 *       - usar solo eventos que existen en M,
 *       - que el handler reciba el payload correcto,
 *       - que emit exija el payload correcto y NO acepte payload en eventos `void`
 *         (bus.emit("carrito:vaciado") sin segundo argumento).
 *       Pista: `...args: M[K] extends void ? [] : [M[K]]`
 *
 * B) agruparPor(items, clave)
 *    Agrupa en un objeto. Tipa la función para que el resultado sea exactamente
 *    Partial<Record<K, T[]>> donde K es lo que devuelve `clave` (string literal si aplica).
 *
 * C) crearCache<K, V>(cargar, { ttlMs }) -> { obtener(k): Promise<V>; invalidar(k): void; tamaño(): number }
 *    1. obtener(k) llama a cargar(k) la primera vez y guarda el resultado durante ttlMs.
 *    2. Si se piden la MISMA clave varias veces a la vez mientras carga, cargar se llama
 *       UNA sola vez y todos reciben el mismo resultado (single-flight).
 *    3. Si cargar falla, el error llega a todos los que esperaban, y NO se guarda en caché
 *       (la siguiente llamada vuelve a intentar).
 *    4. Las claves se comparan con Map (por identidad), así que pueden ser objetos.
 *    5. tamaño() cuenta entradas guardadas (incluidas las que están cargando).
 *
 * PARA PENSAR
 * -----------
 * - ¿Cómo se llama lo que hace el punto C.2 en un servicio Angular con shareReplay?
 * - ¿Por qué `Record<string, any>` como restricción de M es peor que `object`?
 */
import { ejecutar, espera, igual, ok, pendiente, rechaza, type Esperar, type Iguales } from "./_pruebas.ts";

export interface EventosApp {
  "usuario:login": { id: number; nombre: string };
  "carrito:vaciado": void;
  toast: string;
}

// ==== TU SOLUCIÓN (inicio) ====
export class BusEventos<M extends object> {
  on(evento: string, handler: (payload: any) => void): () => void {
    pendiente();
  }

  once(evento: string, handler: (payload: any) => void): () => void {
    pendiente();
  }

  emit(evento: string, ...args: any[]): void {
    pendiente();
  }

  cantidad(evento: string): number {
    pendiente();
  }
}

export function agruparPor(items: any[], clave: (item: any) => any): any {
  pendiente();
}

export function crearCache<K, V>(
  cargar: (clave: K) => Promise<V>,
  opciones: { ttlMs: number },
): { obtener(clave: K): Promise<V>; invalidar(clave: K): void; tamaño(): number } {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS DE TIPOS — no modificar (las revisa `tsc`; esta función nunca se ejecuta)
// ============================================================================
export function _pruebasDeTipos(bus: BusEventos<EventosApp>) {
  bus.on("usuario:login", (u) => {
    const nombre: string = u.nombre;
    void nombre;
  });
  // @ts-expect-error: el evento no existe
  bus.on("no-existe", () => {});
  // @ts-expect-error: el payload de toast es string, no tiene .nombre
  bus.on("toast", (t) => t.nombre);
  bus.emit("carrito:vaciado");
  // @ts-expect-error: un evento void no lleva payload
  bus.emit("carrito:vaciado", 1);
  // @ts-expect-error: falta el payload
  bus.emit("toast");
  // @ts-expect-error: el payload no tiene la forma correcta
  bus.emit("usuario:login", { id: "1", nombre: "x" });
  bus.emit("toast", "hola");

  const grupos = agruparPor([{ t: "a" as const, v: 1 }, { t: "b" as const, v: 2 }], (x) => x.t);
  type _G = Esperar<Iguales<typeof grupos, Partial<Record<"a" | "b", ({ t: "a"; v: number } | { t: "b"; v: number })[]>>>>;

  const cache = crearCache(async (id: number) => ({ id, nombre: "x" }), { ttlMs: 10 });
  type _C = Esperar<Iguales<ReturnType<typeof cache.obtener>, Promise<{ id: number; nombre: string }>>>;
}

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
ejecutar({
  bus_on_emit() {
    const bus = new BusEventos<EventosApp>();
    const vistos: unknown[] = [];
    bus.on("usuario:login", (u) => vistos.push(["h1", u]));
    bus.on("usuario:login", (u) => vistos.push(["h2", u.id]));
    bus.emit("usuario:login", { id: 7, nombre: "Ana" });
    igual(vistos, [["h1", { id: 7, nombre: "Ana" }], ["h2", 7]]);
    igual(bus.cantidad("usuario:login"), 2);
    igual(bus.cantidad("toast"), 0);
    bus.emit("toast", "nadie escucha"); // no lanza
  },
  bus_desregistrar_y_once() {
    const bus = new BusEventos<EventosApp>();
    let n = 0;
    const quitar = bus.on("carrito:vaciado", () => n++);
    bus.emit("carrito:vaciado");
    quitar();
    quitar();
    bus.emit("carrito:vaciado");
    igual(n, 1);
    const recibidos: string[] = [];
    bus.once("toast", (t) => recibidos.push(t));
    bus.emit("toast", "a");
    bus.emit("toast", "b");
    igual(recibidos, ["a"]);
    igual(bus.cantidad("toast"), 0);
  },
  agrupar_por() {
    const r = agruparPor([1.2, 1.8, 2.5], Math.floor);
    igual(r, { 1: [1.2, 1.8], 2: [2.5] });
    igual(agruparPor([], (x: number) => x), {});
  },
  async cache_basico_y_ttl() {
    let cargas = 0;
    const cache = crearCache(async (id: number) => {
      cargas++;
      await espera(5);
      return `usuario-${id}-v${cargas}`;
    }, { ttlMs: 60 });
    igual(await cache.obtener(1), "usuario-1-v1");
    igual(await cache.obtener(1), "usuario-1-v1");
    igual(cargas, 1);
    await espera(80);
    igual(await cache.obtener(1), "usuario-1-v2", "después del TTL debe volver a cargar");
    cache.invalidar(1);
    igual(await cache.obtener(1), "usuario-1-v3", "invalidar debe forzar una nueva carga");
  },
  async cache_single_flight() {
    let cargas = 0;
    const cache = crearCache(async (k: string) => {
      cargas++;
      await espera(20);
      return k.toUpperCase();
    }, { ttlMs: 1000 });
    const r = await Promise.all([cache.obtener("a"), cache.obtener("a"), cache.obtener("a"), cache.obtener("b")]);
    igual(r, ["A", "A", "A", "B"]);
    igual(cargas, 2, "3 pedidos simultáneos de 'a' deben producir 1 sola carga");
    igual(cache.tamaño(), 2);
  },
  async cache_errores_no_se_guardan() {
    let intentos = 0;
    const cache = crearCache(async (_k: object) => {
      intentos++;
      await espera(5);
      if (intentos === 1) throw new Error("caído");
      return "ok";
    }, { ttlMs: 1000 });
    const clave = { id: 1 };
    const [e1, e2] = await Promise.all([rechaza(cache.obtener(clave)), rechaza(cache.obtener(clave))]);
    ok(e1.message === "caído" && e2.message === "caído", "el error debe llegar a todos los que esperaban");
    igual(await cache.obtener(clave), "ok");
    igual(intentos, 2);
    igual(await cache.obtener({ id: 1 }), "ok");
    igual(intentos, 3, "otra referencia de objeto es otra clave");
  },
});
