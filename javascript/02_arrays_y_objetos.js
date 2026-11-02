/**
 * EJERCICIO 02 — Arrays y objetos sin librerías
 * Tema: Set/Map, reduce, recursión, referencias vs copias
 * Basado en: "escribe una función que elimine los números repetidos de un arreglo" y
 * preguntas de primitivos vs referencias (reportados en EPAM, Full Stack JS)
 * Tiempo sugerido: 30 min
 *
 * ENUNCIADO — implementa sin lodash ni librerías externas:
 *
 * A) unicos(arr)
 *    Una copia de cada valor, conservando el orden de la primera aparición.
 *    unicos([3, 1, 3, 2, 1]) -> [3, 1, 2]       Debe tratar NaN como igual a NaN.
 *
 * B) unicosPor(arr, claveFn)
 *    Como unicos, pero compara por el resultado de claveFn. Conserva el PRIMERO.
 *    unicosPor([{id:1,n:"a"},{id:1,n:"b"}], u => u.id) -> [{id:1,n:"a"}]
 *
 * C) soloNoRepetidos(arr)
 *    Solo los valores que aparecen exactamente una vez.   [1, 2, 2, 3] -> [1, 3]
 *
 * D) agruparPor(arr, claveFn)
 *    Objeto { clave: [elementos] }, conservando el orden dentro de cada grupo.
 *    agruparPor([1.2, 1.8, 2.1], Math.floor) -> { 1: [1.2, 1.8], 2: [2.1] }
 *
 * E) aplanar(arr, profundidad = Infinity)
 *    Como Array.prototype.flat, pero SIN usar .flat() ni .flatMap().
 *    aplanar([1, [2, [3, [4]]]], 1) -> [1, 2, [3, [4]]]
 *
 * F) clonarProfundo(valor)
 *    Copia profunda SIN structuredClone ni JSON.parse(JSON.stringify()). Debe soportar:
 *    objetos planos, arrays, Date, Map, Set, y REFERENCIAS CIRCULARES
 *    (obj.yo = obj debe seguir apuntando a la copia, no al original).
 *    Los primitivos y las funciones se devuelven tal cual.
 *
 * PARA PENSAR
 * -----------
 * - ¿Por qué { ...obj } no basta para copiar un objeto anidado?
 * - ¿Qué pierde JSON.parse(JSON.stringify(x))? (Date, undefined, Map, ciclos...)
 * - ¿Complejidad de unicos con filter + indexOf vs con Set?
 *
 * Ejecutar pruebas:  node javascript/02_arrays_y_objetos.js
 */
const assert = require("node:assert/strict");
const { ejecutar, pendiente } = require("./_pruebas");

// ==== TU SOLUCIÓN (inicio) ====
function unicos(arr) {
  pendiente();
}

function unicosPor(arr, claveFn) {
  pendiente();
}

function soloNoRepetidos(arr) {
  pendiente();
}

function agruparPor(arr, claveFn) {
  pendiente();
}

function aplanar(arr, profundidad = Infinity) {
  pendiente();
}

function clonarProfundo(valor) {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
ejecutar({
  a_unicos() {
    assert.deepEqual(unicos([3, 1, 3, 2, 1]), [3, 1, 2]);
    assert.deepEqual(unicos([NaN, NaN, "1", 1]), [NaN, "1", 1]);
    assert.deepEqual(unicos([]), []);
    const original = [1, 1];
    unicos(original);
    assert.deepEqual(original, [1, 1], "no modifiques la entrada");
  },
  b_unicos_por() {
    const users = [{ id: 1, n: "a" }, { id: 2, n: "b" }, { id: 1, n: "c" }];
    assert.deepEqual(unicosPor(users, (u) => u.id).map((u) => u.n), ["a", "b"]);
    assert.deepEqual(unicosPor(["Ana", "ana", "LUIS"], (s) => s.toLowerCase()), ["Ana", "LUIS"]);
  },
  c_solo_no_repetidos() {
    assert.deepEqual(soloNoRepetidos([1, 2, 2, 3, 4, 4, 4]), [1, 3]);
    assert.deepEqual(soloNoRepetidos([5, 5]), []);
  },
  d_agrupar_por() {
    assert.deepEqual(agruparPor([1.2, 1.8, 2.1], Math.floor), { 1: [1.2, 1.8], 2: [2.1] });
    const ventas = [{ r: "norte", m: 1 }, { r: "sur", m: 2 }, { r: "norte", m: 3 }];
    assert.deepEqual(agruparPor(ventas, (v) => v.r), { norte: [ventas[0], ventas[2]], sur: [ventas[1]] });
    assert.deepEqual(agruparPor([], (x) => x), {});
  },
  e_aplanar() {
    const fuente = aplanar.toString();
    assert.ok(!/\.flat(Map)?\(/.test(fuente), "no se permite usar .flat() ni .flatMap()");
    assert.deepEqual(aplanar([1, [2, [3, [4]]]]), [1, 2, 3, 4]);
    assert.deepEqual(aplanar([1, [2, [3, [4]]]], 1), [1, 2, [3, [4]]]);
    assert.deepEqual(aplanar([1, [2, [3, [4]]]], 2), [1, 2, 3, [4]]);
    assert.deepEqual(aplanar([[], [[]], 5], Infinity), [5]);
    assert.deepEqual(aplanar([1, [2]], 0), [1, [2]]);
  },
  f_clonar_profundo_basico() {
    const fuente = clonarProfundo.toString();
    assert.ok(!/structuredClone|JSON\.parse/.test(fuente), "no se permite structuredClone ni JSON");
    const original = { a: 1, b: { c: [1, { d: 2 }] }, f: new Date(0), fn: Math.max, nada: undefined };
    const copia = clonarProfundo(original);
    assert.deepEqual(copia, original);
    assert.notEqual(copia.b, original.b);
    assert.notEqual(copia.b.c[1], original.b.c[1]);
    assert.ok(copia.f instanceof Date && copia.f !== original.f && copia.f.getTime() === 0);
    assert.equal(copia.fn, Math.max);
    assert.ok("nada" in copia);
    assert.equal(clonarProfundo(5), 5);
    assert.equal(clonarProfundo(null), null);
  },
  f_clonar_map_set_y_ciclos() {
    const o = { m: new Map([["k", { v: 1 }]]), s: new Set([1, 2]) };
    o.yo = o;
    o.lista = [o];
    const c = clonarProfundo(o);
    assert.ok(c.m instanceof Map && c.s instanceof Set);
    assert.notEqual(c.m.get("k"), o.m.get("k"));
    assert.equal(c.m.get("k").v, 1);
    assert.deepEqual([...c.s], [1, 2]);
    assert.equal(c.yo, c, "la referencia circular debe apuntar a la copia");
    assert.equal(c.lista[0], c);
  },
});
