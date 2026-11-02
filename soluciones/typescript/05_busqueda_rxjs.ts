/**
 * Búsqueda "typeahead" con RxJS: el ejercicio clásico de RxJS en entrevistas de Angular
 * (la guía EPAM pide "RxJS advanced: multicasting/share, custom operators...").
 *
 * Operadores y por qué:
 * - debounceTime(300): espera a que el usuario deje de escribir.
 * - distinctUntilChanged(): no repetir la búsqueda si el texto no cambió.
 * - filter: no buscar textos demasiado cortos.
 * - switchMap: CANCELA la petición anterior si llega un texto nuevo (evita respuestas
 *   fuera de orden). Comparar: mergeMap (todas en paralelo, pueden llegar desordenadas),
 *   concatMap (en cola, en orden), exhaustMap (ignora nuevas mientras hay una en curso;
 *   ideal para un botón de "guardar" o de login).
 * - catchError DENTRO del switchMap: si va fuera, un error completa el stream principal
 *   y la búsqueda deja de funcionar para siempre.
 * - shareReplay: varios suscriptores en la plantilla no disparan varias peticiones.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  MonoTypeOperatorFunction,
  Observable,
  of,
  retry,
  shareReplay,
  startWith,
  switchMap,
  tap,
  timer,
} from 'rxjs';

export interface Producto {
  id: number;
  nombre: string;
}

type Estado =
  | { tipo: 'inicial' }
  | { tipo: 'cargando' }
  | { tipo: 'ok'; datos: Producto[] }
  | { tipo: 'error'; mensaje: string };

/** Operador propio: reintenta con backoff exponencial (custom operator = función que devuelve un operador). */
export function reintentarConBackoff<T>(intentos = 3, baseMs = 300): MonoTypeOperatorFunction<T> {
  return retry({ count: intentos, delay: (_err, n) => timer(baseMs * 2 ** (n - 1)) });
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);

  buscar(q: string): Observable<Producto[]> {
    return this.http
      .get<Producto[]>('/api/productos', { params: new HttpParams().set('q', q) })
      .pipe(reintentarConBackoff(2));
  }
}

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input [formControl]="consulta" placeholder="Buscar producto" aria-label="Buscar producto" />
    @if (estado$ | async; as estado) {
      @switch (estado.tipo) {
        @case ('cargando') { <p>Buscando…</p> }
        @case ('error') { <p role="alert">{{ $any(estado).mensaje }}</p> }
        @case ('ok') {
          <ul>
            @for (p of $any(estado).datos; track p.id) { <li>{{ p.nombre }}</li> }
            @empty { <li>Sin resultados</li> }
          </ul>
        }
      }
    }
  `,
})
export class BusquedaComponent {
  private readonly productos = inject(ProductosService);
  readonly consulta = new FormControl('', { nonNullable: true });

  readonly estado$: Observable<Estado> = this.consulta.valueChanges.pipe(
    map((q) => q.trim()),
    debounceTime(300),
    distinctUntilChanged(),
    filter((q) => q.length === 0 || q.length >= 2),
    switchMap((q) =>
      q.length === 0
        ? of<Estado>({ tipo: 'inicial' })
        : this.productos.buscar(q).pipe(
            map((datos): Estado => ({ tipo: 'ok', datos })),
            startWith<Estado>({ tipo: 'cargando' }),
            catchError(() => of<Estado>({ tipo: 'error', mensaje: 'No se pudo buscar' })),
          ),
    ),
    startWith<Estado>({ tipo: 'inicial' }),
    tap({ error: (e) => console.error('nunca debería llegar aquí', e) }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}
