"""
Herencia múltiple y MRO (reportado en EPAM: "si dos clases padre definen el mismo
método, ¿cuál se ejecuta? Predice la salida").

Reglas:
- Python usa la linealización C3 para calcular el MRO (Method Resolution Order).
- Se busca de izquierda a derecha en la lista de bases, y una clase siempre aparece
  ANTES que sus padres. Se ve con Clase.__mro__ o Clase.mro().
- super() NO llama "al padre": llama a la SIGUIENTE clase en el MRO de la instancia.
  Por eso con super() cooperativo cada método del diamante se ejecuta una sola vez.
"""


# Caso 1: sin super(): gana la primera base de la izquierda
class A:
    def hola(self):
        return "A"


class B(A):
    def hola(self):
        return "B"


class C(A):
    def hola(self):
        return "C"


class D(B, C):
    pass


# D.__mro__ = (D, B, C, A, object)  ->  D().hola() == "B"


# Caso 2: diamante con super() cooperativo
log = []


class Base:
    def __init__(self):
        log.append("Base")


class Izq(Base):
    def __init__(self):
        log.append("Izq-inicio")
        super().__init__()  # siguiente en el MRO de la INSTANCIA, no necesariamente Base
        log.append("Izq-fin")


class Der(Base):
    def __init__(self):
        log.append("Der-inicio")
        super().__init__()
        log.append("Der-fin")


class Hijo(Izq, Der):
    def __init__(self):
        log.append("Hijo-inicio")
        super().__init__()
        log.append("Hijo-fin")


# Caso 3: MRO imposible -> TypeError al definir la clase
def mro_inconsistente():
    class X: ...

    class Y(X): ...

    # X debe ir antes que Y (por el orden de bases) pero Y es hija de X -> conflicto
    class Z(X, Y): ...  # noqa


# Caso 4: mixins (uso real de la herencia múltiple)
class JsonMixin:
    def to_json(self):
        import json

        return json.dumps(self.__dict__)


class Usuario(JsonMixin):
    def __init__(self, nombre):
        self.nombre = nombre


if __name__ == "__main__":
    assert D().hola() == "B"
    assert [k.__name__ for k in D.__mro__] == ["D", "B", "C", "A", "object"]

    Hijo()
    # Base se ejecuta UNA vez, y Der corre "dentro" de Izq porque es el siguiente en el MRO
    assert log == ["Hijo-inicio", "Izq-inicio", "Der-inicio", "Base", "Der-fin", "Izq-fin", "Hijo-fin"]
    assert [k.__name__ for k in Hijo.__mro__] == ["Hijo", "Izq", "Der", "Base", "object"]

    try:
        mro_inconsistente()
        raise AssertionError("debió fallar")
    except TypeError as e:
        assert "MRO" in str(e)

    assert Usuario("ana").to_json() == '{"nombre": "ana"}'
    print("OK - MRO")
