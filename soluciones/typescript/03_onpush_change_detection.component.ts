/**
 * Change detection y OnPush (pregunta de la guía EPAM: "explica la detección de cambios
 * de Angular y cómo la afecta OnPush").
 *
 * Default: tras cualquier evento asíncrono (click, HTTP, setTimeout) que Zone.js detecta,
 * Angular revisa TODO el árbol de componentes de arriba hacia abajo.
 *
 * OnPush: el componente (y su subárbol) solo se revisa si:
 *  1. Cambia la REFERENCIA de un @Input / input() (comparación ===, no deep).
 *  2. Ocurre un evento en su plantilla o en la de un hijo.
 *  3. El pipe async recibe un valor nuevo (llama a markForCheck).
 *  4. Cambia un signal que se lee en su plantilla (Angular 17+).
 *  5. Se llama a markForCheck() o detectChanges() manualmente.
 * Consecuencia: mutar un objeto/array de entrada (push) NO actualiza la vista -> datos inmutables.
 *
 * markForCheck(): marca este componente y sus ancestros para la próxima pasada (lo normal).
 * detectChanges(): ejecuta la detección YA, solo en este componente y sus hijos.
 * ExpressionChangedAfterItHasBeenCheckedError: en modo dev Angular hace una segunda pasada
 * y detecta que un valor cambió durante la detección (p. ej. modificar un dato del padre en
 * ngAfterViewInit del hijo). Se arregla moviendo la lógica, no con setTimeout.
 * Zoneless (provideZonelessChangeDetection): sin Zone.js; los cambios se notifican con
 * signals, markForCheck o el pipe async.
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

interface Item {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-lista',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h3>{{ titulo() }} ({{ total() }})</h3>
    <ul>
      @for (item of items(); track item.id) {
        <li>{{ item.nombre }}</li>
      }
    </ul>
    <p>Actualizado manualmente: {{ ultimaActualizacion }}</p>
  `,
})
export class ListaComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  readonly titulo = input('Lista');
  readonly items = input.required<readonly Item[]>();
  readonly total = computed(() => this.items().length); // se recalcula solo cuando cambia items
  ultimaActualizacion = '';

  constructor() {
    // Un callback fuera del flujo normal (p. ej. un WebSocket o una librería externa):
    // como es OnPush, hay que avisarle a Angular.
    setTimeout(() => {
      this.ultimaActualizacion = new Date().toISOString();
      this.cdr.markForCheck();
    }, 1000);
  }
}

@Component({
  selector: 'app-padre',
  standalone: true,
  imports: [ListaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-lista [items]="items()" titulo="Usuarios" />
    <button (click)="agregarMal()">Mutar (no se ve en el hijo)</button>
    <button (click)="agregarBien()">Nueva referencia (sí se ve)</button>
  `,
})
export class PadreComponent {
  readonly items = signal<Item[]>([{ id: 1, nombre: 'Ana' }]);

  agregarMal(): void {
    // MAL: muta el mismo array -> la referencia no cambia y el signal no notifica
    this.items().push({ id: Date.now(), nombre: 'Mutado' });
  }

  agregarBien(): void {
    // BIEN: nuevo array (inmutabilidad)
    this.items.update((lista) => [...lista, { id: Date.now(), nombre: 'Nuevo' }]);
  }
}
