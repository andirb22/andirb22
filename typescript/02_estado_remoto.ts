/**
 * EJERCICIO 02 — Estado de una petición con uniones discriminadas
 * Tema: uniones discriminadas, narrowing, chequeo exhaustivo con never, type guards,
 * validar datos `unknown` que vienen de una API
 * Basado en: la guía EPAM ("Angular advanced", manejo de estado, "security: input validation")
 * Tiempo sugerido: 35 min
 *
 * CONTEXTO
 * --------
 * En un componente Angular es común tener `cargando: boolean; error: string | null;
 * datos: T | null` y terminar con estados imposibles (cargando=true y error a la vez).
 * Se modela mejor con UNA unión discriminada.
 *
 * ENUNCIADO
 * ---------
 * A) El tipo `EstadoRemoto<T, E = string>` ya está definido abajo. Implementa:
 *    - reducirEstado(estado, evento): la máquina de estados. Eventos (también definidos):
 *        { tipo: "cargar" }            inicial | exito | error -> cargando
 *                                      (si había datos de un éxito anterior, consérvalos en
 *                                       `previos` para mostrarlos mientras recarga)
 *        { tipo: "exito", datos }      cargando -> exito
 *        { tipo: "fallo", error }      cargando -> error
 *        { tipo: "reiniciar" }         cualquiera -> inicial
 *      Cualquier otra combinación devuelve el MISMO objeto estado (sin cambios).
 *      El switch sobre evento.tipo debe ser exhaustivo: agrega un caso `default` que asigne
 *      el evento a una variable de tipo `never`. Compruébalo: agrega un evento nuevo a la
 *      unión `Evento` y verifica que `npx tsc -p typescript` marque el error (luego quítalo).
 *    - describir(estado): string para la UI:
 *        inicial -> "Sin datos"   cargando -> "Cargando…" (o "Actualizando…" si hay previos)
 *        exito   -> "N elementos" si datos es un array, si no "Listo"
 *        error   -> "Error: <error>"
 *
 * B) esUsuario(x: unknown): x is Usuario
 *    Type guard que valida la forma de los datos de una API (no confíes en el backend):
 *    id: entero positivo, email: string con "@", roles: array de "admin" | "editor" |
 *    "lector" (puede estar vacío), creadoEn: string de fecha válida (Date.parse no NaN).
 *    Propiedades extra se permiten.
 *
 * C) parsearUsuarios(json: string): Resultado<Usuario[]>
 *    Devuelve { ok: true, valor } si el JSON es un array y TODOS son usuarios válidos.
 *    Si no: { ok: false, error } con un mensaje: "JSON inválido", "se esperaba un array",
 *    o "elemento <i> inválido" (el primero que falle).
 *
 * PARA PENSAR
 * -----------
 * - ¿Qué ventaja tiene esto frente a 3 booleanos en la plantilla con @if?
 * - Un type guard mal escrito "miente" al compilador: ¿cómo lo mitigarías? (zod, io-ts...)
 */
import { ejecutar, igual, ok, pendiente } from "./_pruebas.ts";

export type EstadoRemoto<T, E = string> =
  | { estado: "inicial" }
  | { estado: "cargando"; previos?: T }
  | { estado: "exito"; datos: T }
  | { estado: "error"; error: E };

export type Evento<T, E = string> =
  | { tipo: "cargar" }
  | { tipo: "exito"; datos: T }
  | { tipo: "fallo"; error: E }
  | { tipo: "reiniciar" };

export type Rol = "admin" | "editor" | "lector";
export interface Usuario {
  id: number;
  email: string;
  roles: Rol[];
  creadoEn: string;
}

export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };

// ==== TU SOLUCIÓN (inicio) ====
export function reducirEstado<T, E>(estado: EstadoRemoto<T, E>, evento: Evento<T, E>): EstadoRemoto<T, E> {
  pendiente();
}

export function describir<T, E>(estado: EstadoRemoto<T, E>): string {
  pendiente();
}

export function esUsuario(x: unknown): x is Usuario {
  pendiente();
}

export function parsearUsuarios(json: string): Resultado<Usuario[]> {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
type E = EstadoRemoto<string[]>;
const INICIAL: E = { estado: "inicial" };

ejecutar({
  maquina_de_estados() {
    const c = reducirEstado(INICIAL, { tipo: "cargar" });
    igual(c, { estado: "cargando" } as E);
    const ex = reducirEstado(c, { tipo: "exito", datos: ["a", "b"] });
    igual(ex, { estado: "exito", datos: ["a", "b"] } as E);
    const recarga = reducirEstado(ex, { tipo: "cargar" });
    igual(recarga, { estado: "cargando", previos: ["a", "b"] } as E, "debe conservar los datos previos al recargar");
    const er = reducirEstado(recarga, { tipo: "fallo", error: "500" });
    igual(er, { estado: "error", error: "500" } as E);
    igual(reducirEstado(er, { tipo: "reiniciar" }), INICIAL);
  },
  transiciones_invalidas_no_cambian() {
    const ex: E = { estado: "exito", datos: [] };
    ok(reducirEstado(ex, { tipo: "fallo", error: "x" }) === ex, "exito + fallo debe devolver el mismo objeto");
    ok(reducirEstado(INICIAL, { tipo: "exito", datos: [] }) === INICIAL, "inicial + exito no es válido");
    const c: E = { estado: "cargando" };
    ok(reducirEstado(c, { tipo: "cargar" }) === c, "cargando + cargar no cambia");
  },
  describir_estados() {
    igual(describir(INICIAL), "Sin datos");
    igual(describir({ estado: "cargando" } as E), "Cargando…");
    igual(describir({ estado: "cargando", previos: ["x"] } as E), "Actualizando…");
    igual(describir({ estado: "exito", datos: ["a", "b", "c"] } as E), "3 elementos");
    igual(describir({ estado: "exito", datos: { total: 1 } } as EstadoRemoto<{ total: number }>), "Listo");
    igual(describir({ estado: "error", error: "timeout" } as E), "Error: timeout");
  },
  type_guard_usuario() {
    const valido = { id: 1, email: "a@b.co", roles: ["admin", "lector"], creadoEn: "2026-01-01T00:00:00Z", extra: true };
    ok(esUsuario(valido), "un usuario válido fue rechazado");
    ok(esUsuario({ ...valido, roles: [] }), "roles vacío es válido");
    const invalidos: unknown[] = [
      null, "x", [], { ...valido, id: 0 }, { ...valido, id: 1.5 }, { ...valido, id: "1" },
      { ...valido, email: "sin-arroba" }, { ...valido, roles: ["root"] }, { ...valido, roles: "admin" },
      { ...valido, creadoEn: "ayer" }, { id: 1, email: "a@b.co", roles: [] },
    ];
    invalidos.forEach((x, i) => ok(!esUsuario(x), `el caso inválido #${i} fue aceptado: ${JSON.stringify(x)}`));
  },
  parsear_usuarios() {
    const u = { id: 1, email: "a@b.co", roles: [], creadoEn: "2026-01-01" };
    igual(parsearUsuarios(JSON.stringify([u, { ...u, id: 2 }])), { ok: true, valor: [u, { ...u, id: 2 }] } as Resultado<Usuario[]>);
    igual(parsearUsuarios("{no es json"), { ok: false, error: "JSON inválido" } as Resultado<Usuario[]>);
    igual(parsearUsuarios(JSON.stringify(u)), { ok: false, error: "se esperaba un array" } as Resultado<Usuario[]>);
    igual(parsearUsuarios(JSON.stringify([u, { id: -1 }, {}])), { ok: false, error: "elemento 1 inválido" } as Resultado<Usuario[]>);
  },
});
