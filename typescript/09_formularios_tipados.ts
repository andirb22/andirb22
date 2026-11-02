/**
 * EJERCICIO 09 — Formularios reactivos tipados (mini FormControl / FormGroup)
 * Tema: genéricos que infieren el tipo del valor, validadores síncronos y de grupo,
 * estado (dirty/touched/disabled), notificación de cambios
 * Basado en: la guía EPAM ("Forms: typed forms, custom validators, ControlValueAccessor")
 * Tiempo sugerido: 50 min
 *
 * Ejecutar:  node typescript/09_formularios_tipados.ts      Tipos:  npx tsc -p typescript
 *
 * ENUNCIADO
 * ---------
 * A) class Control<T>
 *    new Control(valorInicial, validadores?)
 *    .valor: T                  .errores: Errores | null (unión de los errores de todos los
 *    .valido: boolean            validadores; null si no hay ninguno)
 *    .sucio (dirty): true después de setValor   .tocado (touched): true tras marcarTocado()
 *    .deshabilitado: boolean    deshabilitar() / habilitar()  (deshabilitado => valido y errores null)
 *    setValor(v)  reset()  -> reset vuelve al valor INICIAL y limpia sucio y tocado
 *    alCambiar(fn) -> fn(valor) en cada setValor/reset; devuelve función para desuscribirse
 *
 * B) class Grupo<C>  — C es un objeto de Controles (o Grupos anidados)
 *    new Grupo({ email: new Control(""), edad: new Control(0) }, validadoresDeGrupo?)
 *    .controles: C
 *    .valor        -> objeto con los valores, EXCLUYENDO los controles deshabilitados.
 *                     Tipo: Partial<ValorDe<C>>  (como form.value en Angular)
 *    .valorCompleto-> todos, incluidos los deshabilitados. Tipo: ValorDe<C> (getRawValue)
 *    .errores      -> errores de los validadores DEL GRUPO (no los de los hijos)
 *    .valido       -> sin errores de grupo y todos los hijos habilitados válidos
 *    .sucio / .tocado -> true si algún hijo lo está
 *    setValor(parcial) -> como patchValue: solo los campos que vienen, también dentro de
 *                         grupos anidados (tipo ParcialProfundo<ValorDe<C>>, ya definido)
 *    marcarTodoTocado(), reset()
 *    ValorDe<C> es un TIPO que debes implementar: { [k]: tipo del valor de cada control }.
 *
 * C) Validadores (fábricas que devuelven Validador<T>):
 *    requerido            -> { requerido: true } si es "", null, undefined o array vacío
 *    longitudMinima(n)    -> { longitudMinima: { requerida: n, actual: len } }  (no valida "": eso es de requerido)
 *    patron(re, nombre)   -> { [nombre]: true } si no cumple (no valida "")
 *    rango(min, max)      -> { rango: { min, max, actual } } para números fuera de rango
 *    coinciden(a, b)      -> validador de GRUPO: { noCoinciden: [a, b] } si los valores difieren
 *
 * PARA PENSAR
 * -----------
 * - ¿Por qué form.value de Angular es Partial y getRawValue() no?
 * - ¿Qué es updateOn: 'blur' y cuándo lo usarías?
 * - ¿Cómo harías un validador asíncrono (email ya registrado) sin saturar al backend?
 */
import { ejecutar, igual, ok, pendiente, type Esperar, type Iguales } from "./_pruebas.ts";

export type Errores = Record<string, unknown>;
/** Ya está hecho: todo opcional en profundidad (para setValor de un Grupo). */
export type ParcialProfundo<T> = T extends object ? { [K in keyof T]?: ParcialProfundo<T[K]> } : T;
export type Validador<T> = (valor: T) => Errores | null;

// ==== TU SOLUCIÓN (inicio) ====
export class Control<T> {
  constructor(valorInicial: T, validadores: Validador<NoInfer<T>>[] = []) {
    pendiente();
  }
  get valor(): T { return pendiente(); }
  get errores(): Errores | null { return pendiente(); }
  get valido(): boolean { return pendiente(); }
  get sucio(): boolean { return pendiente(); }
  get tocado(): boolean { return pendiente(); }
  get deshabilitado(): boolean { return pendiente(); }
  setValor(valor: T): void { pendiente(); }
  reset(): void { pendiente(); }
  marcarTocado(): void { pendiente(); }
  deshabilitar(): void { pendiente(); }
  habilitar(): void { pendiente(); }
  alCambiar(fn: (valor: T) => void): () => void { pendiente(); }
}

export type ValorDe<C> = unknown; // TODO: tipo del valor de un objeto de controles/grupos

export class Grupo<C extends Record<string, Control<any> | Grupo<any>>> {
  constructor(controles: C, validadores: Validador<ValorDe<C>>[] = []) {
    pendiente();
  }
  get controles(): C { return pendiente(); }
  get valor(): Partial<ValorDe<C>> { return pendiente(); }
  get valorCompleto(): ValorDe<C> { return pendiente(); }
  get errores(): Errores | null { return pendiente(); }
  get valido(): boolean { return pendiente(); }
  get sucio(): boolean { return pendiente(); }
  get tocado(): boolean { return pendiente(); }
  get deshabilitado(): boolean { return false; }
  setValor(parcial: ParcialProfundo<ValorDe<C>>): void { pendiente(); }
  marcarTodoTocado(): void { pendiente(); }
  reset(): void { pendiente(); }
}

export const requerido: Validador<unknown> = (valor) => pendiente();

export function longitudMinima(n: number): Validador<string> {
  pendiente();
}

export function patron(re: RegExp, nombre: string): Validador<string> {
  pendiente();
}

export function rango(min: number, max: number): Validador<number> {
  pendiente();
}

export function coinciden(a: string, b: string): Validador<any> {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS DE TIPOS — no modificar (las revisa `tsc`; esta función nunca se ejecuta)
// ============================================================================
export function _pruebasDeTipos() {
  const g = new Grupo({
    email: new Control(""),
    edad: new Control(18),
    direccion: new Grupo({ ciudad: new Control("Bogotá"), principal: new Control(true) }),
  });
  type _V = Esperar<Iguales<typeof g.valorCompleto, { email: string; edad: number; direccion: { ciudad: string; principal: boolean } }>>;
  // @ts-expect-error: edad es number
  g.setValor({ edad: "18" });
  g.setValor({ direccion: { ciudad: "Cali" } });
}

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
function registro() {
  return new Grupo(
    {
      email: new Control("", [requerido, patron(/^[^@\s]+@[^@\s]+\.\w+$/, "email")]),
      password: new Control("", [requerido, longitudMinima(8)]),
      confirmar: new Control(""),
      edad: new Control(20, [rango(18, 120)]),
      direccion: new Grupo({ ciudad: new Control("Bogotá", [requerido]), calle: new Control("") }),
    },
    [coinciden("password", "confirmar")],
  );
}

ejecutar({
  validadores() {
    igual(requerido(""), { requerido: true });
    igual(requerido([]), { requerido: true });
    igual(requerido(0), null, "0 es un valor válido");
    igual(longitudMinima(3)("ab"), { longitudMinima: { requerida: 3, actual: 2 } });
    igual(longitudMinima(3)(""), null, "el vacío lo valida requerido, no longitudMinima");
    igual(patron(/^\d+$/, "numerico")("12a"), { numerico: true });
    igual(patron(/^\d+$/, "numerico")(""), null);
    igual(rango(1, 5)(9), { rango: { min: 1, max: 5, actual: 9 } });
    igual(coinciden("a", "b")({ a: 1, b: 1 }), null);
    igual(coinciden("a", "b")({ a: 1, b: 2 }), { noCoinciden: ["a", "b"] });
  },
  control_estado() {
    const c = new Control("", [requerido, longitudMinima(3)]);
    igual(c.errores, { requerido: true });
    ok(!c.valido && !c.sucio && !c.tocado);
    c.setValor("ab");
    igual(c.errores, { longitudMinima: { requerida: 3, actual: 2 } });
    ok(c.sucio);
    c.setValor("abc");
    ok(c.valido && c.errores === null);
    c.marcarTocado();
    ok(c.tocado);
    c.reset();
    igual(c.valor, "");
    ok(!c.sucio && !c.tocado, "reset limpia sucio y tocado");
  },
  control_deshabilitado_y_cambios() {
    const c = new Control(5, [rango(10, 20)]);
    ok(!c.valido);
    c.deshabilitar();
    ok(c.valido && c.errores === null, "un control deshabilitado no se valida");
    c.habilitar();
    ok(!c.valido);
    const vistos: number[] = [];
    const quitar = c.alCambiar((v) => vistos.push(v));
    c.setValor(15);
    c.reset();
    quitar();
    c.setValor(11);
    igual(vistos, [15, 5]);
  },
  grupo_valor_y_validez() {
    const f = registro();
    ok(!f.valido);
    f.setValor({ email: "ana@x.co", password: "secreta123", confirmar: "otra", direccion: { calle: "Cra 7" } });
    igual(f.errores, { noCoinciden: ["password", "confirmar"] });
    ok(!f.valido);
    f.controles.confirmar.setValor("secreta123");
    ok(f.valido, "ya debería ser válido");
    igual(f.valor, {
      email: "ana@x.co", password: "secreta123", confirmar: "secreta123", edad: 20,
      direccion: { ciudad: "Bogotá", calle: "Cra 7" },
    });
    f.controles.direccion.controles.ciudad.setValor("");
    ok(!f.valido, "un hijo anidado inválido invalida el grupo");
  },
  grupo_deshabilitados_sucio_tocado_reset() {
    const f = registro();
    f.controles.edad.deshabilitar();
    ok(!("edad" in f.valor), "valor excluye los deshabilitados");
    igual(f.valorCompleto.edad, 20, "valorCompleto los incluye");
    ok(!f.sucio && !f.tocado);
    f.controles.direccion.controles.calle.setValor("x");
    ok(f.sucio, "sucio si algún hijo (aunque esté anidado) lo está");
    f.marcarTodoTocado();
    ok(f.controles.email.tocado && f.controles.direccion.controles.ciudad.tocado);
    f.reset();
    ok(!f.sucio && !f.tocado);
    igual(f.valorCompleto.direccion.calle, "");
  },
});
