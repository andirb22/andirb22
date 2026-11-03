/**
 * EJERCICIO 01 — Currying y composición de funciones
 * Tema: closures, funciones de orden superior, aridad (fn.length), `this`
 * Basado en: "escribe add(x)(y) para que add(3)(4) devuelva 7" (live coding reportado
 * en EPAM, Full Stack JS)
 * Tiempo sugerido: 20 min
 *
 * ENUNCIADO
 * ---------
 * A) curry(fn)
 *    Convierte fn(a, b, c) en una función que acepta los argumentos de a uno o en grupos:
 *      const sumar3 = curry((a, b, c) => a + b + c);
 *      sumar3(1)(2)(3) === sumar3(1, 2)(3) === sumar3(1)(2, 3) === sumar3(1, 2, 3) === 6
 *    Requisitos:
 *    1. Se ejecuta fn en cuanto se juntan al menos fn.length argumentos.
 *    2. Cada llamada parcial devuelve una función NUEVA e independiente: reutilizar
 *       un parcial no debe "contaminar" a otro (const suma1 = sumar3(1); suma1(2)(3) y
 *       suma1(10)(20) deben dar 6 y 31).
 *    3. Respeta `this`: si la función curried se usa como método, fn recibe ese this,
 *       también cuando se completa en llamadas posteriores: obj.sumar(1)(2).
 *    4. Si fn.length es 0, curry(fn)() ejecuta fn de inmediato.
 *
 * B) sumaInfinita(a)
 *    sumaInfinita(1)(2)(3)() === 6, sumaInfinita(5)() === 5
 *    La llamada SIN argumentos termina la cadena y devuelve el total.
 *    Además, la cadena se puede convertir en número sin cerrarla:
 *      +sumaInfinita(1)(2) === 3      `${sumaInfinita(4)(4)}` === "8"
 *    (pista: valueOf / toString / Symbol.toPrimitive)
 *
 * C) pipe(...fns) y compose(...fns)
 *    pipe(f, g, h)(x)    === h(g(f(x)))   (de izquierda a derecha)
 *    compose(f, g, h)(x) === f(g(h(x)))   (de derecha a izquierda)
 *    Sin funciones, devuelven la función identidad. La primera función que se ejecuta
 *    puede recibir varios argumentos: pipe(Math.max, x => x * 2)(1, 5, 3) === 10
 *
 * PARA PENSAR
 * -----------
 * - ¿Qué es una closure y en qué parte de tu código aparece?
 * - ¿Por qué fn.length no sirve con parámetros por defecto o rest (...args)?
 * - ¿Dónde has visto currying en código real? (pista: middlewares, selectores de NgRx,
 *   operadores de RxJS)
 *
 * Ejecutar pruebas:  node TGI_SOLUCIONES/javascript/01_curry_y_composicion.js
 */
const assert = require("node:assert/strict");
const { ejecutar, pendiente } = require("./_pruebas");

// ==== TU SOLUCIÓN (inicio) ====
function curry(fn) {
  pendiente();
}

function sumaInfinita(a) {
  pendiente();
}

function pipe(...fns) {
  pendiente();
}

function compose(...fns) {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
ejecutar({
  curry_todas_las_formas() {
    const sumar3 = curry((a, b, c) => a + b + c);
    assert.equal(sumar3(1)(2)(3), 6);
    assert.equal(sumar3(1, 2)(3), 6);
    assert.equal(sumar3(1)(2, 3), 6);
    assert.equal(sumar3(1, 2, 3), 6);
  },
  curry_parciales_independientes() {
    const sumar3 = curry((a, b, c) => a + b + c);
    const suma1 = sumar3(1);
    const suma1y2 = suma1(2);
    assert.equal(suma1(10)(20), 31);
    assert.equal(suma1y2(3), 6, "un parcial quedó contaminado por otra llamada");
    assert.equal(suma1(2)(3), 6);
  },
  curry_respeta_this() {
    const obj = {
      base: 100,
      sumar: curry(function (a, b) {
        return this.base + a + b;
      }),
    };
    assert.equal(obj.sumar(1, 2), 103);
    assert.equal(obj.sumar(1)(2), 103, "el parcial debe conservar el this de la primera llamada");
  },
  curry_aridad_cero() {
    let llamadas = 0;
    const f = curry(() => ++llamadas);
    assert.equal(f(), 1);
  },
  suma_infinita() {
    assert.equal(sumaInfinita(1)(2)(3)(), 6);
    assert.equal(sumaInfinita(5)(), 5);
    assert.equal(sumaInfinita(-1)(1)(0)(), 0);
  },
  suma_infinita_conversion() {
    assert.equal(+sumaInfinita(1)(2), 3);
    assert.equal(`${sumaInfinita(4)(4)}`, "8");
    const parcial = sumaInfinita(10);
    assert.equal(parcial(1)(), 11);
    assert.equal(parcial(2)(), 12, "los parciales no deben compartir estado");
  },
  pipe_y_compose() {
    const doble = (x) => x * 2;
    const masUno = (x) => x + 1;
    assert.equal(pipe(doble, masUno)(5), 11);
    assert.equal(compose(doble, masUno)(5), 12);
    assert.equal(pipe()(7), 7);
    assert.equal(compose()(7), 7);
    assert.equal(pipe(Math.max, doble)(1, 5, 3), 10);
    assert.equal(compose(doble, Math.max)(1, 5, 3), 10);
  },
});
