"""
Arrays y matrices reportados en EPAM: rotar imagen (matriz), siguiente número mayor
con los mismos dígitos, eliminar duplicados (dos punteros), rotar arreglo.
Arrays, strings, dos punteros y hash maps son los temas más frecuentes del assessment.
"""


def rotar_matriz(m: list[list[int]]) -> None:
    """Rota 90° en sentido horario IN-PLACE: transponer + invertir cada fila. O(n^2), O(1) extra."""
    n = len(m)
    for i in range(n):
        for j in range(i + 1, n):
            m[i][j], m[j][i] = m[j][i], m[i][j]
    for fila in m:
        fila.reverse()


def siguiente_mayor(n: int) -> int:
    """Siguiente número mayor con los mismos dígitos, o -1. 2017 -> 2071, 531 -> -1.
    Algoritmo "next permutation", O(d):
    1. Desde la derecha, buscar el primer dígito menor que su vecino derecho (pivote).
    2. Intercambiarlo con el menor dígito mayor que él a su derecha.
    3. Invertir lo que queda a la derecha del pivote (quedaba en orden descendente)."""
    d = list(str(n))
    i = len(d) - 2
    while i >= 0 and d[i] >= d[i + 1]:
        i -= 1
    if i < 0:
        return -1
    j = len(d) - 1
    while d[j] <= d[i]:
        j -= 1
    d[i], d[j] = d[j], d[i]
    d[i + 1:] = reversed(d[i + 1:])
    return int("".join(d))


def eliminar_duplicados_ordenado(nums: list[int]) -> int:
    """Arreglo ORDENADO: deja los únicos al inicio in-place y devuelve cuántos son. Dos punteros, O(n)."""
    if not nums:
        return 0
    escritura = 1
    for lectura in range(1, len(nums)):
        if nums[lectura] != nums[escritura - 1]:
            nums[escritura] = nums[lectura]
            escritura += 1
    return escritura


def eliminar_duplicados_conservando_orden(nums: list) -> list:
    """Arreglo NO ordenado: O(n) con un set (dict.fromkeys también conserva el orden)."""
    vistos, res = set(), []
    for x in nums:
        if x not in vistos:
            vistos.add(x)
            res.append(x)
    return res


def rotar_arreglo(nums: list[int], k: int) -> None:
    """Rota a la derecha k posiciones in-place con tres inversiones. O(n), O(1)."""
    n = len(nums)
    if n == 0:
        return
    k %= n

    def invertir(i, j):
        while i < j:
            nums[i], nums[j] = nums[j], nums[i]
            i, j = i + 1, j - 1

    invertir(0, n - 1)
    invertir(0, k - 1)
    invertir(k, n - 1)


def dos_sumas(nums: list[int], objetivo: int) -> tuple[int, int] | None:
    """Clásico de hash map: O(n)."""
    vistos = {}
    for i, x in enumerate(nums):
        if objetivo - x in vistos:
            return vistos[objetivo - x], i
        vistos[x] = i
    return None


if __name__ == "__main__":
    m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    rotar_matriz(m)
    assert m == [[7, 4, 1], [8, 5, 2], [9, 6, 3]]

    assert siguiente_mayor(12) == 21 and siguiente_mayor(2017) == 2071
    assert siguiente_mayor(531) == -1 and siguiente_mayor(9) == -1 and siguiente_mayor(1234) == 1243

    a = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
    k = eliminar_duplicados_ordenado(a)
    assert a[:k] == [0, 1, 2, 3, 4]
    assert eliminar_duplicados_conservando_orden([3, 1, 3, 2, 1]) == [3, 1, 2]

    r = [1, 2, 3, 4, 5, 6, 7]
    rotar_arreglo(r, 3)
    assert r == [5, 6, 7, 1, 2, 3, 4]

    assert dos_sumas([2, 7, 11, 15], 9) == (0, 1)
    print("OK - arrays")
