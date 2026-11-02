/**
 * ControlValueAccessor (tema de la guía EPAM: "Forms: typed forms, custom validators,
 * ControlValueAccessor").
 *
 * Sirve para que un componente propio funcione como un input nativo con formControlName
 * o ngModel. Angular llama a:
 * - writeValue(v): el formulario -> el componente (setValue, valor inicial, reset).
 * - registerOnChange(fn): guardar fn y llamarla cuando el usuario cambie el valor.
 * - registerOnTouched(fn): llamarla al perder el foco (para validaciones "touched").
 * - setDisabledState(b): control.disable()/enable().
 * Se registra con el token NG_VALUE_ACCESSOR (multi: true) y forwardRef, porque la clase
 * todavía no está definida cuando se evalúa el decorador.
 * Opcional: implementar Validator + NG_VALIDATORS para que el componente se valide solo.
 */
import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

@Component({
  selector: 'app-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RatingComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => RatingComponent), multi: true },
  ],
  template: `
    <div role="radiogroup" [attr.aria-label]="etiqueta()" (focusout)="onTouched()">
      @for (n of estrellas(); track n) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="n === valor()"
          [attr.aria-label]="n + ' de ' + max()"
          [disabled]="deshabilitado()"
          (click)="seleccionar(n)"
        >
          {{ n <= valor() ? '★' : '☆' }}
        </button>
      }
    </div>
  `,
})
export class RatingComponent implements ControlValueAccessor, Validator {
  readonly max = input(5);
  readonly etiqueta = input('Calificación');
  readonly valor = signal(0);
  readonly deshabilitado = signal(false);

  private onChange: (v: number) => void = () => {};
  onTouched: () => void = () => {};

  estrellas(): number[] {
    return Array.from({ length: this.max() }, (_, i) => i + 1);
  }

  seleccionar(n: number): void {
    if (this.deshabilitado()) return;
    this.valor.set(n);
    this.onChange(n); // notifica al formulario
    this.onTouched();
  }

  // --- ControlValueAccessor ---
  writeValue(v: number | null): void {
    this.valor.set(v ?? 0); // sin llamar a onChange: el cambio viene del formulario
  }
  registerOnChange(fn: (v: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.deshabilitado.set(disabled);
  }

  // --- Validator ---
  validate(control: AbstractControl<number | null>): ValidationErrors | null {
    const v = control.value ?? 0;
    return v < 1 || v > this.max() ? { rating: { min: 1, max: this.max(), actual: v } } : null;
  }
}

/*
Uso:
  form = new FormGroup({ puntuacion: new FormControl(0, { nonNullable: true }) });
  <form [formGroup]="form"><app-rating formControlName="puntuacion" /></form>
*/
