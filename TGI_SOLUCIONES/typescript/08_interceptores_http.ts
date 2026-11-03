/**
 * EJERCICIO 08 — Cadena de interceptores HTTP (como withInterceptors de Angular)
 * Tema: patrón cadena de responsabilidad, orden de interceptores, refresh de token
 * single-flight, reintentos solo en métodos idempotentes, contexto por petición
 * Basado en: preguntas de la guía EPAM: "¿cómo implementarías el refresh de token de forma
 * segura con interceptores?", "interceptor ordering, token refresh handling, http context",
 * "explica idempotencia"
 * Tiempo sugerido: 50 min
 *
 * Ejecutar:  node TGI_SOLUCIONES/typescript/08_interceptores_http.ts
 *
 * ENUNCIADO
 * ---------
 * Los tipos Peticion, Respuesta, Siguiente e Interceptor ya están definidos. El backend es
 * una función Siguiente: recibe una Peticion y devuelve una Respuesta (cualquier status), o
 * lanza TypeError si hay error de red.
 *
 * A) crearCliente(backend, interceptores) -> (peticion) => Promise<Respuesta>
 *    - El PRIMER interceptor de la lista es el más externo: ve la petición primero y la
 *      respuesta al final (igual que Angular).
 *    - Completa los valores por defecto antes de pasar la petición: metodo "GET",
 *      headers {}, contexto new Map().
 *    - Si la respuesta FINAL tiene status >= 400, rechaza con ErrorHttp (con su status).
 *    - Los interceptores NO deben mutar la petición recibida: crean una copia (como clone()).
 *
 * B) interceptorCorrelacion(generarId): agrega el header "X-Correlation-Id" con generarId()
 *    si la petición no lo trae ya.
 *
 * C) interceptorAuth(auth) — auth tiene token(): string | null, refrescar(): Promise<string>
 *    y cerrarSesion(): void.
 *    1. Si hay token, agrega "Authorization: Bearer <token>".
 *    2. Si la petición tiene en el contexto OMITIR_AUTH = true, pasa sin tocarla.
 *    3. Si la respuesta es 401: llama a refrescar() y repite la petición UNA vez con el
 *       token nuevo. Si la repetición vuelve a dar 401, se devuelve tal cual (sin bucle).
 *    4. Single-flight: si varias peticiones reciben 401 a la vez, refrescar() se llama UNA
 *       sola vez y todas esperan ese mismo token.
 *    5. Si refrescar() falla: cerrarSesion() y se devuelve la respuesta 401 original.
 *
 * D) interceptorReintentos({ intentos = 3, retrasoMs = 50 })
 *    Reintenta si la respuesta es 502, 503 o 504, o si el backend lanzó TypeError (red).
 *    Solo para métodos idempotentes: GET, HEAD, PUT, DELETE, OPTIONS. Nunca POST ni PATCH.
 *    `intentos` es el total de llamadas. Espera retrasoMs * 2^(n-1) entre intentos.
 *    Si se agotan: devuelve la última respuesta (o relanza el último TypeError).
 *
 * PARA PENSAR
 * -----------
 * - ¿En qué orden pondrías correlación, auth y reintentos? ¿Por qué importa?
 * - ¿Dónde guardarías el access token y el refresh token en el navegador? (XSS)
 * - ¿Por qué POST no se reintenta automáticamente? ¿Cómo lo harías seguro? (ejercicio 09 de Python)
 */
import { ejecutar, espera, igual, ok, pendiente, rechaza } from "./_pruebas.ts";

export interface Peticion {
  url: string;
  metodo: string;
  headers: Record<string, string>;
  cuerpo?: unknown;
  contexto: Map<string, unknown>;
}
export type PeticionParcial = Partial<Peticion> & { url: string };
export interface Respuesta {
  status: number;
  cuerpo?: unknown;
}
export type Siguiente = (p: Peticion) => Promise<Respuesta>;
export type Interceptor = (p: Peticion, siguiente: Siguiente) => Promise<Respuesta>;

export class ErrorHttp extends Error {
  readonly status: number;
  readonly respuesta: Respuesta;
  constructor(respuesta: Respuesta) {
    super(`HTTP ${respuesta.status}`);
    this.name = "ErrorHttp";
    this.status = respuesta.status;
    this.respuesta = respuesta;
  }
}

export const OMITIR_AUTH = "omitirAuth";

export interface ServicioAuth {
  token(): string | null;
  refrescar(): Promise<string>;
  cerrarSesion(): void;
}

// ==== TU SOLUCIÓN (inicio) ====
export function crearCliente(backend: Siguiente, interceptores: Interceptor[]): (p: PeticionParcial) => Promise<Respuesta> {
  pendiente();
}

export function interceptorCorrelacion(generarId: () => string): Interceptor {
  pendiente();
}

export function interceptorAuth(auth: ServicioAuth): Interceptor {
  pendiente();
}

export function interceptorReintentos(opciones: { intentos?: number; retrasoMs?: number } = {}): Interceptor {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
function backendFalso(manejar: (p: Peticion, n: number) => Respuesta | "red" | Promise<Respuesta>) {
  const recibidas: Peticion[] = [];
  const backend: Siguiente = async (p) => {
    recibidas.push(p);
    await espera(5);
    const r = await manejar(p, recibidas.length);
    if (r === "red") throw new TypeError("Failed to fetch");
    return r;
  };
  return { backend, recibidas };
}

function authFalsa(tokenInicial: string | null, refresco: () => Promise<string>) {
  let actual = tokenInicial;
  const s = { refrescos: 0, cierres: 0 };
  const auth: ServicioAuth = {
    token: () => actual,
    refrescar: async () => {
      s.refrescos++;
      actual = await refresco();
      return actual;
    },
    cerrarSesion: () => {
      s.cierres++;
      actual = null;
    },
  };
  return { auth, s };
}

ejecutar({
  async orden_y_valores_por_defecto() {
    const orden: string[] = [];
    const marcar = (nombre: string): Interceptor => async (p, sig) => {
      orden.push(`${nombre}:pet`);
      const r = await sig(p);
      orden.push(`${nombre}:resp`);
      return r;
    };
    const { backend, recibidas } = backendFalso(() => ({ status: 200, cuerpo: "ok" }));
    const http = crearCliente(backend, [marcar("A"), marcar("B")]);
    igual(await http({ url: "/x" }), { status: 200, cuerpo: "ok" });
    igual(orden, ["A:pet", "B:pet", "B:resp", "A:resp"]);
    igual(recibidas[0].metodo, "GET");
    igual(recibidas[0].headers, {});
    ok(recibidas[0].contexto instanceof Map);
  },
  async errores_http() {
    const { backend } = backendFalso(() => ({ status: 404 }));
    const e = await rechaza(crearCliente(backend, [])({ url: "/no" }));
    ok(e instanceof ErrorHttp && e.status === 404, "debe rechazar con ErrorHttp 404");
  },
  async correlacion_sin_mutar() {
    const { backend, recibidas } = backendFalso(() => ({ status: 200 }));
    let n = 0;
    const http = crearCliente(backend, [interceptorCorrelacion(() => `id-${++n}`)]);
    const headers = { Accept: "json" };
    await http({ url: "/a", headers });
    await http({ url: "/b", headers: { "X-Correlation-Id": "propio" } });
    igual(recibidas[0].headers, { Accept: "json", "X-Correlation-Id": "id-1" });
    igual(recibidas[1].headers["X-Correlation-Id"], "propio");
    igual(headers, { Accept: "json" }, "no se debe mutar la petición original");
  },
  async auth_agrega_token_y_respeta_contexto() {
    const { backend, recibidas } = backendFalso(() => ({ status: 200 }));
    const { auth } = authFalsa("t1", async () => "t2");
    const http = crearCliente(backend, [interceptorAuth(auth)]);
    await http({ url: "/perfil" });
    await http({ url: "/login", contexto: new Map([[OMITIR_AUTH, true]]) });
    igual(recibidas[0].headers.Authorization, "Bearer t1");
    igual(recibidas[1].headers.Authorization, undefined);
  },
  async auth_refresh_single_flight() {
    const { backend, recibidas } = backendFalso((p) => ({ status: p.headers.Authorization === "Bearer nuevo" ? 200 : 401 }));
    const { auth, s } = authFalsa("viejo", async () => {
      await espera(20);
      return "nuevo";
    });
    const http = crearCliente(backend, [interceptorAuth(auth)]);
    const r = await Promise.all([http({ url: "/1" }), http({ url: "/2" }), http({ url: "/3" })]);
    igual(r.map((x) => x.status), [200, 200, 200]);
    igual(s.refrescos, 1, "3 peticiones con 401 simultáneas deben compartir 1 solo refresh");
    igual(recibidas.length, 6, "cada petición se repite exactamente una vez");
  },
  async auth_sin_bucle_y_refresh_fallido() {
    const { backend, recibidas } = backendFalso(() => ({ status: 401 }));
    const { auth, s } = authFalsa("x", async () => "y");
    const e = await rechaza(crearCliente(backend, [interceptorAuth(auth)])({ url: "/a" }));
    ok(e instanceof ErrorHttp && e.status === 401);
    igual(recibidas.length, 2, "no debe repetir más de una vez");
    const fallido = authFalsa("x", async () => {
      throw new Error("refresh expirado");
    });
    const e2 = await rechaza(crearCliente(backendFalso(() => ({ status: 401 })).backend, [interceptorAuth(fallido.auth)])({ url: "/b" }));
    ok(e2 instanceof ErrorHttp && e2.status === 401, "debe devolver el 401 original");
    igual(fallido.s.cierres, 1, "si el refresh falla, cierra sesión");
    void s;
  },
  async reintentos_idempotentes() {
    const { backend, recibidas } = backendFalso((_p, n) => (n === 1 ? "red" : n === 2 ? { status: 503 } : { status: 200 }));
    const http = crearCliente(backend, [interceptorReintentos({ intentos: 3, retrasoMs: 10 })]);
    const t = Date.now();
    igual((await http({ url: "/x" })).status, 200);
    igual(recibidas.length, 3);
    ok(Date.now() - t >= 25, "debe esperar retrasoMs y luego el doble (backoff)");
  },
  async reintentos_no_en_post_ni_4xx() {
    const post = backendFalso(() => ({ status: 503 }));
    await rechaza(crearCliente(post.backend, [interceptorReintentos({ retrasoMs: 1 })])({ url: "/pagos", metodo: "POST" }));
    igual(post.recibidas.length, 1, "POST no se reintenta");
    const get400 = backendFalso(() => ({ status: 400 }));
    await rechaza(crearCliente(get400.backend, [interceptorReintentos({ retrasoMs: 1 })])({ url: "/x" }));
    igual(get400.recibidas.length, 1, "un 400 no se reintenta");
    const siempreRed = backendFalso(() => "red");
    const e = await rechaza(crearCliente(siempreRed.backend, [interceptorReintentos({ intentos: 2, retrasoMs: 1 })])({ url: "/x", metodo: "PUT" }));
    ok(e instanceof TypeError, "al agotar intentos por red, relanza el TypeError");
    igual(siempreRed.recibidas.length, 2);
  },
});
