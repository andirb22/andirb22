/**
 * EJERCICIO 09 — Strings y expresiones regulares
 * Tema: manipulación de strings, pilas, regex, algoritmos con dígitos
 * Basado en: reto de preselección de EPAM en JavaScript (Magic Latin, paréntesis válidos,
 * regex de divisibilidad en binario, next bigger number) — repositorio público de un candidato
 * Tiempo sugerido: 10-15 min por función
 *
 * ENUNCIADO
 * ---------
 * A) pigLatin(frase)
 *    Transforma cada palabra (secuencia de letras a-z / A-Z); el resto (espacios,
 *    puntuación, números) queda igual y en su lugar.
 *    - Si empieza con vocal (a e i o u): palabra + "way".          "apple" -> "appleway"
 *    - Si no: mueve TODAS las consonantes iniciales al final + "ay". "string" -> "ingstray"
 *    - Si la palabra original empezaba con mayúscula, el resultado empieza con mayúscula
 *      y el resto en minúscula.                                      "Hello" -> "Ellohay"
 *    pigLatin("Hello, world!") -> "Ellohay, orldway!"
 *
 * B) posicionError(s)
 *    Revisa los delimitadores (), [], {}. Devuelve -1 si todo está bien. Si no, el índice
 *    del primer error:
 *    - un cierre sin apertura, o que no corresponde con la última apertura -> su índice.
 *    - si al final quedan aperturas sin cerrar -> el índice de la PRIMERA sin cerrar.
 *    posicionError("f(a[1)]") -> 5    posicionError("{ (x) ") -> 0    posicionError("a)") -> 1
 *
 * C) MULTIPLO_DE_3
 *    Una expresión regular (constante RegExp) que acepte strings binarios no vacíos
 *    ("0", "110", "0011"...) cuyo valor sea múltiplo de 3, y rechace todo lo demás
 *    (incluido "" y cualquier carácter que no sea 0 o 1).
 *    Pista: dibuja el autómata de restos módulo 3. Leer un bit b: resto -> (2*resto + b) % 3.
 *
 * D) siguienteMayor(n)
 *    El siguiente número mayor que n con los mismos dígitos, o -1.
 *    2017 -> 2071, 531 -> -1. En O(d); no generes todas las permutaciones.
 *
 * E) formatearMiles(n, decimales = 2)
 *    Formatea con separador de miles "," y punto decimal, redondeando a `decimales`.
 *    PROHIBIDO usar toLocaleString o Intl.
 *    formatearMiles(1234567.891) -> "1,234,567.89"    formatearMiles(-1000, 0) -> "-1,000"
 *    Para el redondeo puedes usar toFixed (las pruebas esperan su mismo comportamiento,
 *    incluido que (-0.004).toFixed(2) es "-0.00"). Bonus: hazlo con una regex.
 *
 * Ejecutar pruebas:  node TGI_SOLUCIONES/javascript/09_strings_y_regex.js
 */
const assert = require("node:assert/strict");
const { ejecutar, pendiente } = require("./_pruebas");

// ==== TU SOLUCIÓN (inicio) ====
function pigLatin(frase) {
  pendiente();
}

function posicionError(s) {
  pendiente();
}

const MULTIPLO_DE_3 = null; // reemplaza por tu RegExp, ej: /^...$/

function siguienteMayor(n) {
  pendiente();
}

function formatearMiles(n, decimales = 2) {
  pendiente();
}
// ==== TU SOLUCIÓN (fin) ====

// ============================================================================
// PRUEBAS — no modificar
// ============================================================================
ejecutar({
  a_pig_latin() {
    assert.equal(pigLatin("apple"), "appleway");
    assert.equal(pigLatin("string"), "ingstray");
    assert.equal(pigLatin("Hello, world!"), "Ellohay, orldway!");
    assert.equal(pigLatin("Ana come 3 Tacos."), "Anaway omecay 3 Acostay.");
    assert.equal(pigLatin(""), "");
  },
  b_posicion_error() {
    const casos = { "f(a[1)]": 5, "{ (x) ": 0, "a)": 1, "": -1, "({[]})": -1, "(()": 0, "()[": 2, "{[}]": 2, "x(y)z": -1 };
    for (const [s, esperado] of Object.entries(casos)) {
      assert.equal(posicionError(s), esperado, `posicionError(${JSON.stringify(s)})`);
    }
  },
  c_regex_multiplo_de_3() {
    if (MULTIPLO_DE_3 === null) pendiente();
    assert.ok(MULTIPLO_DE_3 instanceof RegExp, "MULTIPLO_DE_3 debe ser una RegExp");
    for (let n = 0; n <= 3000; n++) {
      const b = n.toString(2);
      assert.equal(MULTIPLO_DE_3.test(b), n % 3 === 0, `${b} (${n})`);
      assert.equal(MULTIPLO_DE_3.test("00" + b), n % 3 === 0, `00${b} (${n})`);
    }
    for (const malo of ["", "12", "11a", " 11", "0b11"]) {
      assert.equal(MULTIPLO_DE_3.test(malo), false, `debió rechazar ${JSON.stringify(malo)}`);
    }
  },
  d_siguiente_mayor() {
    const casos = { 12: 21, 2017: 2071, 513: 531, 414: 441, 531: -1, 9: -1, 111: -1, 1234: 1243 };
    for (const [n, esperado] of Object.entries(casos)) {
      assert.equal(siguienteMayor(Number(n)), esperado, `siguienteMayor(${n})`);
    }
  },
  e_formatear_miles() {
    assert.ok(!/toLocaleString|Intl\./.test(formatearMiles.toString()), "no se permite toLocaleString ni Intl");
    assert.equal(formatearMiles(1234567.891), "1,234,567.89");
    assert.equal(formatearMiles(-1000, 0), "-1,000");
    assert.equal(formatearMiles(999), "999.00");
    assert.equal(formatearMiles(0), "0.00");
    assert.equal(formatearMiles(1000000), "1,000,000.00");
    assert.equal(formatearMiles(-0.004), "-0.00");
    assert.equal(formatearMiles(12345.6789, 3), "12,345.679");
  },
});
