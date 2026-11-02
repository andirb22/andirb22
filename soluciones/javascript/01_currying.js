/**
 * Currying (reportado en EPAM: "escribe add(x)(y) para que add(3)(4) devuelva 7").
 *
 * Currying = transformar f(a, b, c) en f(a)(b)(c). Funciona gracias a las CLOSURES:
 * la función interna "recuerda" las variables de la externa aunque ya haya retornado.
 * Ejecutar: node 01_currying.js
 */
const assert = require("node:assert/strict");

// 1) Lo que piden literalmente
const add = (x) => (y) => x + y;

// 2) Curry genérico: acumula argumentos hasta completar la aridad (fn.length)
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

// 3) Variante "infinita": sum(1)(2)(3)() -> 6 (la llamada vacía cierra la cadena)
function sum(a) {
  return function next(b) {
    return b === undefined ? a : sum(a + b);
  };
}

// 4) Variante con valueOf: +sum2(1)(2)(3) -> 6 (coerción a primitivo)
function sum2(a) {
  const next = (b) => sum2(a + b);
  next.valueOf = () => a;
  return next;
}

// Uso práctico: aplicación parcial para crear funciones especializadas
const multiplicar = curry((a, b, c) => a * b * c);
const doble = multiplicar(2)(1);

assert.equal(add(3)(4), 7);
const add3 = add(3);
assert.equal(add3(10), 13); // add3 "recuerda" x = 3 (closure)
assert.equal(multiplicar(2)(3)(4), 24);
assert.equal(multiplicar(2, 3)(4), 24);
assert.equal(multiplicar(2, 3, 4), 24);
assert.equal(doble(21), 42);
assert.equal(sum(1)(2)(3)(), 6);
assert.equal(+sum2(1)(2)(3), 6);
console.log("OK - currying");
