/**
 * Mini ejecutor de pruebas y aserciones para los ejercicios. No hace falta modificarlo.
 * No depende de @types/node: solo necesitas Node 22.18+ (ejecuta .ts directamente).
 */

export class NoImplementado extends Error {
  constructor() {
    super("pendiente");
    this.name = "NoImplementado";
  }
}

/** Úsalo (ya está puesto) en lo que aún no implementas. */
export function pendiente(): never {
  throw new NoImplementado();
}

export class FalloPrueba extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "FalloPrueba";
  }
}

function iguales(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Map && b instanceof Map) return iguales([...a], [...b]);
  if (a instanceof Set && b instanceof Set) return iguales([...a], [...b]);
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => iguales((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

const mostrar = (v: unknown) => {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

export function igual<T>(obtenido: T, esperado: T, mensaje = ""): void {
  if (!iguales(obtenido, esperado)) {
    throw new FalloPrueba(`${mensaje ? mensaje + " — " : ""}esperado ${mostrar(esperado)}, obtenido ${mostrar(obtenido)}`);
  }
}

export function ok(condicion: unknown, mensaje = "la condición no se cumplió"): asserts condicion {
  if (!condicion) throw new FalloPrueba(mensaje);
}

/** Verifica que fn lance un error; devuelve el error para inspeccionarlo. */
export function lanza(fn: () => unknown, mensaje = "se esperaba que lanzara un error"): Error {
  try {
    fn();
  } catch (e) {
    if (e instanceof NoImplementado) throw e;
    return e as Error;
  }
  throw new FalloPrueba(mensaje);
}

/** Verifica que la promesa se rechace; devuelve el error. */
export async function rechaza(p: Promise<unknown> | (() => Promise<unknown>), mensaje = "se esperaba un rechazo"): Promise<Error> {
  try {
    await (typeof p === "function" ? p() : p);
  } catch (e) {
    if (e instanceof NoImplementado) throw e;
    return e as Error;
  }
  throw new FalloPrueba(mensaje);
}

export const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Deja correr las microtareas pendientes (promesas ya resueltas, queueMicrotask). */
export const microtareas = () => new Promise<void>((r) => setTimeout(r, 0));

export async function ejecutar(pruebas: Record<string, () => unknown>): Promise<void> {
  let pasan = 0;
  let fallan = 0;
  let pendientes = 0;
  const nombres = Object.keys(pruebas);
  for (const nombre of nombres) {
    try {
      await pruebas[nombre]();
      pasan++;
      console.log(`  ✅ ${nombre}`);
    } catch (e) {
      if (e instanceof NoImplementado) {
        pendientes++;
        console.log(`  ⏳ ${nombre}: pendiente (sin implementar)`);
      } else if (e instanceof FalloPrueba) {
        fallan++;
        console.log(`  ❌ ${nombre}: ${e.message}`);
      } else {
        fallan++;
        console.log(`  💥 ${nombre}: excepción inesperada`);
        console.log("     " + String((e as Error)?.stack ?? e).split("\n").slice(0, 4).join("\n     "));
      }
    }
  }
  console.log(`\n${pasan}/${nombres.length} pasan · ${fallan} fallan · ${pendientes} pendientes`);
  const proceso = (globalThis as { process?: { exitCode?: number } }).process;
  if (proceso) proceso.exitCode = pasan === nombres.length ? 0 : 1;
}

// ---------------------------------------------------------------------------
// Utilidades para pruebas de TIPOS (las comprueba `tsc`, no node)
// ---------------------------------------------------------------------------
/** true si A y B son exactamente el mismo tipo. */
export type Iguales<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
/** Da error de compilación si T no es `true`. */
export type Esperar<T extends true> = T;
