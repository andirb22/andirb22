/**
 * Implementar una Promise (reportado en EPAM: "explica las promesas e implementa una").
 *
 * Puntos que deben salir en la explicación:
 * - 3 estados: pending -> fulfilled | rejected. Una vez resuelta, no cambia.
 * - then() SIEMPRE devuelve una nueva promesa (eso permite encadenar).
 * - Los callbacks se ejecutan de forma asíncrona, en la cola de MICROTAREAS
 *   (antes que setTimeout), aunque la promesa ya esté resuelta.
 * - Si un callback devuelve otra promesa (o un "thenable"), la cadena espera a que se resuelva.
 * - Si un callback lanza, la promesa siguiente se rechaza.
 * - Si no hay callback para ese estado, el valor/error "pasa de largo" a la siguiente.
 * Ejecutar: node 03_promesa_propia.js
 */
const assert = require("node:assert/strict");

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  #state = PENDING;
  #value = undefined;
  #handlers = [];

  constructor(executor) {
    let llamado = false; // resolve/reject solo cuentan la primera vez
    const resolve = (v) => {
      if (llamado) return;
      llamado = true;
      this.#resolverCon(v);
    };
    const reject = (r) => {
      if (llamado) return;
      llamado = true;
      this.#asentar(REJECTED, r);
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e); // si el executor lanza, la promesa se rechaza
    }
  }

  // "Promise Resolution Procedure": adoptar el estado de un thenable
  #resolverCon(x) {
    if (x === this) return this.#asentar(REJECTED, new TypeError("Ciclo en la cadena de promesas"));
    if (x !== null && (typeof x === "object" || typeof x === "function")) {
      let then;
      try {
        then = x.then;
      } catch (e) {
        return this.#asentar(REJECTED, e);
      }
      if (typeof then === "function") {
        let llamado = false;
        try {
          then.call(
            x,
            (y) => !llamado && ((llamado = true), this.#resolverCon(y)),
            (r) => !llamado && ((llamado = true), this.#asentar(REJECTED, r)),
          );
        } catch (e) {
          if (!llamado) this.#asentar(REJECTED, e);
        }
        return;
      }
    }
    this.#asentar(FULFILLED, x);
  }

  #asentar(state, value) {
    if (this.#state !== PENDING) return;
    this.#state = state;
    this.#value = value;
    this.#handlers.forEach((h) => this.#ejecutar(h));
    this.#handlers = [];
  }

  #ejecutar({ onFulfilled, onRejected, resolve, reject }) {
    queueMicrotask(() => {
      const cb = this.#state === FULFILLED ? onFulfilled : onRejected;
      if (typeof cb !== "function") {
        // sin callback: propagar tal cual
        return this.#state === FULFILLED ? resolve(this.#value) : reject(this.#value);
      }
      try {
        resolve(cb(this.#value));
      } catch (e) {
        reject(e);
      }
    });
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const h = { onFulfilled, onRejected, resolve, reject };
      if (this.#state === PENDING) this.#handlers.push(h);
      else this.#ejecutar(h);
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(cb) {
    // no recibe el valor y no lo cambia (salvo que cb lance)
    return this.then(
      (v) => MyPromise.resolve(cb()).then(() => v),
      (r) => MyPromise.resolve(cb()).then(() => { throw r; }),
    );
  }

  static resolve(v) {
    return v instanceof MyPromise ? v : new MyPromise((res) => res(v));
  }

  static reject(r) {
    return new MyPromise((_, rej) => rej(r));
  }

  static all(iterable) {
    return new MyPromise((resolve, reject) => {
      const items = [...iterable];
      const resultados = new Array(items.length);
      let pendientes = items.length;
      if (pendientes === 0) return resolve(resultados);
      items.forEach((p, i) =>
        MyPromise.resolve(p).then((v) => {
          resultados[i] = v; // conservar el orden original, no el de llegada
          if (--pendientes === 0) resolve(resultados);
        }, reject), // el primer rechazo rechaza todo
      );
    });
  }

  static race(iterable) {
    return new MyPromise((resolve, reject) => {
      for (const p of iterable) MyPromise.resolve(p).then(resolve, reject);
    });
  }

  static allSettled(iterable) {
    return MyPromise.all(
      [...iterable].map((p) =>
        MyPromise.resolve(p).then(
          (value) => ({ status: FULFILLED, value }),
          (reason) => ({ status: REJECTED, reason }),
        ),
      ),
    );
  }
}

const esperar = (ms, v, fallar = false) =>
  new MyPromise((res, rej) => setTimeout(() => (fallar ? rej(v) : res(v)), ms));

(async () => {
  // encadenamiento y transformación del valor
  assert.equal(await MyPromise.resolve(1).then((x) => x + 1).then((x) => x * 10), 20);
  // devolver una promesa dentro de then: la cadena la espera
  assert.equal(await MyPromise.resolve(1).then(() => esperar(10, "tarde")), "tarde");
  // throw dentro de then -> catch
  assert.equal(await MyPromise.resolve().then(() => { throw new Error("x"); }).catch((e) => e.message), "x");
  // el error "salta" los then sin onRejected
  assert.equal(await MyPromise.reject("e").then((x) => x + "!").catch((e) => "atrapado " + e), "atrapado e");
  // resolve solo cuenta una vez
  assert.equal(await new MyPromise((res) => { res(1); res(2); throw new Error("ignorado"); }), 1);
  // finally no cambia el valor
  let corrio = false;
  assert.equal(await MyPromise.resolve(5).finally(() => { corrio = true; }), 5);
  assert.ok(corrio);
  // thenables y promesas nativas también se adoptan
  assert.equal(await MyPromise.resolve({ then: (r) => r("thenable") }), "thenable");
  assert.equal(await MyPromise.resolve(Promise.resolve("nativa")), "nativa");
  // asincronía: then se ejecuta DESPUÉS del código síncrono, aunque ya esté resuelta
  const orden = [];
  MyPromise.resolve().then(() => orden.push("then"));
  orden.push("sync");
  await esperar(0);
  assert.deepEqual(orden, ["sync", "then"]);
  // estáticos
  assert.deepEqual(await MyPromise.all([esperar(30, "a"), "b", esperar(10, "c")]), ["a", "b", "c"]);
  assert.equal(await MyPromise.all([esperar(10, 1), esperar(5, "boom", true)]).catch((e) => e), "boom");
  assert.equal(await MyPromise.race([esperar(30, "lenta"), esperar(5, "rápida")]), "rápida");
  assert.deepEqual(
    (await MyPromise.allSettled([MyPromise.resolve(1), MyPromise.reject(2)])).map((r) => r.status),
    ["fulfilled", "rejected"],
  );
  console.log("OK - promesa propia");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
