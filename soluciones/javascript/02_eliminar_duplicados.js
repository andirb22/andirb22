/**
 * Eliminar números repetidos de un arreglo (reportado en EPAM como live coding).
 * Aclara primero qué significa "eliminar repetidos":
 *  a) dejar una copia de cada valor        [1,2,2,3] -> [1,2,3]
 *  b) quitar TODOS los que se repiten       [1,2,2,3] -> [1,3]
 * Ejecutar: node 02_eliminar_duplicados.js
 */
const assert = require("node:assert/strict");

// a) Una copia de cada uno, conservando el orden. Set -> O(n)
const unicos = (arr) => [...new Set(arr)];

// a) Sin Set (por si lo prohíben): filter + indexOf es O(n^2); con un objeto/Map es O(n)
const unicosSinSet = (arr) => {
  const vistos = new Map();
  return arr.filter((x) => (vistos.has(x) ? false : vistos.set(x, true)));
};

// b) Solo los que aparecen exactamente una vez
const soloNoRepetidos = (arr) => {
  const conteo = arr.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map());
  return arr.filter((x) => conteo.get(x) === 1);
};

// c) Arreglo ORDENADO, in-place, O(1) memoria (dos punteros). Devuelve la nueva longitud.
function eliminarEnOrdenado(nums) {
  if (nums.length === 0) return 0;
  let k = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[k - 1]) nums[k++] = nums[i];
  }
  nums.length = k;
  return k;
}

// d) Objetos repetidos por una clave
const unicosPor = (arr, key) => [...new Map(arr.map((o) => [o[key], o])).values()];
// Ojo: esto conserva el ÚLTIMO de cada clave. Para el primero:
const unicosPorPrimero = (arr, key) => {
  const vistos = new Set();
  return arr.filter((o) => !vistos.has(o[key]) && vistos.add(o[key]));
};

assert.deepEqual(unicos([3, 1, 3, 2, 1]), [3, 1, 2]);
assert.deepEqual(unicosSinSet([3, 1, 3, 2, 1]), [3, 1, 2]);
assert.deepEqual(unicos([NaN, NaN, 0, -0]), [NaN, 0]); // Set usa SameValueZero
assert.deepEqual(soloNoRepetidos([1, 2, 2, 3, 4, 4]), [1, 3]);
const ord = [0, 0, 1, 1, 1, 2, 3, 3];
assert.equal(eliminarEnOrdenado(ord), 4);
assert.deepEqual(ord, [0, 1, 2, 3]);
const users = [{ id: 1, n: "a" }, { id: 2, n: "b" }, { id: 1, n: "c" }];
assert.deepEqual(unicosPor(users, "id").map((u) => u.n), ["c", "b"]);
assert.deepEqual(unicosPorPrimero(users, "id").map((u) => u.n), ["a", "b"]);
console.log("OK - eliminar duplicados");
