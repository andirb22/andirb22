/**
 * EJERCICIO 07 — Event loop: ¿en qué orden se ejecuta?
 * Tema: pila de llamadas, microtareas (promesas, await, queueMicrotask) y macrotareas
 * (setTimeout)
 * Basado en: preguntas de promesas y async/await reportadas en EPAM; es la base para
 * entender change detection y Zone.js en Angular
 * Tiempo sugerido: 15 min
 *
 * ENUNCIADO
 * ---------
 * Cada fragmento llama a log("...") varias veces. Escribe en RESPUESTAS el ORDEN en que
 * crees que aparecerán los mensajes (un array de strings). Sin ejecutarlo.
 *
 * Regla para repasar antes de empezar:
 *   1) todo el código síncrono  2) TODAS las microtareas  3) UNA macrotarea  4) volver a 2
 *
 * Ejecutar pruebas:  node javascript/07_event_loop.js
 */
const assert = require("node:assert/strict");
const { ejecutar, pendiente } = require("./_pruebas");

const FRAGMENTOS = {
  // A) Lo básico
  A: `
    log("1");
    setTimeout(() => log("2"), 0);
    Promise.resolve().then(() => log("3"));
    log("4");
  `,
  // B) async / await
  B: `
    async function f() {
      log("f1");
      await null;
      log("f2");
    }
    log("inicio");
    f();
    new Promise((res) => { log("executor"); res(); }).then(() => log("then"));
    log("fin");
  `,
  // C) Microtareas dentro de macrotareas y viceversa
  C: `
    setTimeout(() => {
      log("t1");
      Promise.resolve().then(() => log("p-dentro-de-t1"));
    }, 0);
    setTimeout(() => log("t2"), 0);
    Promise.resolve().then(() => {
      log("p1");
      setTimeout(() => log("t-dentro-de-p1"), 0);
    });
    queueMicrotask(() => log("micro"));
    log("sync");
  `,
  // D) Cadena de then vs await anidados
  D: `
    Promise.resolve()
      .then(() => log("a1"))
      .then(() => log("a2"))
      .then(() => log("a3"));
    Promise.resolve()
      .then(() => log("b1"))
      .then(() => log("b2"));
    (async () => {
      log("c0");
      await undefined;
      log("c1");
      await undefined;
      log("c2");
    })();
  `,
  // E) Errores en promesas
  E: `
    Promise.reject(new Error("x"))
      .then(() => log("no-deberia"))
      .catch(() => { log("catch"); return "recuperado"; })
      .then((v) => log(v))
      .finally(() => log("finally"));
    log("sync");
  `,
};

// ---------------------------------------------------------------------------
// TUS RESPUESTAS: reemplaza cada `undefined` por el array con el orden de los logs
// ---------------------------------------------------------------------------
const RESPUESTAS = {
  A: undefined,
  B: undefined,
  C: undefined,
  D: undefined,
  E: undefined,
};

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
async function probar(id) {
  if (RESPUESTAS[id] === undefined) pendiente();
  const salida = [];
  new Function("log", FRAGMENTOS[id])((m) => salida.push(m));
  await new Promise((r) => setTimeout(r, 30));
  assert.deepEqual(RESPUESTAS[id], salida, `respondiste ${JSON.stringify(RESPUESTAS[id])}\n     orden real:  ${JSON.stringify(salida)}`);
}

const pruebas = {};
for (const id of Object.keys(FRAGMENTOS)) pruebas[`fragmento_${id}`] = () => probar(id);
ejecutar(pruebas);
