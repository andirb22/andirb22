/**
 * TypeScript puro (sin Angular): genéricos, tipos utilitarios, uniones discriminadas
 * y narrowing. Base de casi todas las preguntas de "TS avanzado" en entrevistas de frontend.
 *
 * Ejecutar: node 09_tipos_avanzados.mts   (Node 22.18+ elimina los tipos al ejecutar)
 * Verificar tipos: tsc --noEmit --strict --target es2022 --module nodenext 09_tipos_avanzados.mts
 */
import assert from 'node:assert/strict';

// 1) Uniones discriminadas + chequeo exhaustivo con never
type Forma =
  | { tipo: 'circulo'; radio: number }
  | { tipo: 'rectangulo'; ancho: number; alto: number }
  | { tipo: 'triangulo'; base: number; altura: number };

function area(f: Forma): number {
  switch (f.tipo) {
    case 'circulo':
      return Math.PI * f.radio ** 2; // aquí TS sabe que f tiene radio
    case 'rectangulo':
      return f.ancho * f.alto;
    case 'triangulo':
      return (f.base * f.altura) / 2;
    default: {
      const imposible: never = f; // si agregas una forma nueva y no la manejas, esto no compila
      throw new Error(`forma desconocida: ${JSON.stringify(imposible)}`);
    }
  }
}

// 2) Genéricos con restricciones
function agruparPor<T, K extends PropertyKey>(items: readonly T[], clave: (item: T) => K): Record<K, T[]> {
  const res = {} as Record<K, T[]>;
  for (const item of items) (res[clave(item)] ??= []).push(item);
  return res;
}

function elegir<T extends object, K extends keyof T>(obj: T, ...claves: K[]): Pick<T, K> {
  const res = {} as Pick<T, K>;
  for (const k of claves) res[k] = obj[k];
  return res;
}

// 3) Tipos utilitarios propios (mapped + conditional types)
type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

type Nullable<T> = { [K in keyof T]: T[K] | null };

/** Extrae el tipo que resuelve una función async. */
type ResultadoAsync<F> = F extends (...args: never[]) => Promise<infer R> ? R : never;

// 4) Type guards (predicados de tipo) para datos que vienen de afuera (API, JSON)
interface Usuario {
  id: number;
  email: string;
}

function esUsuario(x: unknown): x is Usuario {
  return (
    typeof x === 'object' && x !== null &&
    typeof (x as Record<string, unknown>).id === 'number' &&
    typeof (x as Record<string, unknown>).email === 'string'
  );
}

// 5) Result type: errores tipados sin excepciones
type Result<T, E = string> = { ok: true; valor: T } | { ok: false; error: E };

function parsearEdad(s: string): Result<number> {
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 ? { ok: true, valor: n } : { ok: false, error: `edad inválida: ${s}` };
}

// 6) satisfies: valida contra un tipo sin perder el tipo literal
const rutas = {
  inicio: '/',
  perfil: '/perfil',
} satisfies Record<string, `/${string}`>;
type NombreRuta = keyof typeof rutas; // 'inicio' | 'perfil'

// 7) Debounce tipado (genérico sobre los parámetros de la función)
function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void {
  let id: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

// --- Pruebas ---------------------------------------------------------------------
assert.equal(area({ tipo: 'rectangulo', ancho: 2, alto: 3 }), 6);
assert.equal(area({ tipo: 'triangulo', base: 4, altura: 5 }), 10);

const ventas = [
  { region: 'norte', monto: 10 },
  { region: 'sur', monto: 5 },
  { region: 'norte', monto: 7 },
];
const porRegion = agruparPor(ventas, (v) => v.region);
assert.equal(porRegion['norte']?.length, 2);
assert.deepEqual(elegir({ a: 1, b: 'x', c: true }, 'a', 'c'), { a: 1, c: true });

const config: DeepReadonly<{ db: { host: string } }> = { db: { host: 'localhost' } };
// config.db.host = 'x';  // error de compilación: es readonly
const parcial: DeepPartial<{ db: { host: string; port: number } }> = { db: { port: 5432 } };
const conNulos: Nullable<Usuario> = { id: 1, email: null };
const cargarUsuario = async (): Promise<Usuario> => ({ id: 1, email: 'a@b.com' });
const u: ResultadoAsync<typeof cargarUsuario> = await cargarUsuario();
assert.equal(config.db.host, 'localhost');
assert.equal(parcial.db?.port, 5432);
assert.equal(conNulos.email, null);
assert.equal(u.email, 'a@b.com');

const desdeApi: unknown = JSON.parse('{"id": 7, "email": "x@y.com"}');
assert.ok(esUsuario(desdeApi) && desdeApi.email === 'x@y.com');
assert.ok(!esUsuario({ id: '7' }));

const r1 = parsearEdad('30');
const r2 = parsearEdad('-1');
assert.ok(r1.ok && r1.valor === 30);
assert.ok(!r2.ok && r2.error.includes('inválida'));

const ruta: NombreRuta = 'perfil';
assert.equal(rutas[ruta], '/perfil');

const llamadas: string[] = [];
const guardar = debounce((texto: string) => llamadas.push(texto), 20);
guardar('a');
guardar('ab');
await new Promise((r) => setTimeout(r, 50));
assert.deepEqual(llamadas, ['ab']);
console.log('OK - tipos avanzados');
