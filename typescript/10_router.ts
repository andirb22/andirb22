/**
 * EJERCICIO 10 — Mini router con guards, resolvers y lazy loading
 * Tema: matching de rutas con parámetros, rutas hijas, redirecciones, guards síncronos y
 * asíncronos, resolvers en paralelo, carga perezosa con caché
 * Basado en: la guía EPAM ("Routing: guards functional vs class, preloading, route events,
 * resolvers"; "explica lazy loading y code splitting en Angular")
 * Tiempo sugerido: 60 min
 *
 * Ejecutar:  node typescript/10_router.ts
 *
 * ENUNCIADO
 * ---------
 * class Router
 *   constructor(rutas: Ruta[])
 *   navegar(url): Promise<Navegacion>
 *
 * Una Ruta (tipo definido abajo) tiene `ruta` relativa a su padre ("users/:id", "" o "**").
 *
 * Reglas del matching:
 * 1. Separa la url en path y query ("?a=1&b=2" -> { a: "1", b: "2" }, decodificado).
 *    Ignora "/" inicial y final.
 * 2. Recorre las rutas EN ORDEN; gana la primera que encaja. Un segmento ":nombre" captura
 *    cualquier valor. "**" encaja con todo lo que quede.
 * 3. Una ruta con `hijos` (o `cargarHijos`) consume sus segmentos y el resto debe encajar en
 *    alguno de sus hijos; si ninguno encaja, esa ruta no sirve y se prueba la siguiente.
 *    Una ruta sin hijos debe consumir exactamente todos los segmentos que quedan.
 *    La ruta "" sin hijos solo encaja si no quedan segmentos.
 * 4. Los params de padres e hijos se combinan en un solo objeto.
 *
 * Reglas de la navegación:
 * 5. redirigirA: la url se reemplaza por ese valor (absoluto, ej. "/home") y se vuelve a
 *    navegar. Máximo 10 redirecciones; si se pasa, rechaza con Error("demasiadas redirecciones").
 * 6. cargarHijos(): se llama la PRIMERA vez que se necesita y el resultado se guarda (no se
 *    vuelve a llamar en navegaciones futuras). Así funciona loadChildren.
 * 7. Guards (puedeActivar): se ejecutan de la ruta padre a la hija, en orden, de uno en uno.
 *    Cada guard recibe el ContextoRuta y devuelve (o promete) true, false o un string:
 *      false  -> la navegación se cancela: { estado: "cancelada" }
 *      string -> redirección a esa url (cuenta para el límite de 10)
 *    Si un guard devuelve false, los siguientes NO se ejecutan.
 * 8. Resolvers (resolver: { clave: fn }): solo si pasaron todos los guards. Se ejecutan
 *    TODOS EN PARALELO (de todas las rutas de la cadena) y sus resultados se combinan en `datos`.
 *    Si alguno falla, la navegación termina en { estado: "error", error }.
 * 9. Resultado exitoso:
 *    { estado: "ok", url (la final, tras redirecciones), componentes (de la ruta padre a la
 *      hija, solo las que tienen componente), params, query, datos }
 * 10. Si nada encaja: { estado: "no-encontrada", url }.
 *
 * PARA PENSAR
 * -----------
 * - ¿Diferencia entre canActivate y canMatch? ¿Cuál evita descargar el chunk lazy?
 * - ¿Por qué un resolver lento empeora la experiencia? ¿Alternativas?
 * - ¿Los guards del frontend son seguridad? ¿Dónde está la seguridad real?
 */
import { ejecutar, espera, igual, ok, pendiente, rechaza } from "./_pruebas.ts";

export interface ContextoRuta {
  url: string;
  params: Record<string, string>;
  query: Record<string, string>;
}
export type ResultadoGuard = boolean | string;
export type Guard = (ctx: ContextoRuta) => ResultadoGuard | Promise<ResultadoGuard>;
export type Resolver = (ctx: ContextoRuta) => unknown | Promise<unknown>;

export interface Ruta {
  ruta: string;
  componente?: string;
  redirigirA?: string;
  hijos?: Ruta[];
  cargarHijos?: () => Promise<Ruta[]>;
  puedeActivar?: Guard[];
  resolver?: Record<string, Resolver>;
}

export type Navegacion =
  | { estado: "ok"; url: string; componentes: string[]; params: Record<string, string>; query: Record<string, string>; datos: Record<string, unknown> }
  | { estado: "cancelada" }
  | { estado: "no-encontrada"; url: string }
  | { estado: "error"; error: unknown };

// ==== TU SOLUCIÓN (inicio) ====
export class Router {
  constructor(rutas: Ruta[]) {
    pendiente();
  }

  navegar(url: string): Promise<Navegacion> {
    pendiente();
  }
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
let cargasAdmin = 0;
const sesion = { logueado: false, admin: false };
const log: string[] = [];

const RUTAS: Ruta[] = [
  { ruta: "", redirigirA: "/home" },
  { ruta: "home", componente: "Home" },
  { ruta: "login", componente: "Login" },
  {
    ruta: "users",
    componente: "UsersLayout",
    hijos: [
      { ruta: "", componente: "UsersList" },
      {
        ruta: ":id",
        componente: "UserDetail",
        resolver: {
          usuario: async ({ params }) => {
            await espera(30);
            return { id: params.id };
          },
          permisos: async () => {
            await espera(30);
            return ["leer"];
          },
        },
        hijos: [
          { ruta: "", componente: "UserResumen" },
          { ruta: "posts/:postId", componente: "Post" },
        ],
      },
    ],
  },
  {
    ruta: "admin",
    componente: "AdminLayout",
    puedeActivar: [
      (ctx) => {
        log.push("guard-login");
        return sesion.logueado || `/login?volverA=${encodeURIComponent(ctx.url)}`;
      },
      async () => {
        log.push("guard-admin");
        await espera(5);
        return sesion.admin;
      },
    ],
    cargarHijos: async () => {
      cargasAdmin++;
      await espera(10);
      return [{ ruta: "reportes", componente: "Reportes", puedeActivar: [() => (log.push("guard-reportes"), true)] }];
    },
  },
  { ruta: "roto", componente: "Roto", resolver: { x: async () => { throw new Error("falló el resolver"); } } },
  { ruta: "bucle-a", redirigirA: "/bucle-b" },
  { ruta: "bucle-b", redirigirA: "/bucle-a" },
  { ruta: "**", componente: "NoEncontrada" },
];

const SIN_COMODIN = RUTAS.filter((r) => r.ruta !== "**");

ejecutar({
  async rutas_simples_y_redireccion() {
    const r = new Router(RUTAS);
    const nav = await r.navegar("/");
    igual(nav, { estado: "ok", url: "/home", componentes: ["Home"], params: {}, query: {}, datos: {} } as Navegacion);
    const nav2 = await r.navegar("/home/?tab=1&q=caf%C3%A9");
    ok(nav2.estado === "ok");
    igual(nav2.query, { tab: "1", q: "café" });
  },
  async hijos_y_params() {
    const r = new Router(RUTAS);
    const lista = await r.navegar("/users");
    ok(lista.estado === "ok");
    igual(lista.componentes, ["UsersLayout", "UsersList"]);
    const post = await r.navegar("/users/42/posts/7");
    ok(post.estado === "ok");
    igual(post.componentes, ["UsersLayout", "UserDetail", "Post"]);
    igual(post.params, { id: "42", postId: "7" });
  },
  async resolvers_en_paralelo() {
    const r = new Router(RUTAS);
    const t = Date.now();
    const nav = await r.navegar("/users/9");
    ok(nav.estado === "ok");
    igual(nav.componentes, ["UsersLayout", "UserDetail", "UserResumen"]);
    igual(nav.datos, { usuario: { id: "9" }, permisos: ["leer"] });
    ok(Date.now() - t < 55, "los resolvers deben correr en paralelo (2 x 30 ms)");
    const roto = await r.navegar("/roto");
    ok(roto.estado === "error" && (roto.error as Error).message === "falló el resolver");
  },
  async no_encontrada_y_comodin() {
    igual(await new Router(SIN_COMODIN).navegar("/nada/aqui"), { estado: "no-encontrada", url: "/nada/aqui" } as Navegacion);
    const conComodin = await new Router(RUTAS).navegar("/nada/aqui");
    ok(conComodin.estado === "ok");
    igual(conComodin.componentes, ["NoEncontrada"]);
    const hijoInexistente = await new Router(SIN_COMODIN).navegar("/users/1/otra-cosa");
    igual(hijoInexistente.estado, "no-encontrada", "si ningún hijo encaja, la ruta padre no sirve");
  },
  async guards_redireccion_y_cancelacion() {
    const r = new Router(RUTAS);
    log.length = 0;
    sesion.logueado = false;
    const nav = await r.navegar("/admin/reportes");
    ok(nav.estado === "ok");
    igual(nav.url, "/login?volverA=%2Fadmin%2Freportes");
    igual(nav.componentes, ["Login"]);
    igual(nav.query, { volverA: "/admin/reportes" });
    igual(log, ["guard-login"], "si un guard redirige, los siguientes no se ejecutan");

    log.length = 0;
    sesion.logueado = true;
    sesion.admin = false;
    igual(await r.navegar("/admin/reportes"), { estado: "cancelada" } as Navegacion);
    igual(log, ["guard-login", "guard-admin"]);

    log.length = 0;
    sesion.admin = true;
    const ok3 = await r.navegar("/admin/reportes");
    ok(ok3.estado === "ok");
    igual(ok3.componentes, ["AdminLayout", "Reportes"]);
    igual(log, ["guard-login", "guard-admin", "guard-reportes"], "guards de padre a hijo");
  },
  async lazy_loading_una_sola_vez() {
    sesion.logueado = true;
    sesion.admin = true;
    cargasAdmin = 0;
    const r = new Router(RUTAS);
    await r.navegar("/admin/reportes");
    await r.navegar("/admin/reportes");
    igual(cargasAdmin, 1, "cargarHijos debe llamarse una sola vez por router");
  },
  async demasiadas_redirecciones() {
    const e = await rechaza(new Router(RUTAS).navegar("/bucle-a"));
    ok(/demasiadas redirecciones/.test(e.message), e.message);
  },
});
