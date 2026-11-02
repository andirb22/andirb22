/**
 * Evitar fugas de memoria con RxJS (pregunta de la guía EPAM: "¿cómo previenes fugas
 * de memoria con suscripciones RxJS?").
 *
 * Opciones, de la más recomendada a la menos:
 * 1. No suscribirse: pipe `async` en la plantilla o toSignal(); Angular se desuscribe solo.
 * 2. takeUntilDestroyed() (Angular 16+): completa el stream al destruir el componente.
 *    Fuera del constructor hay que pasarle un DestroyRef.
 * 3. take(1) / first() para streams que solo interesan una vez.
 * 4. Patrón antiguo: un Subject destroy$ + takeUntil(destroy$) emitido en ngOnDestroy.
 *
 * Qué streams NO completan solos y por tanto fugan: interval, fromEvent, valueChanges
 * de formularios, store.select, router.events, Subjects de servicios singleton.
 * HttpClient sí completa tras la respuesta (aun así, cancelar evita trabajo inútil).
 * Regla de lint: takeUntilDestroyed debe ir al FINAL del pipe.
 */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, fromEvent, interval, map, Subject, takeUntil, throttleTime } from 'rxjs';

@Component({
  selector: 'app-sin-fugas',
  standalone: true,
  imports: [AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Segundos (async pipe): {{ segundos$ | async }}</p>
    <p>Ancho (signal): {{ ancho() }}</p>
    <p>Última ruta: {{ ultimaRuta }}</p>
  `,
})
export class SinFugasComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  ultimaRuta = '';

  // 1) async pipe: la plantilla se suscribe y se desuscribe
  readonly segundos$ = interval(1000);

  // 1) toSignal: también se desuscribe al destruirse el componente
  readonly ancho = toSignal(
    fromEvent(window, 'resize').pipe(throttleTime(100), map(() => window.innerWidth)),
    { initialValue: window.innerWidth },
  );

  constructor() {
    // 2) en el constructor (contexto de inyección) no hace falta pasar DestroyRef
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(), // siempre el último operador
      )
      .subscribe((e) => (this.ultimaRuta = e.urlAfterRedirects));
  }

  ngOnInit(): void {
    // 2) fuera del constructor: pasar el DestroyRef explícitamente
    interval(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => console.log('ping'));
  }
}

/** 4) Patrón clásico (versiones anteriores a Angular 16), por si sale en la entrevista. */
@Component({ selector: 'app-legacy', standalone: true, template: '' })
export class LegacyComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
