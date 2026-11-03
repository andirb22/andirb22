/**
 * EJERCICIO 06 — Contenedor de inyección de dependencias jerárquico (como el de Angular)
 * Tema: árbol de injectors, proveedores (useClass/useValue/useFactory/useExisting/multi),
 * singletons por injector, resolución hacia el padre, dependencias circulares
 * Basado en: la guía EPAM ("Dependency injection: injectors tree, viewProviders,
 * @Optional/@SkipSelf, multi providers")
 * Tiempo sugerido: 50 min
 *
 * Ejecutar:  node TGI_SOLUCIONES/typescript/06_inyeccion_dependencias.ts
 *
 * ENUNCIADO
 * ---------
 * Un token es una clase o un InjectionToken<T>. Un proveedor es uno de:
 *   { provide, useValue }                          valor fijo
 *   { provide, useClass }                          new Clase(injector)
 *   { provide, useFactory }                        fabrica(injector)
 *   { provide, useExisting: otroToken }            alias: devuelve LA MISMA instancia que otroToken
 *   cualquiera de los anteriores + multi: true     ver punto 6
 *   También se puede pasar una clase sola: [Logger] equivale a { provide: Logger, useClass: Logger }.
 * Las clases reciben el injector en el constructor y piden sus dependencias con inj.get(...).
 *
 * class Injector
 *   constructor(proveedores, padre?)
 *   get(token, opciones?) — opciones: { opcional?: boolean; self?: boolean; skipSelf?: boolean }
 *   crearHijo(proveedores) -> Injector hijo
 *
 * Requisitos:
 * 1. Singleton POR INJECTOR: la primera vez que se pide un token en el injector donde está
 *    registrado se crea la instancia; las siguientes devuelven la misma.
 * 2. Si el token no está en este injector, se busca en el padre, y así hacia arriba.
 *    Un hijo que registra el mismo token lo SOBRESCRIBE para él y sus descendientes
 *    (como providers en un componente).
 * 3. Si nadie lo provee: lanza Error con el mensaje "No hay proveedor para <nombre>"
 *    (nombre de la clase, o la descripción del InjectionToken). Con { opcional: true }
 *    devuelve null.
 * 4. self: true -> solo busca en este injector. skipSelf: true -> empieza a buscar en el padre.
 * 5. Dependencias circulares (A pide B y B pide A): lanza Error que contenga
 *    "Dependencia circular: A -> B -> A" (con los nombres reales en el orden de resolución).
 *    Después del error, el injector debe seguir funcionando para otros tokens.
 * 6. multi: true -> todos los proveedores multi del mismo token en ESE injector se juntan
 *    en un array (en orden de registro). Mezclar multi y no-multi del mismo token en un
 *    injector lanza Error. (Así funcionan HTTP_INTERCEPTORS o APP_INITIALIZER.)
 * 7. Una dependencia que el hijo resuelve desde el padre se crea en el padre y queda
 *    compartida: si dos hijos piden un servicio del padre, obtienen la misma instancia.
 *
 * PARA PENSAR
 * -----------
 * - providedIn: 'root' vs providers en un componente: ¿cuántas instancias hay en cada caso?
 * - ¿Por qué un servicio con estado provisto en un componente "se reinicia" al destruirlo?
 * - ¿Qué ventaja tiene inyectar un InjectionToken<Config> en vez de importar una constante?
 */
import { ejecutar, igual, lanza, ok, pendiente } from "./_pruebas.ts";

export class InjectionToken<T> {
  readonly descripcion: string;
  declare readonly _tipo?: T; // solo para el compilador
  constructor(descripcion: string) {
    this.descripcion = descripcion;
  }
}

export type Clase<T> = new (inj: Injector) => T;
export type Token<T> = InjectionToken<T> | (abstract new (...args: any[]) => T);
export type Proveedor<T = unknown> =
  | Clase<T>
  | ({ provide: Token<T>; multi?: boolean } & (
      | { useValue: T }
      | { useClass: Clase<T> }
      | { useFactory: (inj: Injector) => T }
      | { useExisting: Token<T> }
    ));
export interface OpcionesGet {
  opcional?: boolean;
  self?: boolean;
  skipSelf?: boolean;
}

// ==== TU SOLUCIÓN (inicio) ====
export class Injector {
  constructor(proveedores: Proveedor<any>[], padre?: Injector) {
    pendiente();
  }

  get<T>(token: Token<T>, opciones?: OpcionesGet): T {
    pendiente();
  }

  crearHijo(proveedores: Proveedor<any>[]): Injector {
    pendiente();
  }
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
let creaciones: string[] = [];

class Config {
  url = "https://api.ejemplo.com";
}
class Logger {
  mensajes: string[] = [];
  constructor() {
    creaciones.push("Logger");
  }
  log(m: string) {
    this.mensajes.push(m);
  }
}
class LoggerSilencioso extends Logger {}
class ApiService {
  logger: Logger;
  config: Config;
  constructor(inj: Injector) {
    creaciones.push("ApiService");
    this.logger = inj.get(Logger);
    this.config = inj.get(Config);
  }
}
const API_URL = new InjectionToken<string>("API_URL");
const INTERCEPTORES = new InjectionToken<string[]>("INTERCEPTORES");

class A {
  constructor(inj: Injector) {
    inj.get(B);
  }
}
class B {
  constructor(inj: Injector) {
    inj.get(C);
  }
}
class C {
  constructor(inj: Injector) {
    inj.get(A);
  }
}

ejecutar({
  singleton_y_dependencias() {
    creaciones = [];
    const inj = new Injector([Logger, Config, ApiService]);
    const api = inj.get(ApiService);
    ok(api === inj.get(ApiService), "debe devolver la misma instancia");
    ok(api.logger === inj.get(Logger), "la dependencia también debe ser singleton");
    igual(api.config.url, "https://api.ejemplo.com");
    igual(creaciones, ["ApiService", "Logger"]);
  },
  use_value_factory_existing() {
    const inj = new Injector([
      { provide: API_URL, useValue: "https://x.com" },
      { provide: Config, useFactory: (i) => Object.assign(new Config(), { url: i.get(API_URL) }) },
      { provide: Logger, useClass: LoggerSilencioso },
      { provide: LoggerSilencioso, useExisting: Logger },
    ]);
    igual(inj.get(API_URL), "https://x.com");
    igual(inj.get(Config).url, "https://x.com");
    ok(inj.get(Logger) instanceof LoggerSilencioso);
    ok(inj.get(LoggerSilencioso) === inj.get(Logger), "useExisting debe devolver la misma instancia");
  },
  jerarquia_y_sobrescritura() {
    creaciones = [];
    const raiz = new Injector([Logger, Config]);
    const hijoA = raiz.crearHijo([ApiService]);
    const hijoB = raiz.crearHijo([ApiService, { provide: Logger, useClass: LoggerSilencioso }]);
    ok(hijoA.get(Logger) === raiz.get(Logger), "el hijo debe resolver desde el padre");
    ok(hijoA.get(ApiService).logger === raiz.get(Logger));
    ok(hijoB.get(ApiService).logger instanceof LoggerSilencioso, "el hijo B sobrescribe Logger");
    ok(hijoA.get(ApiService) !== hijoB.get(ApiService), "cada hijo tiene su propia instancia de ApiService");
    ok(raiz.get(Logger) === hijoA.crearHijo([]).get(Logger), "los nietos también resuelven hacia arriba");
    igual(creaciones.filter((c) => c === "Logger").length, 2);
  },
  no_encontrado_y_opcional() {
    const inj = new Injector([]);
    const e1 = lanza(() => inj.get(Logger));
    ok(/No hay proveedor para Logger/.test(e1.message), e1.message);
    const e2 = lanza(() => inj.get(API_URL));
    ok(/No hay proveedor para API_URL/.test(e2.message), e2.message);
    igual(inj.get(Logger, { opcional: true }), null);
  },
  self_y_skip_self() {
    const raiz = new Injector([{ provide: API_URL, useValue: "raiz" }]);
    const hijo = raiz.crearHijo([{ provide: API_URL, useValue: "hijo" }]);
    igual(hijo.get(API_URL), "hijo");
    igual(hijo.get(API_URL, { skipSelf: true }), "raiz");
    const vacio = raiz.crearHijo([]);
    igual(vacio.get(API_URL, { self: true, opcional: true }), null);
    lanza(() => vacio.get(API_URL, { self: true }));
    igual(raiz.get(API_URL, { skipSelf: true, opcional: true }), null);
  },
  dependencia_circular() {
    const inj = new Injector([A, B, C, Config]);
    const e = lanza(() => inj.get(A));
    ok(e.message.includes("Dependencia circular: A -> B -> C -> A"), e.message);
    ok(inj.get(Config) instanceof Config, "el injector debe seguir funcionando después del error");
    const e2 = lanza(() => inj.get(B));
    ok(e2.message.includes("Dependencia circular: B -> C -> A -> B"), e2.message);
  },
  multi_providers() {
    const raiz = new Injector([
      { provide: INTERCEPTORES, useValue: "auth" as any, multi: true },
      { provide: INTERCEPTORES, useFactory: () => "log" as any, multi: true },
    ]);
    igual(raiz.get(INTERCEPTORES), ["auth", "log"]);
    ok(raiz.get(INTERCEPTORES) === raiz.get(INTERCEPTORES), "el array también es singleton");
    const hijo = raiz.crearHijo([{ provide: INTERCEPTORES, useValue: "cache" as any, multi: true }]);
    igual(hijo.get(INTERCEPTORES), ["cache"], "el hijo define su propia lista");
    lanza(() =>
      new Injector([
        { provide: INTERCEPTORES, useValue: "a" as any, multi: true },
        { provide: INTERCEPTORES, useValue: ["b"] },
      ]).get(INTERCEPTORES),
    );
  },
});
