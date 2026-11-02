/**
 * Async/await y fetch (reportado en EPAM: "reescribe esta cadena de promesas con
 * async/await" y "escribe una función que traiga datos con fetch o axios").
 *
 * Detalles que diferencian a un Senior:
 * - fetch NO rechaza con 404/500: solo con errores de red. Hay que revisar res.ok.
 * - Independientes en paralelo con Promise.all, no un await detrás de otro.
 * - Timeout con AbortController (fetch no trae timeout propio).
 * - Reintentos solo para errores transitorios (red, 5xx, 429), con backoff.
 * Ejecutar: node 04_async_await_fetch.js  (levanta un servidor local para probar)
 */
const assert = require("node:assert/strict");
const http = require("node:http");

// --- 1) Cadena de promesas original ----------------------------------------
function perfilConPromesas(api, id) {
  return api
    .getUser(id)
    .then((user) => api.getPosts(user.id).then((posts) => ({ user, posts })))
    .then(({ user, posts }) => ({ nombre: user.name, totalPosts: posts.length }))
    .catch((err) => ({ error: err.message }));
}

// --- 1) La misma lógica con async/await ------------------------------------
async function perfilConAwait(api, id) {
  try {
    const user = await api.getUser(id);
    const posts = await api.getPosts(user.id); // depende de user -> secuencial
    return { nombre: user.name, totalPosts: posts.length };
  } catch (err) {
    return { error: err.message };
  }
}

// --- 2) Paralelo: si no dependen entre sí, no esperarlas una por una -------
async function dashboard(api, id) {
  const [user, notificaciones] = await Promise.all([api.getUser(id), api.getNotifications(id)]);
  return { user: user.name, notificaciones: notificaciones.length };
}

// --- 3) fetch robusto -------------------------------------------------------
class HttpError extends Error {
  constructor(status, body) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function fetchJson(url, { timeoutMs = 5000, retries = 2, backoffMs = 100, ...init } = {}) {
  for (let intento = 0; ; intento++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (!res.ok) throw new HttpError(res.status, await res.text());
      return await res.json();
    } catch (err) {
      const transitorio =
        err.name === "AbortError" || err instanceof TypeError || // timeout o error de red
        (err instanceof HttpError && (err.status >= 500 || err.status === 429));
      if (!transitorio || intento >= retries) throw err;
      await new Promise((r) => setTimeout(r, backoffMs * 2 ** intento));
    } finally {
      clearTimeout(timer);
    }
  }
}

// --- Pruebas ----------------------------------------------------------------
const apiFalsa = {
  getUser: async (id) => {
    if (id < 0) throw new Error("no existe");
    return { id, name: "Ana" };
  },
  getPosts: async () => [1, 2, 3],
  getNotifications: async () => [1],
};

(async () => {
  assert.deepEqual(await perfilConPromesas(apiFalsa, 1), { nombre: "Ana", totalPosts: 3 });
  assert.deepEqual(await perfilConAwait(apiFalsa, 1), { nombre: "Ana", totalPosts: 3 });
  assert.deepEqual(await perfilConAwait(apiFalsa, -1), { error: "no existe" });
  assert.deepEqual(await dashboard(apiFalsa, 1), { user: "Ana", notificaciones: 1 });

  let fallosRestantes = 2;
  const server = http.createServer((req, res) => {
    if (req.url === "/flaky" && fallosRestantes-- > 0) return res.writeHead(503).end("ocupado");
    if (req.url === "/404") return res.writeHead(404).end("no");
    if (req.url === "/lento") return setTimeout(() => res.end("{}"), 500);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, url: req.url }));
  });
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  try {
    assert.deepEqual(await fetchJson(`${base}/flaky`, { backoffMs: 5 }), { ok: true, url: "/flaky" });
    await assert.rejects(fetchJson(`${base}/404`), (e) => e.status === 404); // 4xx no se reintenta
    await assert.rejects(fetchJson(`${base}/lento`, { timeoutMs: 50, retries: 0 }), { name: "AbortError" });
  } finally {
    server.closeAllConnections();
    server.close();
  }
  console.log("OK - async/await y fetch");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
