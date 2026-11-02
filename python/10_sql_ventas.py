"""
EJERCICIO 10 — SQL: consultas de negocio con funciones de ventana y CTE
Tema: JOIN, LEFT JOIN, GROUP BY/HAVING, funciones de ventana (ROW_NUMBER, SUM OVER),
CTE recursiva, índices
Basado en: "Department Top Three Salaries" (ventanas), "Employee Management Chain"
(self-join / recursión) y optimización con planes de ejecución (reportados en EPAM)
Tiempo sugerido: 40 min

CONTEXTO
--------
Analítica de una tienda. Las tablas ya existen y se cargan con datos de ejemplo
(SQLite en memoria, no necesitas instalar nada):

    clientes(id, nombre, ciudad, referido_por)   -- referido_por: id de otro cliente o NULL
    pedidos(id, cliente_id, fecha 'YYYY-MM-DD', total)

ENUNCIADO
---------
Escribe cada consulta en su variable (un solo SELECT/WITH por variable). Las columnas
deben tener exactamente los nombres y el orden indicados.

CONSULTA_1 — Top 3 clientes por gasto total.
    Columnas: nombre, gasto_total     Orden: gasto_total DESC, nombre ASC

CONSULTA_2 — Clientes que nunca han comprado.
    Columnas: nombre                  Orden: nombre ASC

CONSULTA_3 — Ingresos por mes con acumulado del año.
    Columnas: mes ('YYYY-MM'), ingresos, acumulado      Orden: mes ASC
    acumulado = suma de ingresos desde el primer mes hasta ese mes (función de ventana).

CONSULTA_4 — El pedido más grande de cada cliente que haya comprado.
    Columnas: nombre, fecha, total    Orden: nombre ASC
    Si un cliente tiene dos pedidos con el mismo total máximo, el de fecha más antigua.

CONSULTA_5 — Por ciudad, solo ciudades con al menos 3 pedidos.
    Columnas: ciudad, clientes_con_compras, pedidos, ticket_promedio
    ticket_promedio redondeado a 2 decimales.     Orden: pedidos DESC, ciudad ASC

CONSULTA_6 — Cadena de referidos hacia arriba de 'Eva' (quién la refirió, quién refirió
    a esa persona, etc.), incluyéndola a ella con nivel 0.
    Columnas: nombre, nivel           Orden: nivel ASC

PREGUNTA ABIERTA (escribe tu respuesta en INDICE como un CREATE INDEX)
    ¿Qué índice crearías para que la CONSULTA_4 escale a millones de pedidos?
    La prueba verifica que el plan de ejecución lo use.

Ejecutar pruebas:  python python/10_sql_ventas.py
"""
import sqlite3

from _pruebas import ejecutar

CONSULTA_1 = """
-- TODO
"""

CONSULTA_2 = """
-- TODO
"""

CONSULTA_3 = """
-- TODO
"""

CONSULTA_4 = """
-- TODO
"""

CONSULTA_5 = """
-- TODO
"""

CONSULTA_6 = """
-- TODO
"""

INDICE = """
-- TODO: CREATE INDEX ...
"""


# ============================================================================
# DATOS Y PRUEBAS — no modificar
# ============================================================================
ESQUEMA = """
CREATE TABLE clientes (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    referido_por INTEGER REFERENCES clientes(id)
);
CREATE TABLE pedidos (
    id INTEGER PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    fecha TEXT NOT NULL,
    total REAL NOT NULL
);
INSERT INTO clientes VALUES
  (1, 'Ana',    'Bogotá',   NULL),
  (2, 'Beto',   'Medellín', 1),
  (3, 'Carla',  'Bogotá',   1),
  (4, 'Dario',  'Cali',     2),
  (5, 'Eva',    'Medellín', 4),
  (6, 'Fabio',  'Cali',     NULL),
  (7, 'Gloria', 'Bogotá',   3);
INSERT INTO pedidos VALUES
  (1,  1, '2026-01-05', 100.0),
  (2,  1, '2026-02-10', 250.0),
  (3,  2, '2026-01-20',  80.0),
  (4,  2, '2026-03-02',  80.0),
  (5,  3, '2026-02-14', 300.0),
  (6,  3, '2026-03-30',  50.0),
  (7,  4, '2026-03-15', 120.0),
  (8,  5, '2026-01-25',  60.0),
  (9,  5, '2026-02-28', 200.0),
  (10, 7, '2026-03-01',  20.0);
"""


def _db():
    db = sqlite3.connect(":memory:")
    db.executescript(ESQUEMA)
    return db


def _consultar(sql):
    if "TODO" in sql:
        raise NotImplementedError
    return _db().execute(sql).fetchall()


def _columnas(sql):
    cur = _db().execute(sql)
    return [d[0] for d in cur.description]


def test_consulta_1_top_clientes():
    assert _consultar(CONSULTA_1) == [("Ana", 350.0), ("Carla", 350.0), ("Eva", 260.0)], _consultar(CONSULTA_1)
    assert _columnas(CONSULTA_1) == ["nombre", "gasto_total"]


def test_consulta_2_sin_compras():
    assert _consultar(CONSULTA_2) == [("Fabio",)], _consultar(CONSULTA_2)


def test_consulta_3_acumulado():
    esperado = [("2026-01", 240.0, 240.0), ("2026-02", 750.0, 990.0), ("2026-03", 270.0, 1260.0)]
    assert _consultar(CONSULTA_3) == esperado, _consultar(CONSULTA_3)
    assert _columnas(CONSULTA_3) == ["mes", "ingresos", "acumulado"]


def test_consulta_4_pedido_maximo():
    esperado = [
        ("Ana", "2026-02-10", 250.0), ("Beto", "2026-01-20", 80.0), ("Carla", "2026-02-14", 300.0),
        ("Dario", "2026-03-15", 120.0), ("Eva", "2026-02-28", 200.0), ("Gloria", "2026-03-01", 20.0),
    ]
    assert _consultar(CONSULTA_4) == esperado, _consultar(CONSULTA_4)


def test_consulta_5_ciudades():
    esperado = [("Bogotá", 3, 5, 144.0), ("Medellín", 2, 4, 105.0)]
    assert _consultar(CONSULTA_5) == esperado, _consultar(CONSULTA_5)
    assert _columnas(CONSULTA_5) == ["ciudad", "clientes_con_compras", "pedidos", "ticket_promedio"]


def test_consulta_6_referidos():
    assert _consultar(CONSULTA_6) == [("Eva", 0), ("Dario", 1), ("Beto", 2), ("Ana", 3)], _consultar(CONSULTA_6)


def test_indice_usado_en_consulta_4():
    if "TODO" in INDICE or "TODO" in CONSULTA_4:
        raise NotImplementedError
    db = _db()
    db.execute(INDICE)
    nombre = db.execute("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'pedidos'").fetchone()
    assert nombre, "INDICE debe crear un índice sobre la tabla pedidos"
    plan = " ".join(str(fila[-1]) for fila in db.execute("EXPLAIN QUERY PLAN " + CONSULTA_4))
    assert nombre[0] in plan, f"el plan no usa tu índice {nombre[0]}: {plan}"


if __name__ == "__main__":
    ejecutar(globals())
