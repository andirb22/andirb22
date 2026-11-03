/**
 * Contador con incremento/decremento usando setInterval y clearInterval
 * (reportado en EPAM; ahí lo pidieron en React — ver 06b_contador_react.jsx).
 *
 * Errores típicos que evaluan:
 * - Crear un intervalo nuevo en cada "start" sin limpiar el anterior (se acelera).
 * - No limpiar el intervalo al destruir el componente (fuga de memoria).
 * - setInterval no es exacto: si importa el tiempo real, calcular con Date.now().
 * Ejecutar: node 06_contador_intervalo.js
 */
const assert = require("node:assert/strict");

class Contador {
  #valor = 0;
  #id = null;

  constructor({ paso = 1, intervaloMs = 1000, onTick = () => {} } = {}) {
    this.paso = paso;
    this.intervaloMs = intervaloMs;
    this.onTick = onTick;
  }

  get valor() { return this.#valor; }
  get corriendo() { return this.#id !== null; }

  incrementar() { this.#cambiar(this.paso); }
  decrementar() { this.#cambiar(-this.paso); }

  #cambiar(delta) {
    this.#valor += delta;
    this.onTick(this.#valor);
  }

  iniciar(direccion = 1) {
    this.detener(); // evita intervalos duplicados
    this.#id = setInterval(() => this.#cambiar(direccion * this.paso), this.intervaloMs);
  }

  detener() {
    if (this.#id !== null) {
      clearInterval(this.#id);
      this.#id = null;
    }
  }

  reiniciar() {
    this.detener();
    this.#valor = 0;
  }
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const ticks = [];
  const c = new Contador({ intervaloMs: 20, onTick: (v) => ticks.push(v) });
  c.incrementar();
  c.decrementar();
  assert.equal(c.valor, 0);

  c.iniciar(); // sube
  c.iniciar(); // llamarlo dos veces NO duplica el intervalo
  await esperar(110);
  c.detener();
  const alDetener = c.valor;
  assert.ok(alDetener >= 3 && alDetener <= 6, `valor inesperado ${alDetener}`);
  await esperar(60);
  assert.equal(c.valor, alDetener); // ya no cambia

  c.iniciar(-1); // baja
  await esperar(70);
  c.detener();
  assert.ok(c.valor < alDetener);
  assert.equal(c.corriendo, false);
  c.reiniciar();
  assert.equal(c.valor, 0);
  console.log("OK - contador con intervalo");
})();
