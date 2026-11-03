/**
 * EJERCICIO 04 — De callbacks y cadenas de promesas a async/await
 * Tema: async/await, paralelismo con Promise.all, manejo de errores, promisificar
 * Basado en: "reescribe esta cadena de promesas con async/await" y "escribe una función
 * que traiga datos con fetch" (reportados en EPAM, Full Stack JS)
 * Tiempo sugerido: 30 min
 *
 * CONTEXTO
 * --------
 * Heredaste código antiguo de un BFF (backend for frontend) que arma el perfil de un
 * usuario. Está escrito con callbacks y cadenas de .then, es difícil de leer y LENTO,
 * porque hace en serie llamadas que podrían ir en paralelo.
 *
 * La "API" (`api`) se pasa como parámetro. Sus métodos devuelven promesas:
 *   api.usuario(id)          -> { id, nombre, equipoId }
 *   api.equipo(equipoId)     -> { id, nombre }
 *   api.publicaciones(id)    -> [{ id, titulo }]
 *   api.notificaciones(id)   -> [{ id, leida: boolean }]
 * Cada llamada tarda ~50 ms en las pruebas.
 *
 * ENUNCIADO
 * ---------
 * A) promisificar(fn)
 *    Convierte una función estilo Node `fn(...args, (err, resultado) => {})` en una que
 *    devuelve una promesa. Debe conservar `this` y todos los argumentos.
 *
 * B) perfilUsuario(api, id) — reescritura con async/await de `perfilLegacy` (abajo)
 *    Devuelve: { nombre, equipo, publicaciones, sinLeer }
 *      - equipo: nombre del equipo, o null si el usuario no tiene equipoId
 *      - publicaciones: cantidad
 *      - sinLeer: notificaciones con leida === false
 *    Requisitos:
 *    1. Mismo resultado que perfilLegacy en los casos de éxito.
 *    2. Paraleliza todo lo que no dependa de otra respuesta. Debe tardar unos 100 ms
 *       (2 "rondas"), no 200 ms como el legacy.
 *    3. Si falla api.usuario -> lanza Error con message "usuario no encontrado: <id>"
 *       y con la causa original en error.cause.
 *    4. Si falla api.notificaciones -> NO falla todo el perfil: sinLeer = null.
 *       Cualquier otro error se propaga.
 *    5. Usa async/await y try/catch: sin .then() en tu implementación.
 *
 * C) primeroDisponible(fuentes)
 *    `fuentes` es un array de funciones que devuelven promesas (réplicas de un servicio).
 *    Pruébalas EN ORDEN, una tras otra, y devuelve el primer resultado exitoso.
 *    Si todas fallan, lanza un AggregateError con todos los errores (en orden).
 *
 * PARA PENSAR
 * -----------
 * - ¿Qué pasa si haces `array.forEach(async x => await algo(x))`? ¿Espera?
 * - ¿await en un for...of vs Promise.all: cuándo usar cada uno?
 * - Si hay 2000 usuarios, ¿lanzarías 2000 peticiones en paralelo? (ver ejercicio 03 F)
 *
 * Ejecutar pruebas:  node TGI_SOLUCIONES/javascript/04_async_await_refactor.js
 */
const assert = require("node:assert/strict");
const { ejecutar, pendiente } = require("./_pruebas");

// Código legacy de referencia: NO modificar (las pruebas comparan contra él)
function perfilLegacy(api, id) {
  return api.usuario(id).then((u) => {
    const equipoP = u.equipoId ? api.equipo(u.equipoId).then((e) => e.nombre) : Promise.resolve(null);
    return equipoP.then((equipo) =>
      api.publicaciones(id).then((pubs) =>
        api.notificaciones(id).then((nots) => ({
          nombre: u.nombre,
          equipo,
          publicaciones: pubs.length,
          sinLeer: nots.filter((n) => !n.leida).length,
        })),
      ),
    );
  });
}

// ==== TU SOLUCIÓN (inicio) ====
function promisificar(fn) {
  pendiente();
}

async function perfilUsuario(api, id) {
  pendiente();
}

async function primeroDisponible(fuentes) {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function crearApi({ fallaUsuario = false, fallaNotificaciones = false, fallaPublicaciones = false } = {}) {
  const llamar = async (valor, falla) => {
    await espera(50);
    if (falla) throw new Error("500 del servicio");
    return valor;
  };
  return {
    usuario: (id) => llamar({ id, nombre: "Ana", equipoId: id === 2 ? null : 7 }, fallaUsuario),
    equipo: (eid) => llamar({ id: eid, nombre: "Plataforma" }, false),
    publicaciones: () => llamar([{ id: 1 }, { id: 2 }, { id: 3 }], fallaPublicaciones),
    notificaciones: () => llamar([{ leida: true }, { leida: false }, { leida: false }], fallaNotificaciones),
  };
}

ejecutar({
  async a_promisificar() {
    const legacy = {
      factor: 3,
      multiplicar(a, b, cb) {
        setTimeout(() => (a < 0 ? cb(new Error("negativo")) : cb(null, a * b * this.factor)), 5);
      },
    };
    const multiplicar = promisificar(legacy.multiplicar);
    assert.equal(await multiplicar.call(legacy, 2, 5), 30);
    await assert.rejects(multiplicar.call(legacy, -1, 5), { message: "negativo" });
  },
  async b_mismo_resultado_que_legacy() {
    const api = crearApi();
    assert.deepEqual(await perfilUsuario(api, 1), await perfilLegacy(api, 1));
    assert.deepEqual(await perfilUsuario(api, 2), await perfilLegacy(api, 2)); // sin equipo
  },
  async b_es_paralelo() {
    const t = Date.now();
    await perfilUsuario(crearApi(), 1);
    const ms = Date.now() - t;
    assert.ok(ms < 140, `tardó ${ms} ms: hay llamadas en serie que podrían ir en paralelo`);
  },
  async b_errores() {
    let e = null;
    try {
      await perfilUsuario(crearApi({ fallaUsuario: true }), 9);
    } catch (err) {
      e = err;
    }
    if (e && e.name === "NoImplementado") throw e;
    assert.ok(e, "debió lanzar un error si falla api.usuario");
    assert.equal(e.message, "usuario no encontrado: 9");
    assert.equal(e.cause?.message, "500 del servicio", "falta la causa original en error.cause");
    const r = await perfilUsuario(crearApi({ fallaNotificaciones: true }), 1);
    assert.equal(r.sinLeer, null);
    assert.equal(r.publicaciones, 3);
    await assert.rejects(perfilUsuario(crearApi({ fallaPublicaciones: true }), 1), { message: "500 del servicio" });
  },
  async b_sin_then() {
    await perfilUsuario(crearApi(), 1); // primero debe estar implementada
    assert.ok(!/\.then\(/.test(perfilUsuario.toString()), "perfilUsuario no debe usar .then()");
  },
  async c_primero_disponible() {
    const orden = [];
    const fuente = (nombre, ok) => async () => {
      orden.push(nombre);
      await espera(5);
      if (!ok) throw new Error(`${nombre} caída`);
      return nombre;
    };
    assert.equal(await primeroDisponible([fuente("r1", false), fuente("r2", true), fuente("r3", true)]), "r2");
    assert.deepEqual(orden, ["r1", "r2"], "deben probarse en orden y parar en la primera exitosa");
    await assert.rejects(primeroDisponible([fuente("a", false), fuente("b", false)]), (e) => {
      assert.ok(e instanceof AggregateError, "debe ser un AggregateError");
      assert.deepEqual(e.errors.map((x) => x.message), ["a caída", "b caída"]);
      return true;
    });
  },
});
