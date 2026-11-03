"""
EJERCICIO 09 — Servicio de pedidos: validación, idempotencia, paginación y estados
Tema: diseño de APIs REST (idempotencia, paginación), capas servicio/repositorio,
inyección de dependencias
Basado en: "explica idempotencia con ejemplos", "diseña paginación para una API pública"
(preguntas de la guía EPAM) y "DI en Flask + SQLAlchemy" (LeetCode Discuss)
Tiempo sugerido: 40 min

CONTEXTO
--------
Estás construyendo la lógica de negocio de `POST /orders` y `GET /orders` de una tienda.
El cliente móvil reintenta automáticamente cuando hay timeouts, y eso está creando
pedidos DUPLICADOS. Además, el listado devuelve miles de pedidos de una sola vez.

No hay framework: escribes la capa de SERVICIO, que luego llamaría un endpoint de
FastAPI/Flask. El repositorio en memoria ya está hecho (no lo modifiques); tu servicio
lo recibe por constructor (inyección de dependencias).

ENUNCIADO
---------
Implementa `ServicioPedidos(repositorio)` con:

1. crear(payload: dict, clave_idempotencia: str | None = None) -> dict
   payload esperado: {"cliente": "Ana", "items": [{"sku": "A1", "cantidad": 2, "precio": 10.5}, ...]}

   Validación -> si hay errores, lanza ErrorValidacion(errores) con un dict campo -> mensaje
   (reporta TODOS los errores, no solo el primero):
     - "cliente": obligatorio, string no vacío (ignorando espacios).
     - "items": lista no vacía.
     - "items[i].cantidad": entero > 0.
     - "items[i].precio": número >= 0 (int o float, no bool).
     - "items[i].sku": string no vacío.
   Las claves de error deben ser exactamente así, por ejemplo "items[1].cantidad".

   Si es válido, guarda en el repositorio y devuelve el pedido:
     {"id": <del repo>, "cliente": "Ana", "items": [...], "total": 21.0, "estado": "pendiente"}
   total = suma de cantidad * precio, redondeado a 2 decimales.

   Idempotencia:
     - Misma clave + mismo payload -> devuelve EL MISMO pedido, sin crear otro.
     - Misma clave + payload distinto -> lanza ErrorConflicto.
     - Sin clave -> siempre crea uno nuevo.

2. listar(pagina=1, tamano=10, estado=None) -> dict
     {"items": [...], "pagina": 1, "tamano": 10, "total": 23, "paginas": 3}
   - Ordenado por id ascendente; `estado` filtra si se indica.
   - pagina >= 1 y 1 <= tamano <= 100; si no, ErrorValidacion.
   - Una página fuera de rango devuelve items = [] (no es error).
   - "paginas" = 0 si no hay resultados.

3. cambiar_estado(id_pedido, nuevo_estado) -> dict  (devuelve el pedido actualizado)
   Transiciones permitidas:
       pendiente -> pagado | cancelado
       pagado    -> enviado | cancelado
       enviado y cancelado son finales.
   - Pedido inexistente -> ErrorNoEncontrado.
   - Transición no permitida -> ErrorTransicion.

PARA PENSAR
-----------
- ¿Qué métodos HTTP son idempotentes por definición? ¿Por qué POST no lo es?
- ¿Dónde guardarías las claves de idempotencia en producción y cuánto tiempo?
- Paginación por offset vs por cursor (keyset): ¿qué problema tiene el offset cuando se
  insertan pedidos mientras alguien pagina? ¿Y con tablas de millones de filas?
- ¿Qué código HTTP devolverías para cada excepción? (400/422, 404, 409)

Ejecutar pruebas:  python TGI_SOLUCIONES/python/09_servicio_pedidos.py
"""
import copy

from _pruebas import ejecutar


class ErrorValidacion(Exception):
    def __init__(self, errores: dict):
        super().__init__(errores)
        self.errores = errores


class ErrorConflicto(Exception):
    pass


class ErrorNoEncontrado(Exception):
    pass


class ErrorTransicion(Exception):
    pass


class RepositorioMemoria:
    """Repositorio ya hecho. NO modificar. Simula la base de datos."""

    def __init__(self):
        self._datos: dict[int, dict] = {}
        self._siguiente_id = 1
        self.inserciones = 0

    def insertar(self, pedido: dict) -> dict:
        pedido = copy.deepcopy(pedido)
        pedido["id"] = self._siguiente_id
        self._siguiente_id += 1
        self._datos[pedido["id"]] = pedido
        self.inserciones += 1
        return copy.deepcopy(pedido)

    def obtener(self, id_pedido: int) -> dict | None:
        p = self._datos.get(id_pedido)
        return copy.deepcopy(p) if p else None

    def actualizar(self, pedido: dict) -> dict:
        self._datos[pedido["id"]] = copy.deepcopy(pedido)
        return copy.deepcopy(pedido)

    def todos(self) -> list[dict]:
        return [copy.deepcopy(p) for p in self._datos.values()]


class ServicioPedidos:
    def __init__(self, repositorio: RepositorioMemoria):
        # TODO: tu solución aquí
        raise NotImplementedError

    def crear(self, payload: dict, clave_idempotencia: str | None = None) -> dict:
        raise NotImplementedError

    def listar(self, pagina: int = 1, tamano: int = 10, estado: str | None = None) -> dict:
        raise NotImplementedError

    def cambiar_estado(self, id_pedido: int, nuevo_estado: str) -> dict:
        raise NotImplementedError


# ============================================================================
# PRUEBAS — no modificar
# ============================================================================
_OK = {"cliente": "Ana", "items": [{"sku": "A1", "cantidad": 2, "precio": 10.5}, {"sku": "B2", "cantidad": 1, "precio": 0.1}]}


def _servicio():
    repo = RepositorioMemoria()
    return ServicioPedidos(repo), repo


def test_crear_pedido():
    s, repo = _servicio()
    p = s.crear(copy.deepcopy(_OK))
    assert p == {"id": 1, "cliente": "Ana", "items": _OK["items"], "total": 21.1, "estado": "pendiente"}, p
    assert repo.inserciones == 1


def test_validacion_reporta_todos_los_errores():
    s, repo = _servicio()
    malo = {"cliente": "   ", "items": [
        {"sku": "A", "cantidad": 1, "precio": 5},
        {"sku": "", "cantidad": 0, "precio": -1},
        {"sku": "C", "cantidad": 1.5, "precio": True},
    ]}
    try:
        s.crear(malo)
        raise AssertionError("debió lanzar ErrorValidacion")
    except ErrorValidacion as e:
        assert set(e.errores) == {
            "cliente", "items[1].sku", "items[1].cantidad", "items[1].precio",
            "items[2].cantidad", "items[2].precio",
        }, set(e.errores)
    assert repo.inserciones == 0


def test_validacion_items_y_payload_vacio():
    s, _ = _servicio()
    for payload, campos in (({}, {"cliente", "items"}), ({"cliente": "Ana", "items": []}, {"items"}),
                            ({"cliente": 5, "items": "x"}, {"cliente", "items"})):
        try:
            s.crear(payload)
            raise AssertionError(f"{payload} debió fallar")
        except ErrorValidacion as e:
            assert set(e.errores) == campos, f"{payload}: {set(e.errores)}"


def test_idempotencia():
    s, repo = _servicio()
    p1 = s.crear(copy.deepcopy(_OK), clave_idempotencia="abc")
    p2 = s.crear(copy.deepcopy(_OK), clave_idempotencia="abc")  # reintento del cliente
    assert p1 == p2 and repo.inserciones == 1, "el reintento creó un pedido duplicado"
    otro = copy.deepcopy(_OK)
    otro["cliente"] = "Luis"
    try:
        s.crear(otro, clave_idempotencia="abc")
        raise AssertionError("misma clave con otro payload debió lanzar ErrorConflicto")
    except ErrorConflicto:
        pass
    s.crear(copy.deepcopy(_OK))
    s.crear(copy.deepcopy(_OK))
    assert repo.inserciones == 3, "sin clave debe crear siempre"


def test_paginacion():
    s, _ = _servicio()
    for i in range(23):
        s.crear({"cliente": f"c{i}", "items": [{"sku": "X", "cantidad": 1, "precio": 1}]})
    r = s.listar(pagina=3, tamano=10)
    assert [p["id"] for p in r["items"]] == [21, 22, 23]
    assert {k: r[k] for k in ("pagina", "tamano", "total", "paginas")} == {"pagina": 3, "tamano": 10, "total": 23, "paginas": 3}
    assert s.listar(pagina=9)["items"] == []
    for args in ({"pagina": 0}, {"tamano": 0}, {"tamano": 101}):
        try:
            s.listar(**args)
            raise AssertionError(f"listar({args}) debió lanzar ErrorValidacion")
        except ErrorValidacion:
            pass


def test_listar_vacio_y_filtro_por_estado():
    s, _ = _servicio()
    assert s.listar() == {"items": [], "pagina": 1, "tamano": 10, "total": 0, "paginas": 0}
    for _ in range(3):
        s.crear(copy.deepcopy(_OK))
    s.cambiar_estado(2, "pagado")
    r = s.listar(estado="pagado")
    assert [p["id"] for p in r["items"]] == [2] and r["total"] == 1


def test_maquina_de_estados():
    s, _ = _servicio()
    s.crear(copy.deepcopy(_OK))
    assert s.cambiar_estado(1, "pagado")["estado"] == "pagado"
    assert s.cambiar_estado(1, "enviado")["estado"] == "enviado"
    for invalido in ("cancelado", "pendiente", "pagado"):
        try:
            s.cambiar_estado(1, invalido)
            raise AssertionError(f"enviado -> {invalido} no debería permitirse")
        except ErrorTransicion:
            pass
    s.crear(copy.deepcopy(_OK))
    try:
        s.cambiar_estado(2, "enviado")
        raise AssertionError("pendiente -> enviado no debería permitirse")
    except ErrorTransicion:
        pass
    assert s.cambiar_estado(2, "cancelado")["estado"] == "cancelado"
    try:
        s.cambiar_estado(99, "pagado")
        raise AssertionError("debió lanzar ErrorNoEncontrado")
    except ErrorNoEncontrado:
        pass


if __name__ == "__main__":
    ejecutar(globals())
