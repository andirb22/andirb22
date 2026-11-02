"""
Manejo de excepciones (reportado en EPAM: "¿por qué importa el orden de los except?",
"¿qué pasa al hacer raise ... from ...?" con fragmentos de código para predecir).

Reglas clave:
- Los `except` se evalúan en orden y gana el PRIMERO que coincida (isinstance).
  Por eso las subclases van antes que las clases base; si no, el except específico
  nunca se alcanza.
- `raise Nueva() from original` -> encadenamiento EXPLÍCITO: guarda original en __cause__.
  El traceback dice "The above exception was the direct cause of the following exception".
- Lanzar dentro de un except SIN from -> encadenamiento IMPLÍCITO: __context__.
  Traceback: "During handling of the above exception, another exception occurred".
- `raise X from None` -> oculta el contexto (__suppress_context__ = True).
- `else` corre si no hubo excepción; `finally` corre SIEMPRE (y un return en finally
  se traga la excepción: antipatrón).
"""


class AppError(Exception):
    """Excepción base de la aplicación."""


class NotFoundError(AppError):
    pass


class RepositorioError(AppError):
    pass


# 1) Orden de los except
def clasificar(exc):
    try:
        raise exc
    except NotFoundError:  # específica primero
        return "not-found"
    except AppError:  # luego la base
        return "app"
    except Exception:
        return "otra"


def clasificar_mal(exc):
    try:
        raise exc
    except AppError:  # la base atrapa también NotFoundError...
        return "app"
    except NotFoundError:  # ...así que esto es código muerto
        return "not-found"


# 2) raise from: traducir una excepción de bajo nivel a una de dominio
def obtener_usuario(db: dict, user_id: int):
    try:
        return db[user_id]
    except KeyError as e:
        raise NotFoundError(f"usuario {user_id} no existe") from e


# 3) Encadenamiento implícito (bug típico dentro de un except)
def implicito():
    try:
        1 / 0
    except ZeroDivisionError:
        raise RepositorioError("falló al guardar")  # sin from -> __context__


# 4) Ocultar el contexto
def oculto():
    try:
        int("abc")
    except ValueError:
        raise AppError("entrada inválida") from None


# 5) else / finally, y el antipatrón return en finally
def flujo(fallar: bool):
    pasos = []
    try:
        pasos.append("try")
        if fallar:
            raise ValueError
    except ValueError:
        pasos.append("except")
    else:
        pasos.append("else")
    finally:
        pasos.append("finally")
    return pasos


def finally_traga_excepcion():
    try:
        raise RuntimeError("se pierde")
    finally:
        return "silenciada"  # noqa: B012 - NO hacer esto


# 6) Agrupar varias excepciones (Python 3.11+): ExceptionGroup / except*
def multiples_errores():
    errores = [ValueError("a"), TypeError("b"), ValueError("c")]
    raise ExceptionGroup("validación", errores)


if __name__ == "__main__":
    assert clasificar(NotFoundError()) == "not-found"
    assert clasificar(AppError()) == "app"
    assert clasificar(KeyError()) == "otra"
    assert clasificar_mal(NotFoundError()) == "app"  # el except específico nunca se alcanza

    try:
        obtener_usuario({}, 7)
    except NotFoundError as e:
        assert isinstance(e.__cause__, KeyError)

    try:
        implicito()
    except RepositorioError as e:
        assert e.__cause__ is None and isinstance(e.__context__, ZeroDivisionError)

    try:
        oculto()
    except AppError as e:
        assert e.__suppress_context__ is True and e.__cause__ is None

    assert flujo(False) == ["try", "else", "finally"]
    assert flujo(True) == ["try", "except", "finally"]
    assert finally_traga_excepcion() == "silenciada"

    vistos = []
    try:
        multiples_errores()
    except* ValueError as grupo:
        vistos.append(len(grupo.exceptions))
    except* TypeError as grupo:
        vistos.append(len(grupo.exceptions))
    assert vistos == [2, 1]
    print("OK - excepciones")
