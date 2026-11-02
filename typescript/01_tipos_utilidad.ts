/**
 * EJERCICIO 01 — Tipos utilitarios propios
 * Tema: mapped types, conditional types, infer, template literal types, keyof
 * Basado en: la guía EPAM ("typed forms", "Angular advanced") — en entrevistas de Angular
 * senior es habitual pedir que implementes Pick/Omit/DeepReadonly o tipar parámetros de rutas
 * Tiempo sugerido: 40 min
 *
 * Este ejercicio tiene DOS partes:
 *   1) TIPOS: los comprueba el compilador.   ->  npx tsc -p typescript   (o: npm run tipos)
 *   2) FUNCIONES: las comprueban las pruebas. ->  node typescript/01_tipos_utilidad.ts
 * Mientras no implementes los tipos, `tsc` mostrará errores en la sección PRUEBAS DE TIPOS:
 * eso es lo esperado. El objetivo es dejarla sin errores.
 *
 * ENUNCIADO — TIPOS (sin usar los utilitarios nativos Pick, Omit, Readonly, Partial,
 * Exclude, ReturnType ni Awaited)
 * ------------------------------------------------------------------------------------
 * MiPick<T, K>          Como Pick: solo las claves K de T.
 * MiOmit<T, K>          Todas las claves de T excepto K.
 * MiReadonlyProfundo<T> Todo readonly en profundidad (objetos y arrays anidados). Las
 *                       funciones se dejan como están.
 * MiPartialProfundo<T>  Todo opcional en profundidad (las funciones se dejan como están).
 * Mutable<T>            Quita el readonly del primer nivel.
 * ElementoDe<T>         Tipo de los elementos de un array (o tupla); never si no es array.
 * ValorPromesa<T>       Lo que resuelve una promesa, aunque esté anidada
 *                       (Promise<Promise<number>> -> number). Si no es promesa, T.
 * ClavesDeTipo<T, V>    Unión de las claves de T cuyo valor es asignable a V.
 * ParamsDeRuta<R>       Para rutas estilo Angular: "/users/:id/posts/:postId"
 *                       -> { id: string; postId: string }. Sin parámetros -> {}.
 *
 * ENUNCIADO — FUNCIONES
 * ---------------------
 * pick(obj, ...claves)  -> objeto nuevo con solo esas claves, tipado con MiPick.
 * omit(obj, ...claves)  -> objeto nuevo sin esas claves, tipado con MiOmit.
 * parametrosDeRuta(patron, url) -> los parámetros de la URL según el patrón, o null si no
 *   coincide. Los segmentos fijos deben coincidir exactamente; los ":nombre" capturan un
 *   segmento (decodificado con decodeURIComponent). Ignora la "/" final y el query string.
 *     parametrosDeRuta("/users/:id", "/users/42?tab=1") -> { id: "42" }
 *     parametrosDeRuta("/users/:id", "/users/42/posts") -> null
 *
 * PARA PENSAR
 * -----------
 * - ¿Qué es un tipo "homomórfico" y por qué `{ [P in keyof T]: ... }` conserva el `?` y el readonly?
 * - ¿Para qué sirve `infer`? ¿Dónde lo usa Angular? (pista: tipos de inputs/outputs, signals)
 * - ¿Cuál es la diferencia entre `unknown` y `any` al recibir datos de una API?
 */
import { ejecutar, igual, ok, pendiente, type Esperar, type Iguales } from "./_pruebas.ts";

// ==== TU SOLUCIÓN (inicio) ====
export type MiPick<T, K extends keyof T> = unknown; // TODO
export type MiOmit<T, K extends PropertyKey> = unknown; // TODO
export type MiReadonlyProfundo<T> = unknown; // TODO
export type MiPartialProfundo<T> = unknown; // TODO
export type Mutable<T> = unknown; // TODO
export type ElementoDe<T> = unknown; // TODO
export type ValorPromesa<T> = unknown; // TODO
export type ClavesDeTipo<T, V> = unknown; // TODO
export type ParamsDeRuta<R extends string> = unknown; // TODO

export function pick<T extends object, K extends keyof T>(obj: T, ...claves: K[]): MiPick<T, K> {
  pendiente();
}

export function omit<T extends object, K extends keyof T>(obj: T, ...claves: K[]): MiOmit<T, K> {
  pendiente();
}

export function parametrosDeRuta<R extends string>(patron: R, url: string): ParamsDeRuta<R> | null {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS DE TIPOS — no modificar (las revisa `tsc`)
// ============================================================================
interface Usuario {
  readonly id: number;
  email: string;
  perfil?: { nombre: string; tags: string[] };
  saludar(): string;
}

export type PruebasDeTipos = [
  Esperar<Iguales<MiPick<Usuario, "id" | "email">, { readonly id: number; email: string }>>,
  Esperar<Iguales<MiOmit<Usuario, "saludar" | "perfil">, { readonly id: number; email: string }>>,
  Esperar<Iguales<Mutable<{ readonly a: 1; readonly b?: 2 }>, { a: 1; b?: 2 }>>,
  Esperar<Iguales<ElementoDe<string[]>, string>>,
  Esperar<Iguales<ElementoDe<readonly [1, "a"]>, 1 | "a">>,
  Esperar<Iguales<ElementoDe<number>, never>>,
  Esperar<Iguales<ValorPromesa<Promise<Promise<number>>>, number>>,
  Esperar<Iguales<ValorPromesa<string>, string>>,
  Esperar<Iguales<ClavesDeTipo<{ a: string; b: number; c: string | undefined; d(): void }, string>, "a">>,
  Esperar<Iguales<ParamsDeRuta<"/users/:id/posts/:postId">, { id: string; postId: string }>>,
  Esperar<Iguales<ParamsDeRuta<"/about">, {}>>,
];

// Solo para el compilador: esta función nunca se ejecuta
export function _pruebasDeTiposProfundos(
  ro: MiReadonlyProfundo<{ a: { b: number[] }; f: () => number }>,
): MiPartialProfundo<{ a: { b: { c: number } } }> {
  // @ts-expect-error: debe ser readonly en profundidad
  ro.a.b = [];
  // @ts-expect-error: los arrays anidados también deben ser readonly
  ro.a.b.push(1);
  const llamada: number = ro.f(); // las funciones siguen siendo invocables
  void llamada;
  return { a: { b: {} } }; // todo opcional en profundidad
}

// ============================================================================
// PRUEBAS DE FUNCIONES — no modificar (las ejecuta node)
// ============================================================================
ejecutar({
  pick_y_omit() {
    const u = { id: 1, email: "a@b.com", rol: "admin" };
    igual(pick(u, "id", "rol") as unknown, { id: 1, rol: "admin" });
    igual(omit(u, "rol") as unknown, { id: 1, email: "a@b.com" });
    igual(u, { id: 1, email: "a@b.com", rol: "admin" }, "no debe modificar el objeto original");
    ok(pick(u) !== (u as unknown), "debe devolver un objeto nuevo");
  },
  parametros_de_ruta() {
    igual(parametrosDeRuta("/users/:id", "/users/42?tab=1") as unknown, { id: "42" });
    igual(parametrosDeRuta("/users/:id/posts/:postId", "/users/7/posts/abc/") as unknown, { id: "7", postId: "abc" });
    igual(parametrosDeRuta("/users/:id", "/users/42/posts"), null);
    igual(parametrosDeRuta("/users/:id", "/clientes/42"), null);
    igual(parametrosDeRuta("/about", "/about") as unknown, {});
    igual(parametrosDeRuta("/buscar/:q", "/buscar/caf%C3%A9%20con%20leche") as unknown, { q: "café con leche" });
  },
});
