/**
 * EJERCICIO 05 — Buscador "typeahead" con debounce y cancelación (switchMap a mano)
 * Tema: debounce, cancelar peticiones obsoletas con AbortController, condiciones de
 * carrera, caché, manejo de errores sin "romper" el flujo
 * Basado en: la guía EPAM (RxJS: debounceTime, switchMap, catchError; "Core Web Vitals:
 * INP") — el buscador es el ejercicio práctico más típico en entrevistas de Angular
 * Tiempo sugerido: 45 min
 *
 * CONTEXTO
 * --------
 * El buscador de productos dispara una petición por tecla. Además, a veces la respuesta
 * de "pl" llega DESPUÉS que la de "plataforma" y la lista muestra resultados viejos.
 * En Angular lo resolverías con debounceTime + distinctUntilChanged + switchMap; aquí lo
 * implementas sin RxJS para entender qué hace cada operador.
 *
 * ENUNCIADO
 * ---------
 * class Buscador<R>
 *   constructor({ buscar, debounceMs = 300, minimo = 2, alCambiar })
 *     - buscar(texto, signal): Promise<R[]> — la petición real (en las pruebas, falsa).
 *       Debe respetar `signal`: si se aborta, rechaza con un error de nombre "AbortError".
 *     - alCambiar(estado): se llama cada vez que cambia el estado (ver EstadoBusqueda).
 *   escribir(texto): el usuario escribió (equivale a cada valueChanges del input).
 *   destruir(): cancela todo (timer y petición en curso); después ya no notifica nada.
 *
 * Requisitos:
 * 1. Debounce: solo se busca cuando pasan `debounceMs` sin escribir. Se usa el texto
 *    recortado (trim).
 * 2. Si el texto (recortado) tiene menos de `minimo` caracteres: cancela cualquier
 *    búsqueda en curso y notifica { tipo: "inactivo" } (sin llamar a buscar).
 * 3. distinctUntilChanged: si el texto a buscar es igual al de la última búsqueda lanzada,
 *    no se busca de nuevo ni se notifica nada.
 * 4. Al lanzar una búsqueda: notifica { tipo: "cargando", texto } y llama a buscar.
 * 5. switchMap: si empieza una búsqueda nueva, la anterior se ABORTA (signal.abort()) y su
 *    resultado, si llega igual, se IGNORA.
 * 6. Éxito: { tipo: "resultados", texto, items }. Error (que no sea abort):
 *    { tipo: "error", texto, mensaje: err.message }. Después de un error el buscador sigue
 *    funcionando con el siguiente texto.
 * 7. Caché: si ya se buscó ese texto con éxito, se responde desde caché sin llamar a
 *    buscar, notificando directamente "resultados" (sin "cargando").
 *    Ojo con el punto 3: la caché aplica a textos distintos del último buscado.
 *
 * PARA PENSAR
 * -----------
 * - ¿Qué operador de RxJS corresponde a cada requisito?
 * - switchMap vs mergeMap vs concatMap vs exhaustMap: ¿cuál usarías para un botón "Pagar"?
 * - Si el catchError estuviera FUERA del switchMap, ¿qué le pasaría al buscador tras un error?
 */
import { ejecutar, espera, igual, ok, pendiente } from "./_pruebas.ts";

export type EstadoBusqueda<R> =
  | { tipo: "inactivo" }
  | { tipo: "cargando"; texto: string }
  | { tipo: "resultados"; texto: string; items: R[] }
  | { tipo: "error"; texto: string; mensaje: string };

export interface OpcionesBuscador<R> {
  buscar: (texto: string, signal: AbortSignal) => Promise<R[]>;
  debounceMs?: number;
  minimo?: number;
  alCambiar: (estado: EstadoBusqueda<R>) => void;
}

// ==== TU SOLUCIÓN (inicio) ====
export class Buscador<R> {
  constructor(opciones: OpcionesBuscador<R>) {
    pendiente();
  }

  escribir(texto: string): void {
    pendiente();
  }

  destruir(): void {
    pendiente();
  }
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
function crearApi(demoras: Record<string, number> = {}, fallos: string[] = []) {
  const llamadas: string[] = [];
  const abortadas: string[] = [];
  const buscar = (texto: string, signal: AbortSignal) =>
    new Promise<string[]>((resolve, reject) => {
      llamadas.push(texto);
      const id = setTimeout(() => {
        if (fallos.includes(texto)) reject(new Error(`fallo buscando ${texto}`));
        else resolve([`${texto}-1`, `${texto}-2`]);
      }, demoras[texto] ?? 20);
      signal.addEventListener("abort", () => {
        clearTimeout(id);
        abortadas.push(texto);
        const e = new Error("abortada");
        e.name = "AbortError";
        reject(e);
      });
    });
  return { buscar, llamadas, abortadas };
}

function crear(api: ReturnType<typeof crearApi>, debounceMs = 30) {
  const estados: EstadoBusqueda<string>[] = [];
  const b = new Buscador<string>({ buscar: api.buscar, debounceMs, minimo: 2, alCambiar: (e) => estados.push(e) });
  return { b, estados };
}

ejecutar({
  async debounce() {
    const api = crearApi();
    const { b, estados } = crear(api);
    b.escribir("p");
    b.escribir("pl");
    b.escribir("pla ");
    await espera(15);
    igual(api.llamadas, [], "no debe buscar antes del debounce");
    await espera(60);
    igual(api.llamadas, ["pla"]);
    igual(estados, [
      { tipo: "cargando", texto: "pla" },
      { tipo: "resultados", texto: "pla", items: ["pla-1", "pla-2"] },
    ]);
    b.destruir();
  },
  async minimo_de_caracteres() {
    const api = crearApi();
    const { b, estados } = crear(api);
    b.escribir(" a ");
    await espera(50);
    igual(api.llamadas, []);
    igual(estados, [{ tipo: "inactivo" }]);
    b.destruir();
  },
  async switch_cancela_la_anterior() {
    const api = crearApi({ lento: 100, rapido: 10 });
    const { b, estados } = crear(api, 10);
    b.escribir("lento");
    await espera(30); // ya está buscando "lento"
    b.escribir("rapido");
    await espera(150);
    igual(api.abortadas, ["lento"], "la búsqueda anterior debió abortarse");
    igual(estados.at(-1), { tipo: "resultados", texto: "rapido", items: ["rapido-1", "rapido-2"] });
    ok(!estados.some((e) => e.tipo === "resultados" && e.texto === "lento"), "llegaron resultados obsoletos");
    ok(!estados.some((e) => e.tipo === "error"), "un abort no es un error para la UI");
    b.destruir();
  },
  async borrar_texto_cancela() {
    const api = crearApi({ lento: 80 });
    const { b, estados } = crear(api, 10);
    b.escribir("lento");
    await espera(25);
    b.escribir("");
    await espera(100);
    igual(api.abortadas, ["lento"]);
    igual(estados.at(-1), { tipo: "inactivo" });
    b.destruir();
  },
  async distinct_until_changed() {
    const api = crearApi();
    const { b, estados } = crear(api, 10);
    b.escribir("mesa");
    await espera(50);
    b.escribir("mesa ");
    await espera(50);
    igual(api.llamadas, ["mesa"]);
    igual(estados.length, 2, "no debe notificar de nuevo para el mismo texto");
    b.destruir();
  },
  async error_y_sigue_funcionando() {
    const api = crearApi({}, ["roto"]);
    const { b, estados } = crear(api, 10);
    b.escribir("roto");
    await espera(50);
    igual(estados.at(-1), { tipo: "error", texto: "roto", mensaje: "fallo buscando roto" });
    b.escribir("sano");
    await espera(50);
    igual(estados.at(-1), { tipo: "resultados", texto: "sano", items: ["sano-1", "sano-2"] });
    b.destruir();
  },
  async cache() {
    const api = crearApi();
    const { b, estados } = crear(api, 10);
    b.escribir("silla");
    await espera(50);
    b.escribir("mesa");
    await espera(50);
    b.escribir("silla");
    await espera(30);
    igual(api.llamadas, ["silla", "mesa"], "la segunda búsqueda de 'silla' debe salir de caché");
    igual(estados.at(-1), { tipo: "resultados", texto: "silla", items: ["silla-1", "silla-2"] });
    igual(estados.at(-2), { tipo: "resultados", texto: "mesa", items: ["mesa-1", "mesa-2"] }, "desde caché no se notifica 'cargando'");
    b.destruir();
  },
  async destruir() {
    const api = crearApi({ x1: 60 });
    const { b, estados } = crear(api, 10);
    b.escribir("x1");
    await espera(25);
    b.destruir();
    b.escribir("otra");
    await espera(100);
    igual(api.abortadas, ["x1"]);
    igual(estados, [{ tipo: "cargando", texto: "x1" }], "después de destruir no debe notificar nada");
  },
});
