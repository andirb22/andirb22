"""
Ejecuta y verifica las consultas de soluciones/sql/consultas.sql con SQLite en memoria
(SQLite soporta funciones de ventana y CTE recursivas).

Cada consulta del .sql va precedida de un comentario `-- @nombre`.
"""
import sqlite3
from pathlib import Path

SQL_PATH = Path(__file__).resolve().parent.parent / "sql" / "consultas.sql"

DATOS = """
INSERT INTO department VALUES (1, 'IT'), (2, 'Sales');
INSERT INTO employee VALUES
  (1, 'Ana',   90000, 1, NULL),
  (2, 'Beto',  85000, 1, 1),
  (3, 'Carla', 85000, 1, 1),
  (4, 'Dario', 70000, 1, 2),
  (5, 'Eva',   60000, 1, 4),
  (6, 'Fer',   50000, 1, 4),
  (7, 'Gabi',  80000, 2, NULL),
  (8, 'Hugo',  95000, 2, 7);
"""


def cargar(sql: str):
    """Separa el archivo en sentencias; devuelve (sentencias_sin_nombre, {nombre: consulta})."""
    sin_nombre, con_nombre = [], {}
    nombre, buffer = None, []
    for linea in sql.splitlines():
        s = linea.strip()
        if s.startswith("-- @"):
            nombre = s[4:].strip()
            continue
        if s.startswith("--") or not s:
            continue
        buffer.append(linea)
        if s.endswith(";"):
            sentencia = "\n".join(buffer)
            if nombre:
                con_nombre[nombre] = sentencia
            else:
                sin_nombre.append(sentencia)
            nombre, buffer = None, []
    return sin_nombre, con_nombre


if __name__ == "__main__":
    sentencias, consultas = cargar(SQL_PATH.read_text(encoding="utf-8"))
    db = sqlite3.connect(":memory:")
    for s in sentencias:  # CREATE TABLE / CREATE INDEX
        db.execute(s)
    db.executescript(DATOS)

    q = lambda nombre: db.execute(consultas[nombre]).fetchall()  # noqa: E731

    assert q("top3") == [
        ("IT", "Ana", 90000), ("IT", "Beto", 85000), ("IT", "Carla", 85000), ("IT", "Dario", 70000),
        ("Sales", "Hugo", 95000), ("Sales", "Gabi", 80000),
    ], q("top3")
    assert q("second") == [(90000,)]
    assert q("more_than_manager") == [("Hugo",)]
    assert q("chain") == [("Eva", 0), ("Dario", 1), ("Beto", 2), ("Ana", 3)]
    assert dict((n, avg) for n, _, avg in q("vs_avg"))["Ana"] == 73333.3

    plan = db.execute("EXPLAIN QUERY PLAN " + consultas["top3"]).fetchall()
    print("Plan de top3:", [fila[-1] for fila in plan])
    print("OK - SQL")
