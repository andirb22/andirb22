/**
 * EJERCICIO 06 — Temporizadores: contador automático y cuenta regresiva
 * Tema: setInterval/clearInterval, estado encapsulado, limpieza de recursos, promesas
 * Basado en: "construye un contador de incremento/decremento usando setInterval y
 * clearInterval" (live coding reportado en EPAM)
 * Tiempo sugerido: 30 min
 *
 * ENUNCIADO
 * ---------
 * A) class Contador
 *      new Contador({ paso = 1, intervaloMs = 1000, min = -Infinity, max = Infinity, onCambio })
 *      .valor                 -> número actual (solo lectura: asignarlo no debe cambiarlo)
 *      .corriendo             -> boolean
 *      .incrementar() / .decrementar()   -> cambia en ±paso, una vez
 *      .iniciar(direccion = 1)           -> cada intervaloMs suma direccion * paso
 *      .detener()
 *      .reiniciar()           -> detiene y vuelve a 0
 *    Requisitos:
 *    1. Llamar a iniciar() varias veces NO debe crear varios intervalos (no se acelera);
 *       llamarlo con otra dirección cambia la dirección.
 *    2. El valor nunca sale de [min, max]. Si el automático llega a un límite, se detiene solo.
 *    3. onCambio(nuevoValor) se llama SOLO cuando el valor cambia de verdad.
 *    4. detener() sin haber iniciado no lanza error.
 *
 * B) cuentaRegresiva(segundos, { onTick, intervaloMs = 1000 } = {})
 *    Devuelve { promesa, cancelar }.
 *    - onTick(restantes) se llama al inicio con `segundos` y luego en cada intervalo con
 *      segundos-1, segundos-2 ... 0.
 *    - `promesa` se resuelve con "completada" al llegar a 0.
 *    - cancelar() detiene el intervalo y la promesa se resuelve con "cancelada".
 *      Llamar a cancelar() después de completar no hace nada.
 *    - segundos debe ser un entero >= 0; si no, lanza RangeError.
 *      Con 0: onTick(0) y se resuelve "completada" sin esperar.
 *
 * PARA PENSAR
 * -----------
 * - ¿Qué pasaría en un componente (React/Angular) si no limpias el intervalo al destruirlo?
 * - setInterval de 1000 ms no garantiza 1000 ms exactos: ¿cómo harías un cronómetro preciso?
 * - En React, ¿por qué setCount(count + 1) dentro de un setInterval "se queda pegado"?
 *
 * Ejecutar pruebas:  node TGI_SOLUCIONES/javascript/06_temporizadores.js
 */
const assert = require("node:assert/strict");
const { ejecutar, pendiente } = require("./_pruebas");

// ==== TU SOLUCIÓN (inicio) ====
class Contador {
  constructor({ paso = 1, intervaloMs = 1000, min = -Infinity, max = Infinity, onCambio = () => {} } = {}) {
    pendiente();
  }
}

function cuentaRegresiva(segundos, { onTick = () => {}, intervaloMs = 1000 } = {}) {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

ejecutar({
  manual_y_limites() {
    const cambios = [];
    const c = new Contador({ paso: 2, min: -2, max: 3, onCambio: (v) => cambios.push(v) });
    c.incrementar();
    c.incrementar(); // 4 se pasa de max -> queda en 3
    c.incrementar(); // ya está en 3: no cambia, no notifica
    assert.equal(c.valor, 3);
    c.decrementar();
    c.decrementar();
    c.decrementar(); // -3 -> -2
    assert.equal(c.valor, -2);
    assert.deepEqual(cambios, [2, 3, 1, -1, -2]);
    try { c.valor = 99; } catch { /* puede lanzar en modo estricto */ }
    assert.equal(c.valor, -2, "valor no debe poder asignarse desde afuera");
    c.detener();
  },
  async automatico_sin_intervalos_duplicados() {
    const c = new Contador({ intervaloMs: 20 });
    c.iniciar();
    c.iniciar();
    c.iniciar();
    assert.equal(c.corriendo, true);
    await espera(110);
    c.detener();
    assert.equal(c.corriendo, false);
    const v = c.valor;
    assert.ok(v >= 3 && v <= 6, `valor ${v}: ¿se crearon varios intervalos?`);
    await espera(60);
    assert.equal(c.valor, v, "siguió cambiando después de detener()");
  },
  async cambiar_direccion_y_parar_en_limite() {
    const c = new Contador({ intervaloMs: 15, min: 0, max: 100 });
    c.iniciar(1);
    await espera(70);
    c.iniciar(-1); // misma instancia, ahora baja
    await espera(200);
    assert.equal(c.valor, 0, "debió bajar hasta min");
    assert.equal(c.corriendo, false, "al llegar al límite debe detenerse solo");
  },
  reiniciar() {
    const c = new Contador();
    c.incrementar();
    c.iniciar();
    c.reiniciar();
    assert.equal(c.valor, 0);
    assert.equal(c.corriendo, false);
  },
  async cuenta_regresiva_completa() {
    const ticks = [];
    const t = Date.now();
    const { promesa } = cuentaRegresiva(3, { intervaloMs: 20, onTick: (s) => ticks.push(s) });
    assert.deepEqual(ticks, [3], "onTick debe llamarse de inmediato con el valor inicial");
    assert.equal(await promesa, "completada");
    assert.deepEqual(ticks, [3, 2, 1, 0]);
    assert.ok(Date.now() - t >= 55);
  },
  async cuenta_regresiva_cancelada() {
    const ticks = [];
    const { promesa, cancelar } = cuentaRegresiva(10, { intervaloMs: 20, onTick: (s) => ticks.push(s) });
    await espera(50);
    cancelar();
    assert.equal(await promesa, "cancelada");
    const n = ticks.length;
    await espera(60);
    assert.equal(ticks.length, n, "siguió llamando a onTick después de cancelar");
    cancelar(); // no debe lanzar
  },
  async cuenta_regresiva_bordes() {
    const ticks = [];
    assert.equal(await cuentaRegresiva(0, { onTick: (s) => ticks.push(s) }).promesa, "completada");
    assert.deepEqual(ticks, [0]);
    for (const malo of [-1, 1.5, "3"]) {
      assert.throws(() => cuentaRegresiva(malo), RangeError, `cuentaRegresiva(${JSON.stringify(malo)})`);
    }
  },
});
