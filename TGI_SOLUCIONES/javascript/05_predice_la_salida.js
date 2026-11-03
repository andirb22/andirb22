/**
 * EJERCICIO 05 — Predice la salida (sin ejecutar el código)
 * Tema: `this`, call/bind, closures, var/let, hoisting, referencias, coerción
 * Basado en: preguntas reportadas en EPAM: "predice a y b tras reasignar", "valores de
 * arr y arr2 tras push", "obj.name, obj.foo() y bar()", "person1.fullName.call(person2)"
 * Tiempo sugerido: 15 min
 *
 * ENUNCIADO
 * ---------
 * Cada fragmento deja un valor en la variable `resultado`. Escribe en RESPUESTAS el valor
 * que crees que tendrá, SIN ejecutarlo. Las pruebas comparan con deepStrictEqual,
 * así que el tipo importa ("1" no es 1).
 *
 * Para cada fallo, antes de mirar la respuesta, intenta explicar POR QUÉ, como en la entrevista.
 *
 * Ejecutar pruebas:  node TGI_SOLUCIONES/javascript/05_predice_la_salida.js
 */
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { ejecutar, pendiente } = require("./_pruebas");

const FRAGMENTOS = {
  // 1) Primitivos y objetos
  1: `
    let a = 5; let b = a; a = 7;
    const arr = [1, 2]; const arr2 = arr; arr2.push(3);
    resultado = [b, arr.length];
  `,
  // 2) this perdido (el fragmento corre en modo estricto)
  2: `
    "use strict";
    const obj = { name: "obj", foo() { return this === undefined ? "undefined" : this.name; } };
    const bar = obj.foo;
    resultado = [obj.foo(), bar()];
  `,
  // 3) call y bind
  3: `
    const p1 = { nombre: "John", completo() { return this.nombre + " Doe"; } };
    const p2 = { nombre: "Mary" };
    const ligada = p1.completo.bind(p2);
    resultado = [p1.completo.call(p2), ligada.call(p1)];
  `,
  // 4) Arrow functions y this
  4: `
    const contador = {
      n: 10,
      normal() { return [1, 2].map(function () { return this === undefined; }); },
      flecha() { return [1, 2].map(() => this.n); },
    };
    resultado = [contador.normal()[0], contador.flecha()];
  `,
  // 5) var vs let en un bucle con callbacks
  5: `
    const fs1 = []; const fs2 = [];
    for (var i = 0; i < 3; i++) fs1.push(() => i);
    for (let j = 0; j < 3; j++) fs2.push(() => j);
    resultado = [fs1.map(f => f()), fs2.map(f => f())];
  `,
  // 6) Hoisting
  6: `
    function f() {
      const salida = [typeof g, typeof h, typeof x];
      var x = 1;
      function g() {}
      var h = function () {};
      return salida;
    }
    resultado = f();
  `,
  // 7) Copia superficial
  7: `
    const original = { a: 1, interno: { b: 1 } };
    const copia = { ...original };
    copia.a = 2;
    copia.interno.b = 2;
    resultado = [original.a, original.interno.b];
  `,
  // 8) Coerción y comparaciones
  8: `
    resultado = [1 == "1", 1 === "1", null == undefined, NaN === NaN, [] == false, typeof null];
  `,
  // 9) Closures con estado
  9: `
    function crearContador() { let c = 0; return { inc: () => ++c, valor: () => c }; }
    const x = crearContador(); const y = crearContador();
    x.inc(); x.inc(); y.inc();
    resultado = [x.valor(), y.valor()];
  `,
  // 10) Orden de keys y números
  10: `
    const o = { b: 1, 2: "dos", a: 2, 1: "uno" };
    resultado = [Object.keys(o).join(","), 0.1 + 0.2 === 0.3, [10, 9, 1].sort().join(",")];
  `,
};

// ---------------------------------------------------------------------------
// TUS RESPUESTAS: reemplaza cada `undefined` por el valor que esperas en `resultado`
// ---------------------------------------------------------------------------
const RESPUESTAS = {
  1: undefined,
  2: undefined,
  3: undefined,
  4: undefined,
  5: undefined,
  6: undefined,
  7: undefined,
  8: undefined,
  9: undefined,
  10: undefined,
};

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
function probar(n) {
  if (RESPUESTAS[n] === undefined) pendiente();
  const contexto = vm.createContext({ resultado: undefined });
  vm.runInContext(FRAGMENTOS[n], contexto);
  // copia el resultado al realm actual para que deepStrictEqual compare bien los arrays
  const real = JSON.parse(JSON.stringify(contexto.resultado));
  assert.deepEqual(RESPUESTAS[n], real, `respondiste ${JSON.stringify(RESPUESTAS[n])}, el resultado real es ${JSON.stringify(real)}`);
}

const pruebas = {};
for (const n of Object.keys(FRAGMENTOS)) pruebas[`fragmento_${n.padStart(2, "0")}`] = () => probar(n);
ejecutar(pruebas);
