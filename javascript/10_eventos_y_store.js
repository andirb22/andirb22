/**
 * EJERCICIO 10 — EventEmitter y un store tipo Redux/NgRx
 * Tema: patrón observador, inmutabilidad, closures, diseño de API pequeña
 * Basado en: "patrones de diseño en JavaScript" (reportado en EPAM) y la recomendación de
 * la guía: "prepara una historia de arquitectura: cómo organizaste el manejo de estado (NgRx)"
 * Tiempo sugerido: 40 min
 *
 * ENUNCIADO
 * ---------
 * A) class EventEmitter
 *    on(evento, listener)     -> registra; devuelve una función que lo DESREGISTRA
 *    once(evento, listener)   -> se ejecuta una sola vez; también devuelve el "desregistrar"
 *    off(evento, listener)    -> quita ese listener (si se registró dos veces, quita uno)
 *    emit(evento, ...args)    -> llama a los listeners en orden de registro con esos args;
 *                                devuelve true si había listeners, false si no
 *    listenerCount(evento)
 *    Requisitos:
 *    1. Si un listener se desregistra (o registra otro) DURANTE un emit, eso no afecta a
 *       la lista que se está recorriendo en ese emit.
 *    2. Si un listener lanza un error, los demás igual se ejecutan; al final emit vuelve a
 *       lanzar el PRIMER error.
 *    3. El evento especial "error": si se emite sin listeners, emit lanza el argumento
 *       (como en Node).
 *
 * B) crearStore(reducer, estadoInicial)
 *    Devuelve { getState, dispatch, subscribe, select }:
 *    - dispatch(accion): accion debe ser un objeto con `type` string (si no, TypeError).
 *      Calcula el nuevo estado con reducer(estado, accion) y, SOLO si la referencia del
 *      estado cambió, notifica a los suscriptores. Devuelve la acción.
 *    - subscribe(fn) -> devuelve una función para desuscribirse.
 *    - select(selector, fn): llama a fn(valor) solo cuando selector(estado) cambia (===),
 *      no en cada cambio de estado. NO llama de inmediato. Devuelve el "desuscribir".
 *    - getState() devuelve el estado congelado en profundidad (Object.freeze recursivo)
 *      para detectar mutaciones accidentales: modificarlo debe lanzar en modo estricto.
 *    - Llamar a dispatch dentro de un reducer lanza Error ("dispatch dentro de un reducer").
 *
 * PARA PENSAR
 * -----------
 * - ¿Por qué los reducers deben ser funciones puras? ¿Qué romperías mutando el estado?
 *   (pista: OnPush en Angular compara referencias)
 * - ¿Qué es un selector memoizado y por qué importa con listas grandes?
 * - ¿Cuándo NO usarías NgRx y te bastaría un servicio con signals o un BehaviorSubject?
 *
 * Ejecutar pruebas:  node javascript/10_eventos_y_store.js
 */
"use strict";
const assert = require("node:assert/strict");
const { ejecutar, pendiente } = require("./_pruebas");

// ==== TU SOLUCIÓN (inicio) ====
class EventEmitter {
  constructor() {
    pendiente();
  }
}

function crearStore(reducer, estadoInicial) {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
function carritoReducer(estado, accion) {
  switch (accion.type) {
    case "agregar":
      return { ...estado, items: [...estado.items, accion.item] };
    case "usuario":
      return { ...estado, usuario: accion.nombre };
    default:
      return estado; // misma referencia: no hubo cambio
  }
}
const INICIAL = { items: [], usuario: null };

ejecutar({
  emitter_basico() {
    const e = new EventEmitter();
    const recibidos = [];
    e.on("msg", (a, b) => recibidos.push(["l1", a, b]));
    e.on("msg", (a) => recibidos.push(["l2", a]));
    assert.equal(e.emit("msg", 1, 2), true);
    assert.equal(e.emit("otro"), false);
    assert.deepEqual(recibidos, [["l1", 1, 2], ["l2", 1]]);
    assert.equal(e.listenerCount("msg"), 2);
  },
  emitter_off_y_desregistrar() {
    const e = new EventEmitter();
    let n = 0;
    const l = () => n++;
    e.on("x", l);
    e.on("x", l);
    e.off("x", l);
    e.emit("x");
    assert.equal(n, 1, "off debe quitar solo una de las dos registraciones");
    const quitar = e.on("y", () => n++);
    quitar();
    quitar(); // idempotente
    e.emit("y");
    assert.equal(n, 1);
    e.off("no-existe", l); // no lanza
  },
  emitter_once() {
    const e = new EventEmitter();
    const v = [];
    e.once("x", (a) => v.push(a));
    e.emit("x", 1);
    e.emit("x", 2);
    assert.deepEqual(v, [1]);
    assert.equal(e.listenerCount("x"), 0);
    const quitar = e.once("y", () => v.push("y"));
    quitar();
    e.emit("y");
    assert.deepEqual(v, [1], "el once desregistrado no debe ejecutarse");
  },
  emitter_modificar_durante_emit() {
    const e = new EventEmitter();
    const v = [];
    let quitarB;
    e.on("x", () => {
      v.push("a");
      quitarB();
      e.on("x", () => v.push("nuevo"));
    });
    quitarB = e.on("x", () => v.push("b"));
    e.emit("x");
    assert.deepEqual(v, ["a", "b"], "el emit en curso debe usar la lista del momento en que empezó");
    v.length = 0;
    e.emit("x");
    assert.deepEqual(v, ["a", "nuevo"]);
  },
  emitter_errores() {
    const e = new EventEmitter();
    const v = [];
    e.on("x", () => { throw new Error("primero"); });
    e.on("x", () => { throw new Error("segundo"); });
    e.on("x", () => v.push("se ejecutó igual"));
    assert.throws(() => e.emit("x"), { message: "primero" });
    assert.deepEqual(v, ["se ejecutó igual"]);
    assert.throws(() => new EventEmitter().emit("error", new Error("sin listeners")), { message: "sin listeners" });
  },
  store_dispatch_y_subscribe() {
    const s = crearStore(carritoReducer, INICIAL);
    let notificaciones = 0;
    const desuscribir = s.subscribe(() => notificaciones++);
    const accion = { type: "agregar", item: "pan" };
    assert.equal(s.dispatch(accion), accion);
    assert.deepEqual(s.getState().items, ["pan"]);
    s.dispatch({ type: "desconocida" });
    assert.equal(notificaciones, 1, "no debe notificar si el estado no cambió");
    desuscribir();
    s.dispatch({ type: "agregar", item: "leche" });
    assert.equal(notificaciones, 1);
    assert.throws(() => s.dispatch({ tipo: "x" }), TypeError);
    assert.throws(() => s.dispatch("agregar"), TypeError);
  },
  store_select() {
    const s = crearStore(carritoReducer, INICIAL);
    const usuarios = [];
    s.select((st) => st.usuario, (u) => usuarios.push(u));
    s.dispatch({ type: "agregar", item: "pan" }); // cambia items, no usuario
    s.dispatch({ type: "usuario", nombre: "Ana" });
    s.dispatch({ type: "usuario", nombre: "Ana" }); // mismo valor
    s.dispatch({ type: "usuario", nombre: "Luis" });
    assert.deepEqual(usuarios, ["Ana", "Luis"]);
  },
  store_estado_congelado() {
    const s = crearStore(carritoReducer, { items: [{ sku: "A" }], usuario: null });
    const st = s.getState();
    assert.throws(() => { st.items.push("x"); }, TypeError, "el array del estado debe estar congelado");
    assert.throws(() => { st.items[0].sku = "B"; }, TypeError, "congelado en profundidad");
  },
  store_dispatch_en_reducer() {
    let store;
    store = crearStore((estado, accion) => {
      if (accion.type === "malo") store.dispatch({ type: "otro" });
      return estado;
    }, {});
    assert.throws(() => store.dispatch({ type: "malo" }), /dispatch dentro de un reducer/);
    store.dispatch({ type: "ok" }); // el store sigue funcionando después
  },
});
