/**
 * Debounce y throttle (muy frecuentes en live coding de frontend; en Angular se usan
 * los operadores RxJS debounceTime/throttleTime, ver typescript/05_busqueda_rxjs.ts).
 *
 * - debounce: ejecuta cuando dejan de llamar durante `ms` (búsqueda mientras escribes).
 * - throttle: ejecuta como máximo una vez cada `ms` (scroll, resize).
 * Ejecutar: node 09_debounce_throttle.js
 */
const assert = require("node:assert/strict");

function debounce(fn, ms) {
  let id;
  function debounced(...args) {
    clearTimeout(id);
    id = setTimeout(() => fn.apply(this, args), ms); // conserva this y los últimos args
  }
  debounced.cancel = () => clearTimeout(id);
  return debounced;
}

function throttle(fn, ms) {
  let ultimo = 0;
  let pendiente = null;
  let ultimosArgs;
  return function throttled(...args) {
    const ahora = Date.now();
    ultimosArgs = args;
    const restante = ms - (ahora - ultimo);
    if (restante <= 0) {
      ultimo = ahora;
      fn.apply(this, args); // primera llamada inmediata (leading)
    } else if (!pendiente) {
      pendiente = setTimeout(() => {
        ultimo = Date.now();
        pendiente = null;
        fn.apply(this, ultimosArgs); // y una al final con los últimos args (trailing)
      }, restante);
    }
  };
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const d = [];
  const buscar = debounce((q) => d.push(q), 40);
  buscar("a");
  buscar("an");
  buscar("ana");
  await esperar(80);
  assert.deepEqual(d, ["ana"]); // solo la última

  const t = [];
  const onScroll = throttle((i) => t.push(i), 50);
  for (let i = 0; i < 10; i++) {
    onScroll(i);
    await esperar(10); // 10 llamadas en ~100 ms
  }
  await esperar(80);
  assert.equal(t[0], 0); // leading
  assert.equal(t.at(-1), 9); // trailing con los últimos argumentos
  assert.ok(t.length >= 2 && t.length <= 4, `ejecuciones: ${t}`);
  console.log("OK - debounce y throttle");
})();
