/**
 * Formularios reactivos tipados + validadores propios (tema de la guía EPAM:
 * "typed forms, custom validators").
 *
 * - Desde Angular 14, FormControl<T> está tipado: form.value y getRawValue() tienen tipo.
 * - nonNullable: true hace que reset() vuelva al valor inicial en vez de a null.
 * - form.value excluye los controles deshabilitados; getRawValue() los incluye.
 * - Validador síncrono = función (control) => ValidationErrors | null.
 * - Validador de grupo (cruzado): se pone en el FormGroup y compara varios campos.
 * - Validador asíncrono: devuelve Observable; conviene debounce y que complete (take(1)/first).
 */
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { catchError, first, map, of, switchMap, timer } from 'rxjs';

// --- Validadores -------------------------------------------------------------
export const passwordFuerte: ValidatorFn = (c: AbstractControl<string>): ValidationErrors | null => {
  const v = c.value ?? '';
  const faltan = [
    !/[A-Z]/.test(v) && 'mayuscula',
    !/[0-9]/.test(v) && 'numero',
    v.length < 10 && 'longitud',
  ].filter(Boolean);
  return faltan.length ? { passwordFuerte: { faltan } } : null;
};

export function coinciden(a: string, b: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null =>
    grupo.get(a)?.value === grupo.get(b)?.value ? null : { noCoinciden: { a, b } };
}

export function emailDisponible(http: HttpClient): AsyncValidatorFn {
  return (c: AbstractControl<string>) =>
    timer(400).pipe( // debounce: no consultar en cada tecla
      switchMap(() => http.get<{ disponible: boolean }>(`/api/usuarios/disponible?email=${encodeURIComponent(c.value)}`)),
      map((r) => (r.disponible ? null : { emailOcupado: true })),
      catchError(() => of(null)), // si el servicio falla, no bloquear el formulario
      first(),
    );
}

// --- Modelo tipado -------------------------------------------------------------
interface DireccionForm {
  ciudad: FormControl<string>;
  calle: FormControl<string>;
}

interface RegistroForm {
  email: FormControl<string>;
  credenciales: FormGroup<{ password: FormControl<string>; confirmar: FormControl<string> }>;
  direcciones: FormArray<FormGroup<DireccionForm>>;
  aceptaTerminos: FormControl<boolean>;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="enviar()">
      <label>Email <input formControlName="email" type="email" /></label>
      @if (form.controls.email.hasError('emailOcupado')) { <span role="alert">Email en uso</span> }

      <fieldset formGroupName="credenciales">
        <label>Contraseña <input formControlName="password" type="password" /></label>
        <label>Confirmar <input formControlName="confirmar" type="password" /></label>
        @if (form.controls.credenciales.hasError('noCoinciden')) { <span role="alert">No coinciden</span> }
      </fieldset>

      <div formArrayName="direcciones">
        @for (d of form.controls.direcciones.controls; track d; let i = $index) {
          <fieldset [formGroupName]="i">
            <input formControlName="ciudad" aria-label="Ciudad" />
            <input formControlName="calle" aria-label="Calle" />
            <button type="button" (click)="quitarDireccion(i)">Quitar</button>
          </fieldset>
        }
      </div>
      <button type="button" (click)="agregarDireccion()">Agregar dirección</button>

      <label><input type="checkbox" formControlName="aceptaTerminos" /> Acepto</label>
      <button type="submit" [disabled]="form.invalid || form.pending">Registrar</button>
    </form>
  `,
})
export class RegistroComponent {
  private readonly http = inject(HttpClient);

  readonly form = new FormGroup<RegistroForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
      asyncValidators: [emailDisponible(this.http)],
      updateOn: 'blur',
    }),
    credenciales: new FormGroup(
      {
        password: new FormControl('', { nonNullable: true, validators: [Validators.required, passwordFuerte] }),
        confirmar: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      },
      { validators: [coinciden('password', 'confirmar')] },
    ),
    direcciones: new FormArray<FormGroup<DireccionForm>>([]),
    aceptaTerminos: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });

  agregarDireccion(): void {
    this.form.controls.direcciones.push(
      new FormGroup<DireccionForm>({
        ciudad: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        calle: new FormControl('', { nonNullable: true }),
      }),
    );
  }

  quitarDireccion(i: number): void {
    this.form.controls.direcciones.removeAt(i);
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Tipado: { email: string; credenciales: {...}; direcciones: {ciudad: string; calle: string}[]; ... }
    const datos = this.form.getRawValue();
    console.log(datos.email.toLowerCase(), datos.direcciones.length);
  }
}
