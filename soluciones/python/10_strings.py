"""
Ejercicios de strings reportados en EPAM (assessment online y live coding):
paréntesis válidos, palíndromos, anagramas, "encontrar todos los anagramas" (ventana
deslizante) y "Magic Latin".

Consejo de la guía: di primero la solución de fuerza bruta, luego optimiza, y nombra
los casos borde (string vacío, un solo carácter, mayúsculas, espacios).
"""
from collections import Counter, defaultdict


def parentesis_validos(s: str) -> bool:
    """O(n) con una pila. Soporta (), [] y {}."""
    pares = {")": "(", "]": "[", "}": "{"}
    pila = []
    for ch in s:
        if ch in "([{":
            pila.append(ch)
        elif ch in pares:
            if not pila or pila.pop() != pares[ch]:
                return False
    return not pila


def es_palindromo(s: str) -> bool:
    """Ignora mayúsculas y caracteres no alfanuméricos. Dos punteros, O(n) tiempo, O(1) memoria."""
    i, j = 0, len(s) - 1
    while i < j:
        if not s[i].isalnum():
            i += 1
        elif not s[j].isalnum():
            j -= 1
        elif s[i].lower() != s[j].lower():
            return False
        else:
            i, j = i + 1, j - 1
    return True


def palindromo_mas_largo(s: str) -> str:
    """Expandir desde el centro: O(n^2) tiempo, O(1) memoria."""
    if not s:
        return ""
    ini, fin = 0, 0
    for c in range(len(s)):
        for i, j in ((c, c), (c, c + 1)):  # centro impar y par
            while i >= 0 and j < len(s) and s[i] == s[j]:
                i, j = i - 1, j + 1
            if j - i - 1 > fin - ini:
                ini, fin = i + 1, j
    return s[ini:fin]


def son_anagramas(a: str, b: str) -> bool:
    """O(n) con conteo (sorted sería O(n log n))."""
    return Counter(a.replace(" ", "").lower()) == Counter(b.replace(" ", "").lower())


def agrupar_anagramas(palabras: list[str]) -> list[list[str]]:
    grupos = defaultdict(list)
    for p in palabras:
        grupos["".join(sorted(p))].append(p)
    return list(grupos.values())


def encontrar_anagramas(s: str, p: str) -> list[int]:
    """Índices donde empieza un anagrama de p dentro de s. Ventana deslizante, O(n)."""
    if len(p) > len(s):
        return []
    objetivo, ventana = Counter(p), Counter(s[: len(p)])
    res = [0] if ventana == objetivo else []
    for i in range(len(p), len(s)):
        ventana[s[i]] += 1
        sale = s[i - len(p)]
        ventana[sale] -= 1
        if ventana[sale] == 0:
            del ventana[sale]
        if ventana == objetivo:  # comparar Counters de alfabeto acotado es O(1)
            res.append(i - len(p) + 1)
    return res


def magic_latin(frase: str) -> str:
    """Mueve la primera letra de cada palabra al final y añade 'ay'; la puntuación se queda igual.
    magic_latin('Hello world !') -> 'elloHay orldway !'"""
    return " ".join(w[1:] + w[0] + "ay" if w.isalpha() else w for w in frase.split(" "))


def primer_caracter_unico(s: str) -> int:
    conteo = Counter(s)
    return next((i for i, ch in enumerate(s) if conteo[ch] == 1), -1)


if __name__ == "__main__":
    assert parentesis_validos("()") and parentesis_validos("([]{})") and parentesis_validos("")
    assert not parentesis_validos(")(())(") and not parentesis_validos("(]") and not parentesis_validos("((")

    assert es_palindromo("Anita lava la tina") and es_palindromo("") and not es_palindromo("hola")
    assert palindromo_mas_largo("babad") in ("bab", "aba") and palindromo_mas_largo("cbbd") == "bb"

    assert son_anagramas("Roma", "amor") and not son_anagramas("abc", "abd")
    assert sorted(map(sorted, agrupar_anagramas(["eat", "tea", "tan", "ate", "nat", "bat"]))) == [
        ["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]
    assert encontrar_anagramas("cbaebabacd", "abc") == [0, 6]
    assert encontrar_anagramas("abab", "ab") == [0, 1, 2]

    assert magic_latin("Hello world !") == "elloHay orldway !"
    assert magic_latin("Pig latin is cool") == "igPay atinlay siay oolcay"
    assert primer_caracter_unico("leetcode") == 0 and primer_caracter_unico("aabb") == -1
    print("OK - strings")
