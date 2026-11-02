/**
 * "Predice la salida" (reportado en EPAM): primitivos vs referencias, `this`,
 * call/apply/bind. Intenta responder cada caso ANTES de leer el assert.
 *
 * Reglas de `this` (de mayor a menor prioridad):
 * 1. new        -> el objeto recién creado
 * 2. call/apply/bind -> el objeto que se pasa
 * 3. obj.metodo()    -> obj (lo que está a la izquierda del punto al LLAMAR)
 * 4. llamada suelta  -> undefined en strict mode (globalThis en modo no estricto)
 * Las arrow functions no tienen this propio: usan el del ámbito donde se DEFINEN.
 * Ejecutar: node 05_this_call_referencias.js
 */
"use strict";
const assert = require("node:assert/strict");

// 1) Primitivos se copian por valor
var a = 5;
var b = a;
a = 7;
assert.equal(b, 5);
assert.equal(a, 7);

// 2) Objetos/arrays se copian por REFERENCIA
const arr = [1, 2];
const arr2 = arr;
arr2.push(3);
assert.deepEqual(arr, [1, 2, 3]); // ambas variables apuntan al mismo arreglo
const copia = [...arr]; // copia superficial
copia.push(4);
assert.equal(arr.length, 3);
const anidado = { x: { y: 1 } };
const superficial = { ...anidado };
superficial.x.y = 2;
assert.equal(anidado.x.y, 2); // el objeto interno es compartido
const profunda = structuredClone(anidado);
profunda.x.y = 99;
assert.equal(anidado.x.y, 2);

// 3) Pasar a una función: se copia la referencia, no el objeto
function mutar(o) { o.n = 1; }
function reasignar(o) { o = { n: 2 }; }
const obj0 = {};
mutar(obj0);
reasignar(obj0);
assert.equal(obj0.n, 1);

// 4) this según cómo se LLAMA la función
const obj = {
  name: "obj",
  foo() { return this?.name; },
  flecha: () => typeof this, // this del módulo (CommonJS: module.exports = {})
  conTimer() {
    const self = this;
    return [function () { return this; }.call(undefined), (() => this.name)(), self.name];
  },
};
assert.equal(obj.foo(), "obj");
const bar = obj.foo;
assert.equal(bar(), undefined); // perdió el contexto: llamada suelta en strict mode
assert.equal(obj.flecha(), "object");
assert.deepEqual(obj.conTimer(), [undefined, "obj", "obj"]);

// 5) call / apply / bind
const person1 = {
  firstName: "John",
  lastName: "Doe",
  fullName(sep = " ") { return this.firstName + sep + this.lastName; },
};
const person2 = { firstName: "Mary", lastName: "Doe" };
assert.equal(person1.fullName.call(person2), "Mary Doe"); // call: args separados
assert.equal(person1.fullName.apply(person2, ["-"]), "Mary-Doe"); // apply: args en array
const ligada = person1.fullName.bind(person2);
assert.equal(ligada(), "Mary Doe");
assert.equal(ligada.call(person1), "Mary Doe"); // bind no se puede "re-ligar"

// 6) Préstamo de métodos con call (caso de uso real)
function sumarArgs() { return Array.prototype.reduce.call(arguments, (s, x) => s + x, 0); }
assert.equal(sumarArgs(1, 2, 3), 6);

// 7) this en clases y callbacks
class Contador {
  n = 0;
  incMetodo() { this.n++; }
  incFlecha = () => { this.n++; }; // queda ligado a la instancia
}
const c = new Contador();
const { incMetodo, incFlecha } = c;
assert.throws(() => incMetodo(), TypeError); // this es undefined
incFlecha();
assert.equal(c.n, 1);

// 8) var vs let en bucles con closures (otro clásico)
const conVar = [];
for (var i = 0; i < 3; i++) conVar.push(() => i);
const conLet = [];
for (let j = 0; j < 3; j++) conLet.push(() => j);
assert.deepEqual(conVar.map((f) => f()), [3, 3, 3]); // una sola i compartida
assert.deepEqual(conLet.map((f) => f()), [0, 1, 2]); // una j por iteración

// 9) Hoisting y TDZ
assert.equal(typeof hoisted, "function");
function hoisted() {}
assert.throws(() => tdz, ReferenceError);
let tdz = 1;

console.log("OK - this, call y referencias");
