/**
 * Reto de preselección de EPAM en JavaScript (repositorio público de un candidato):
 * 1. Magic Latin      2. Paréntesis válidos
 * 3. Regex: binario divisible por 5      4. Siguiente número mayor con los mismos dígitos
 * Ejecutar: node 07_reto_preseleccion.js
 */
const assert = require("node:assert/strict");

// 1) Mueve la primera letra de cada palabra al final y añade "ay". La puntuación no cambia.
const magicLatin = (frase) =>
  frase.replace(/[a-z]+/gi, (w) => w.slice(1) + w[0] + "ay");

// 2) Paréntesis válidos con pila. O(n)
function parentesisValidos(s) {
  const pares = { ")": "(", "]": "[", "}": "{" };
  const pila = [];
  for (const ch of s) {
    if ("([{".includes(ch)) pila.push(ch);
    else if (ch in pares && pila.pop() !== pares[ch]) return false;
  }
  return pila.length === 0;
}

// 3) Regex que acepta binarios divisibles por 5.
// Se obtiene del autómata de restos módulo 5 (estados 0..4; leer un bit b: r -> (2r + b) % 5)
// eliminando estados hasta dejar una expresión regular. El estado 0 es inicial y final.
const divisiblePor5 = /^(0|1(10)*(0|11)(01*01|01*00(10)*(0|11))*1)+$/;

// 4) Next permutation. O(d)
function nextBigger(n) {
  const d = String(n).split("");
  let i = d.length - 2;
  while (i >= 0 && d[i] >= d[i + 1]) i--; // pivote: primer dígito que baja, desde la derecha
  if (i < 0) return -1;
  let j = d.length - 1;
  while (d[j] <= d[i]) j--; // menor dígito mayor que el pivote, a su derecha
  [d[i], d[j]] = [d[j], d[i]];
  const resto = d.splice(i + 1).reverse(); // la cola estaba en orden descendente
  return Number(d.concat(resto).join(""));
}

assert.equal(magicLatin("Hello world !"), "elloHay orldway !");
assert.equal(magicLatin("Pig latin is cool"), "igPay atinlay siay oolcay");

assert.equal(parentesisValidos("()"), true);
assert.equal(parentesisValidos("(())((()())())"), true);
assert.equal(parentesisValidos(")(())("), false);
assert.equal(parentesisValidos("(]"), false);

for (let n = 0; n <= 2000; n++) {
  const bin = n.toString(2);
  assert.equal(divisiblePor5.test(bin), n % 5 === 0, `falló con ${n} (${bin})`);
  assert.equal(divisiblePor5.test("000" + bin), n % 5 === 0); // con ceros a la izquierda
}
assert.equal(divisiblePor5.test("101"), true); // 5
assert.equal(divisiblePor5.test("0000001010011010"), false); // 666

assert.equal(nextBigger(12), 21);
assert.equal(nextBigger(513), 531);
assert.equal(nextBigger(2017), 2071);
assert.equal(nextBigger(414), 441);
assert.equal(nextBigger(531), -1);
assert.equal(nextBigger(9), -1);
console.log("OK - reto de preselección");
