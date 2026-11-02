"""
Aplanar JSON anidado a CSV con columnas en notación de punto (aparece en el listado
de ejercicios prácticos de EPAM en prepare.sh).

{"user": {"name": "Ana", "tags": ["a", "b"]}}  ->  columnas user.name, user.tags.0, user.tags.1

Decisiones a explicar: qué hacer con listas (índice en el nombre vs. JSON serializado),
claves que faltan en algunos registros (unión de columnas, celda vacía), y orden estable
de las columnas.
"""
import csv
import io
import json


def aplanar(obj, prefijo: str = "", sep: str = ".") -> dict:
    plano = {}
    if isinstance(obj, dict):
        if not obj and prefijo:
            plano[prefijo] = ""
        for k, v in obj.items():
            plano.update(aplanar(v, f"{prefijo}{sep}{k}" if prefijo else str(k), sep))
    elif isinstance(obj, list):
        if not obj and prefijo:
            plano[prefijo] = ""
        for i, v in enumerate(obj):
            plano.update(aplanar(v, f"{prefijo}{sep}{i}" if prefijo else str(i), sep))
    else:
        plano[prefijo] = obj
    return plano


def json_a_csv(registros: list[dict]) -> str:
    filas = [aplanar(r) for r in registros]
    columnas: list[str] = []
    vistas = set()
    for f in filas:  # unión de columnas conservando el orden de aparición
        for c in f:
            if c not in vistas:
                vistas.add(c)
                columnas.append(c)
    salida = io.StringIO()
    w = csv.DictWriter(salida, fieldnames=columnas, restval="", lineterminator="\n")
    w.writeheader()
    w.writerows(filas)
    return salida.getvalue()


if __name__ == "__main__":
    datos = json.loads("""[
      {"id": 1, "user": {"name": "Ana", "address": {"city": "Bogotá"}}, "tags": ["a", "b"]},
      {"id": 2, "user": {"name": "Luis, Jr."}, "active": true}
    ]""")
    assert aplanar(datos[0]) == {"id": 1, "user.name": "Ana", "user.address.city": "Bogotá", "tags.0": "a", "tags.1": "b"}
    esperado = (
        "id,user.name,user.address.city,tags.0,tags.1,active\n"
        "1,Ana,Bogotá,a,b,\n"
        '2,"Luis, Jr.",,,,True\n'  # el módulo csv escapa la coma
    )
    assert json_a_csv(datos) == esperado, json_a_csv(datos)
    print("OK - flatten JSON")
