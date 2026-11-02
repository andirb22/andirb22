-- SQL reportado en EPAM: funciones de ventana (top N por grupo), self-joins / cadena
-- de mando con CTE recursiva, y optimización con planes de ejecución.
-- Probado con SQLite (ver soluciones/python/17_sql.py); la sintaxis también es válida en PostgreSQL.

-- Esquema de ejemplo
CREATE TABLE department (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE employee (
    id            INTEGER PRIMARY KEY,
    name          TEXT NOT NULL,
    salary        INTEGER NOT NULL,
    department_id INTEGER REFERENCES department(id),
    manager_id    INTEGER REFERENCES employee(id)
);

-- 1) Top 3 salarios DISTINTOS por departamento (LeetCode "Department Top Three Salaries").
--    DENSE_RANK: empates comparten puesto y no dejan huecos (1,1,2).
--    RANK dejaría huecos (1,1,3) y ROW_NUMBER rompería los empates arbitrariamente.
-- @top3
SELECT department, employee, salary
FROM (
    SELECT d.name AS department,
           e.name AS employee,
           e.salary,
           DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rnk
    FROM employee e
    JOIN department d ON d.id = e.department_id
) ranked
WHERE rnk <= 3
ORDER BY department, salary DESC, employee;

-- 2) Segundo salario más alto de toda la empresa (NULL si no existe).
-- @second
SELECT (SELECT DISTINCT salary FROM employee ORDER BY salary DESC LIMIT 1 OFFSET 1) AS second_highest;

-- 3) Self-join: empleados que ganan más que su jefe directo.
-- @more_than_manager
SELECT e.name AS employee
FROM employee e
JOIN employee m ON m.id = e.manager_id
WHERE e.salary > m.salary
ORDER BY e.name;

-- 4) Cadena de mando hacia arriba de un empleado (CTE recursiva).
-- @chain
WITH RECURSIVE chain(id, name, manager_id, level) AS (
    SELECT id, name, manager_id, 0 FROM employee WHERE name = 'Eva'
    UNION ALL
    SELECT m.id, m.name, m.manager_id, c.level + 1
    FROM employee m
    JOIN chain c ON m.id = c.manager_id
)
SELECT name, level FROM chain ORDER BY level;

-- 5) Salario de cada empleado vs. el promedio de su departamento (ventana sin colapsar filas).
-- @vs_avg
SELECT e.name,
       e.salary,
       ROUND(AVG(e.salary) OVER (PARTITION BY e.department_id), 1) AS dept_avg
FROM employee e
ORDER BY e.name;

-- 6) Optimización: un índice compuesto que cubre el filtro y el orden de la consulta 1.
--    Revisar el plan con EXPLAIN (PostgreSQL: EXPLAIN ANALYZE) antes y después.
CREATE INDEX idx_employee_dept_salary ON employee (department_id, salary DESC);
