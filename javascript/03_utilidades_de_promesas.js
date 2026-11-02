/**
 * EJERCICIO 03 — Utilidades de promesas
 * Tema: Promise, combinadores, timeouts, reintentos, concurrencia limitada
 * Basado en: "explica las promesas e implementa una" (reportado en EPAM, Full Stack JS)
 * Tiempo sugerido: 35 min
 *
 * ENUNCIADO — implementa usando `new Promise`, `.then` o async/await. Está PROHIBIDO
 * usar Promise.all, Promise.allSettled, Promise.any y Promise.race dentro de tus funciones.
 *
 * A) dormir(ms) -> Promise que se resuelve (con undefined) después de ms milisegundos.
 *
 * B) todas(iterable)  — tu propio Promise.all
 *    1. Resuelve con los valores EN EL ORDEN de entrada (no en el orden de llegada).
 *    2. Acepta valores que no son promesas (se tratan como ya resueltos).
 *    3. Se rechaza con el PRIMER error que ocurra.
 *    4. Con un iterable vacío resuelve [].
 *
 * C) todasResueltas(iterable)  — tu propio Promise.allSettled
 *    [{ status: "fulfilled", value }, { status: "rejected", reason }, ...] en orden.
 *
 * D) conTimeout(promesa, ms)
 *    Resuelve/rechaza igual que `promesa` si termina antes de ms; si no, rechaza con un
 *    Error cuyo name sea "TimeoutError". No debe dejar timers pendientes cuando la promesa
 *    termina a tiempo (las pruebas lo comprueban).
 *
 * E) reintentar(fn, { intentos = 3, retrasoMs = 100 } = {})
 *    Llama a fn() (que devuelve una promesa). Si falla, espera y reintenta con backoff
 *    exponencial: retrasoMs, retrasoMs*2, retrasoMs*4... Como máximo `intentos` llamadas
 *    en total. Si todas fallan, rechaza con el ÚLTIMO error.
 *
 * F) ejecutarConLimite(tareas, limite)
 *    `tareas` es un array de funciones que devuelven promesas (() => fetch(...)).
 *    Ejecuta como máximo `limite` a la vez, empezando una nueva en cuanto termina otra.
 *    Resuelve con los resultados en el orden de `tareas`. Si una falla, rechaza con ese
 *    error (no hace falta cancelar las que están en curso).
 *
 * PARA PENSAR
 * -----------
 * - ¿Por qué un .then se ejecuta después del código síncrono aunque la promesa ya esté resuelta?
 * - ¿Qué diferencia hay entre Promise.all y Promise.allSettled para un dashboard?
 * - conTimeout no CANCELA la operación original: ¿cómo la cancelarías con fetch? (AbortController)
 *
 * Ejecutar pruebas:  node javascript/03_utilidades_de_promesas.js
 */
const assert = require("node:assert/strict");
const { ejecutar, pendiente } = require("./_pruebas");

// ==== TU SOLUCIÓN (inicio) ====
function dormir(ms) {
  pendiente();
}

function todas(iterable) {
  pendiente();
}

function todasResueltas(iterable) {
  pendiente();
}

function conTimeout(promesa, ms) {
  pendiente();
}

async function reintentar(fn, { intentos = 3, retrasoMs = 100 } = {}) {
  pendiente();
}

function ejecutarConLimite(tareas, limite) {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
const tarda = (ms, valor, error = false) =>
  new Promise((res, rej) => setTimeout(() => (error ? rej(new Error(valor)) : res(valor)), ms));

function sinCombinadores(...fns) {
  for (const f of fns) {
    assert.ok(!/Promise\.(all|allSettled|any|race)\b/.test(f.toString()), `${f.name} usa un combinador nativo`);
  }
}

ejecutar({
  async a_dormir() {
    const t = Date.now();
    assert.equal(await dormir(50), undefined);
    assert.ok(Date.now() - t >= 45, "resolvió antes de tiempo");
  },
  async b_todas_orden_y_valores() {
    sinCombinadores(todas);
    assert.deepEqual(await todas([tarda(40, "a"), "b", tarda(10, "c")]), ["a", "b", "c"]);
    assert.deepEqual(await todas([]), []);
    assert.deepEqual(await todas(new Set([1, tarda(5, 2)])), [1, 2]);
  },
  async b_todas_primer_error() {
    await assert.rejects(todas([tarda(50, "lento", true), tarda(10, "rápido", true), tarda(5, "ok")]), {
      message: "rápido",
    });
  },
  async c_todas_resueltas() {
    sinCombinadores(todasResueltas);
    const r = await todasResueltas([tarda(10, "a"), tarda(5, "x", true), 3]);
    assert.equal(r[0].status, "fulfilled");
    assert.equal(r[0].value, "a");
    assert.equal(r[1].status, "rejected");
    assert.equal(r[1].reason.message, "x");
    assert.deepEqual(r[2], { status: "fulfilled", value: 3 });
  },
  async d_con_timeout() {
    sinCombinadores(conTimeout);
    assert.equal(await conTimeout(tarda(10, "a tiempo"), 100), "a tiempo");
    await assert.rejects(conTimeout(tarda(10, "falló", true), 100), { message: "falló" });
    await assert.rejects(conTimeout(tarda(200, "tarde"), 30), { name: "TimeoutError" });
  },
  async d_con_timeout_limpia_el_timer() {
    const original = global.setTimeout;
    const limpiados = new Set();
    const creados = [];
    const clearOriginal = global.clearTimeout;
    global.setTimeout = (fn, ms, ...a) => {
      const id = original(fn, ms, ...a);
      creados.push({ id, ms });
      return id;
    };
    global.clearTimeout = (id) => {
      limpiados.add(id);
      return clearOriginal(id);
    };
    try {
      await conTimeout(Promise.resolve("ya"), 5000);
    } finally {
      global.setTimeout = original;
      global.clearTimeout = clearOriginal;
    }
    const largos = creados.filter((t) => t.ms === 5000);
    assert.ok(largos.length > 0, "conTimeout debería usar setTimeout");
    assert.ok(largos.every((t) => limpiados.has(t.id)), "el timer de 5000 ms quedó pendiente: usa clearTimeout");
  },
  async e_reintentar() {
    let llamadas = 0;
    const tiempos = [];
    const fn = async () => {
      tiempos.push(Date.now());
      if (++llamadas < 3) throw new Error(`fallo ${llamadas}`);
      return "ok";
    };
    assert.equal(await reintentar(fn, { intentos: 3, retrasoMs: 20 }), "ok");
    assert.equal(llamadas, 3);
    assert.ok(tiempos[1] - tiempos[0] >= 15, "no esperó retrasoMs antes del 2.º intento");
    assert.ok(tiempos[2] - tiempos[1] >= 35, "el 3.er intento debió esperar retrasoMs*2 (backoff)");
  },
  async e_reintentar_ultimo_error() {
    let n = 0;
    await assert.rejects(reintentar(async () => { throw new Error(`fallo ${++n}`); }, { intentos: 2, retrasoMs: 1 }), {
      message: "fallo 2",
    });
    assert.equal(n, 2, "hizo más llamadas que `intentos`");
  },
  async f_ejecutar_con_limite() {
    sinCombinadores(ejecutarConLimite);
    let enCurso = 0;
    let maximo = 0;
    const tarea = (ms, v) => async () => {
      enCurso++;
      maximo = Math.max(maximo, enCurso);
      await tarda(ms);
      enCurso--;
      return v;
    };
    const t = Date.now();
    const r = await ejecutarConLimite([tarea(50, 1), tarea(10, 2), tarea(10, 3), tarea(10, 4), tarea(10, 5)], 2);
    assert.deepEqual(r, [1, 2, 3, 4, 5]);
    assert.equal(maximo, 2, `hubo ${maximo} tareas a la vez (límite 2)`);
    assert.ok(Date.now() - t < 120, "no arranca una tarea nueva en cuanto se libera un cupo");
  },
  async f_ejecutar_con_limite_error_y_vacio() {
    assert.deepEqual(await ejecutarConLimite([], 3), []);
    await assert.rejects(ejecutarConLimite([() => tarda(5, "x", true), () => tarda(5, "y")], 1), { message: "x" });
  },
});
