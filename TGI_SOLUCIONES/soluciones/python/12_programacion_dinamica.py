"""
Programación dinámica reportada en EPAM: Edit Distance y Longest Common Subsequence.

Cómo explicarlo: definir el subproblema (dp[i][j] = respuesta para los prefijos
a[:i] y b[:j]), el caso base, la recurrencia, y luego optimizar memoria a O(min(n, m))
guardando solo la fila anterior.
"""


def edit_distance(a: str, b: str) -> int:
    """Mínimo de inserciones, borrados o reemplazos para convertir a en b. O(n*m) tiempo, O(m) memoria."""
    prev = list(range(len(b) + 1))  # convertir "" en b[:j] cuesta j inserciones
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j],  # borrar
                                 cur[j - 1],  # insertar
                                 prev[j - 1])  # reemplazar
        prev = cur
    return prev[-1]


def lcs(a: str, b: str) -> str:
    """Devuelve una subsecuencia común más larga (no solo su longitud)."""
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n):
        for j in range(m):
            dp[i + 1][j + 1] = dp[i][j] + 1 if a[i] == b[j] else max(dp[i][j + 1], dp[i + 1][j])
    # reconstruir desde la esquina
    res, i, j = [], n, m
    while i and j:
        if a[i - 1] == b[j - 1]:
            res.append(a[i - 1])
            i, j = i - 1, j - 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return "".join(reversed(res))


def subarreglo_max(nums: list[int]) -> int:
    """Kadane: suma máxima de un subarreglo contiguo, O(n)."""
    mejor = actual = nums[0]
    for x in nums[1:]:
        actual = max(x, actual + x)
        mejor = max(mejor, actual)
    return mejor


def formas_de_subir(n: int) -> int:
    """Escalera de 1 o 2 pasos (Fibonacci), O(n) tiempo y O(1) memoria."""
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a


if __name__ == "__main__":
    assert edit_distance("horse", "ros") == 3
    assert edit_distance("intention", "execution") == 5
    assert edit_distance("", "abc") == 3 and edit_distance("abc", "abc") == 0

    assert lcs("abcde", "ace") == "ace" and lcs("abc", "def") == ""
    assert len(lcs("AGGTAB", "GXTXAYB")) == 4

    assert subarreglo_max([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6
    assert formas_de_subir(5) == 8
    print("OK - programación dinámica")
