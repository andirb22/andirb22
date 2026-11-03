/**
 * Mini ejecutor de pruebas para los ejercicios. No hace falta modificarlo.
 *
 * - pendiente(): úsalo (ya está puesto) en las funciones que aún no implementas.
 * - ejecutar(pruebas): corre cada prueba (pueden ser async) y muestra el resultado.
 */
class NoImplementado extends Error {
  constructor() {
    super("pendiente");
    this.name = "NoImplementado";
  }
}

function pendiente() {
  throw new NoImplementado();
}

async function ejecutar(pruebas) {
  // Con funciones sin implementar, algunas promesas de las pruebas quedan sin manejar:
  // eso no debe tumbar el proceso. Con tu solución, se avisa (suele indicar un bug).
  let huboPendientes = false;
  process.on("unhandledRejection", (razon) => {
    if (!huboPendientes) console.log(`  ⚠️  promesa rechazada sin manejar: ${razon && razon.message ? razon.message : razon}`);
  });
  let ok = 0;
  let fallos = 0;
  let pendientes = 0;
  const nombres = Object.keys(pruebas);
  for (const nombre of nombres) {
    try {
      await pruebas[nombre]();
      ok++;
      console.log(`  ✅ ${nombre}`);
    } catch (e) {
      if (e instanceof NoImplementado || (e && e.code === "ERR_ASSERTION" && e.actual instanceof NoImplementado)) {
        pendientes++;
        huboPendientes = true;
        console.log(`  ⏳ ${nombre}: pendiente (sin implementar)`);
      } else if (e && e.code === "ERR_ASSERTION") {
        fallos++;
        console.log(`  ❌ ${nombre}: ${e.generatedMessage ? e.message.split("\n")[0] : e.message}`);
        if (e.generatedMessage && "expected" in e) {
          console.log(`     esperado: ${JSON.stringify(e.expected)} · obtenido: ${JSON.stringify(e.actual)}`);
        }
      } else {
        fallos++;
        console.log(`  💥 ${nombre}: excepción inesperada`);
        console.log("     " + String(e && e.stack ? e.stack : e).split("\n").slice(0, 4).join("\n     "));
      }
    }
  }
  console.log(`\n${ok}/${nombres.length} pasan · ${fallos} fallan · ${pendientes} pendientes`);
  process.exitCode = ok === nombres.length ? 0 : 1;
}

module.exports = { ejecutar, pendiente, NoImplementado };
