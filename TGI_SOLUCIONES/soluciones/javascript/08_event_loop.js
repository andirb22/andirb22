/**
 * Event loop: "¿en qué orden se imprime?" (muy común en entrevistas de JS; ligado a las
 * preguntas de promesas y async/await reportadas en EPAM).
 *
 * Orden de ejecución:
 * 1. Todo el código síncrono (la pila de llamadas).
 * 2. TODAS las microtareas: callbacks de promesas, await, queueMicrotask
 *    (en Node, process.nextTick va incluso antes).
 * 3. Una macrotarea (setTimeout, setInterval, I/O), y de nuevo todas las microtareas.
 * Un `await` parte la función: lo que sigue se ejecuta como microtarea.
 * Ejecutar: node 08_event_loop.js
 */
const assert = require("node:assert/strict");

const log = [];

setTimeout(() => log.push("timeout 1"), 0);

Promise.resolve()
  .then(() => log.push("promesa 1"))
  .then(() => log.push("promesa 2"));

async function f() {
  log.push("f inicio"); // síncrono hasta el primer await
  await null;
  log.push("f después del await"); // microtarea
}
f();

queueMicrotask(() => log.push("microtarea"));
process.nextTick(() => log.push("nextTick"));

setTimeout(() => {
  log.push("timeout 2");
  Promise.resolve().then(() => log.push("promesa dentro de timeout 2"));
}, 0);

setTimeout(() => log.push("timeout 3"), 0);

new Promise((resolve) => {
  log.push("executor (síncrono)"); // el executor corre inmediatamente
  resolve();
});

log.push("fin del script");

setTimeout(() => {
  assert.deepEqual(log, [
    "f inicio",
    "executor (síncrono)",
    "fin del script",
    "nextTick",
    "promesa 1",
    "f después del await",
    "microtarea",
    "promesa 2",
    "timeout 1",
    "timeout 2",
    "promesa dentro de timeout 2", // las microtareas se vacían entre macrotareas
    "timeout 3",
  ]);
  console.log("OK - event loop");
}, 20);
