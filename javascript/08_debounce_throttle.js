/**
 * EJERCICIO 08 — Debounce y throttle
 * Tema: closures con estado, timers, `this` y argumentos, opciones leading/trailing
 * Basado en: ejercicio clásico de frontend; conecta con la pregunta de la guía EPAM sobre
 * rendimiento (INP) y con debounceTime/throttleTime de RxJS en Angular
 * Tiempo sugerido: 30 min
 *
 * CONTEXTO
 * --------
 * Un buscador dispara una petición HTTP en cada tecla (10 peticiones para "plataforma")
 * y un listener de scroll recalcula el layout 100 veces por segundo. Hay que controlarlo.
 *
 * ENUNCIADO
 * ---------
 * A) debounce(fn, ms, { leading = false, trailing = true } = {})
 *    Devuelve una función `d`:
 *    1. trailing: fn se ejecuta UNA vez, `ms` después de la ÚLTIMA llamada a d, con los
 *       argumentos y el `this` de esa última llamada.
 *    2. leading: fn se ejecuta inmediatamente en la PRIMERA llamada de una ráfaga; las
 *       siguientes llamadas de la ráfaga (separadas menos de `ms`) no la ejecutan.
 *       Con leading y trailing a la vez, en una ráfaga de UNA sola llamada fn se ejecuta
 *       solo una vez (no dos).
 *    3. d.cancel(): descarta la ejecución pendiente.
 *    4. d.flush(): si hay una ejecución pendiente, la hace YA y devuelve su resultado.
 *
 * B) throttle(fn, ms)
 *    Devuelve una función `t` que ejecuta fn como máximo una vez cada `ms`:
 *    1. La primera llamada se ejecuta de inmediato.
 *    2. Si llegan llamadas durante la espera, al terminar la espera se ejecuta UNA vez
 *       más con los argumentos de la ÚLTIMA (para no perder el último valor).
 *    3. t.cancel(): descarta la ejecución pendiente.
 *
 * PARA PENSAR
 * -----------
 * - ¿Cuál usarías para: autocompletar, guardar un borrador, scroll infinito, el botón de
 *   pagar (doble clic)?
 * - En RxJS, ¿qué operador evita el doble envío de un formulario? (exhaustMap)
 * - ¿Por qué hay que preservar `this` y los argumentos?
 *
 * Ejecutar pruebas:  node javascript/08_debounce_throttle.js
 */
const assert = require("node:assert/strict");
const { ejecutar, pendiente } = require("./_pruebas");

// ==== TU SOLUCIÓN (inicio) ====
function debounce(fn, ms, { leading = false, trailing = true } = {}) {
  pendiente();
}

function throttle(fn, ms) {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

ejecutar({
  async debounce_trailing() {
    const llamadas = [];
    const buscar = debounce((q) => llamadas.push(q), 40);
    buscar("p");
    buscar("pl");
    await espera(20);
    buscar("pla");
    await espera(20);
    assert.deepEqual(llamadas, [], "se ejecutó antes de que pasaran 40 ms desde la última llamada");
    await espera(40);
    assert.deepEqual(llamadas, ["pla"]);
  },
  async debounce_conserva_this() {
    const obj = {
      prefijo: ">",
      salida: [],
      escribir: debounce(function (x) { this.salida.push(this.prefijo + x); }, 10),
    };
    obj.escribir("a");
    await espera(30);
    assert.deepEqual(obj.salida, [">a"]);
  },
  async debounce_leading() {
    const llamadas = [];
    const d = debounce((x) => llamadas.push(x), 40, { leading: true, trailing: false });
    d(1);
    d(2);
    d(3);
    assert.deepEqual(llamadas, [1], "con leading la primera debe ejecutarse de inmediato");
    await espera(70);
    assert.deepEqual(llamadas, [1], "con trailing: false no debe ejecutarse al final");
    d(4); // nueva ráfaga
    assert.deepEqual(llamadas, [1, 4]);
  },
  async debounce_leading_y_trailing() {
    const llamadas = [];
    const d = debounce((x) => llamadas.push(x), 30, { leading: true, trailing: true });
    d("solo");
    await espera(50);
    assert.deepEqual(llamadas, ["solo"], "una ráfaga de una sola llamada no debe ejecutarse dos veces");
    d("a");
    d("b");
    await espera(50);
    assert.deepEqual(llamadas, ["solo", "a", "b"]);
  },
  async debounce_cancel_y_flush() {
    const llamadas = [];
    const d = debounce((x) => (llamadas.push(x), x * 10), 30);
    d(1);
    d.cancel();
    await espera(50);
    assert.deepEqual(llamadas, []);
    d(2);
    assert.equal(d.flush(), 20);
    assert.deepEqual(llamadas, [2]);
    await espera(50);
    assert.deepEqual(llamadas, [2], "después de flush no debe volver a ejecutarse");
  },
  async throttle_basico() {
    const llamadas = [];
    const t = throttle((x) => llamadas.push(x), 50);
    t(1);
    t(2);
    t(3);
    assert.deepEqual(llamadas, [1]);
    await espera(70);
    assert.deepEqual(llamadas, [1, 3], "al terminar la espera debe ejecutarse con el último valor");
  },
  async throttle_frecuencia() {
    const tiempos = [];
    const t = throttle(() => tiempos.push(Date.now()), 40);
    const fin = Date.now() + 200;
    while (Date.now() < fin) {
      t();
      await espera(5);
    }
    await espera(60);
    assert.ok(tiempos.length >= 4 && tiempos.length <= 7, `${tiempos.length} ejecuciones en 200 ms (esperado ~5)`);
    for (let i = 1; i < tiempos.length; i++) {
      assert.ok(tiempos[i] - tiempos[i - 1] >= 35, "dos ejecuciones con menos de 40 ms entre ellas");
    }
  },
  async throttle_cancel() {
    const llamadas = [];
    const t = throttle((x) => llamadas.push(x), 30);
    t(1);
    t(2);
    t.cancel();
    await espera(50);
    assert.deepEqual(llamadas, [1]);
  },
});
