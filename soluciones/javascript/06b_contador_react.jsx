/**
 * Versión React del contador con setInterval/clearInterval (así lo pidieron en EPAM).
 * Archivo de referencia (no se ejecuta con node directamente).
 *
 * Claves:
 * - La función de limpieza de useEffect hace clearInterval: se ejecuta al desmontar
 *   el componente y antes de volver a correr el efecto.
 * - setCount(c => c + paso) (actualización funcional) evita la "closure obsoleta":
 *   con setCount(count + 1) el intervalo vería siempre el count del primer render.
 * - El intervalo depende de `corriendo` y `direccion`; NO de count.
 */
import { useEffect, useState } from "react";

export function Contador({ paso = 1, intervaloMs = 1000 }) {
  const [count, setCount] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [direccion, setDireccion] = useState(1);

  useEffect(() => {
    if (!corriendo) return undefined;
    const id = setInterval(() => setCount((c) => c + direccion * paso), intervaloMs);
    return () => clearInterval(id); // limpieza
  }, [corriendo, direccion, paso, intervaloMs]);

  return (
    <div>
      <output aria-live="polite">{count}</output>
      <button onClick={() => setCount((c) => c + paso)}>+</button>
      <button onClick={() => setCount((c) => c - paso)}>-</button>
      <button onClick={() => { setDireccion(1); setCorriendo(true); }}>Auto +</button>
      <button onClick={() => { setDireccion(-1); setCorriendo(true); }}>Auto -</button>
      <button onClick={() => setCorriendo(false)}>Detener</button>
      <button onClick={() => { setCorriendo(false); setCount(0); }}>Reiniciar</button>
    </div>
  );
}
