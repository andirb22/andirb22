"""
Mini ejecutor de pruebas para los ejercicios. No hace falta modificarlo.

Cada ejercicio termina con:
    if __name__ == "__main__":
        ejecutar(globals())

y ejecuta todas las funciones que empiezan por `test_`. También funcionan con pytest:
    pytest python/01_cache_ttl.py
"""
import asyncio
import inspect
import traceback


def ejecutar(namespace: dict) -> bool:
    pruebas = [(n, f) for n, f in namespace.items() if n.startswith("test_") and callable(f)]
    ok = pendientes = fallos = 0
    for nombre, prueba in pruebas:
        try:
            resultado = prueba()
            if inspect.iscoroutine(resultado):
                asyncio.run(resultado)
        except NotImplementedError:
            pendientes += 1
            print(f"  ⏳ {nombre}: pendiente (sin implementar)")
        except AssertionError as e:
            fallos += 1
            print(f"  ❌ {nombre}: {e or 'assert falló'}")
        except Exception:
            fallos += 1
            print(f"  💥 {nombre}: excepción inesperada")
            print("     " + traceback.format_exc().strip().replace("\n", "\n     "))
        else:
            ok += 1
            print(f"  ✅ {nombre}")
    print(f"\n{ok}/{len(pruebas)} pasan · {fallos} fallan · {pendientes} pendientes")
    return ok == len(pruebas)
