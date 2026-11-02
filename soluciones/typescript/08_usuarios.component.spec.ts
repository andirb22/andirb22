/**
 * Testear un componente que hace llamadas HTTP (pregunta de la guía EPAM: "¿cómo
 * testeas un componente que hace llamadas HTTP?").
 *
 * - provideHttpClient() + provideHttpClientTesting(): HttpClient real con un backend falso.
 * - HttpTestingController: expectOne(url) verifica que se hizo la petición; flush()
 *   responde; httpMock.verify() en afterEach falla si quedaron peticiones sin atender.
 * - fixture.detectChanges() (o await fixture.whenStable()) para ver la plantilla actualizada.
 * - Probar también el camino de error, no solo el feliz.
 * - Para interacciones de UI, los ComponentHarness de Angular CDK/Material son más estables
 *   que buscar por selectores CSS.
 */
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

interface Usuario {
  id: number;
  nombre: string;
}

// --- Componente bajo prueba --------------------------------------------------------
@Component({
  selector: 'app-usuarios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cargando()) { <p class="cargando">Cargando…</p> }
    @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
    <ul>
      @for (u of usuarios(); track u.id) { <li>{{ u.nombre }}</li> }
    </ul>
  `,
})
export class UsuariosComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargando.set(true);
    this.http.get<Usuario[]>('/api/usuarios').subscribe({
      next: (u) => {
        this.usuarios.set(u);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios');
        this.cargando.set(false);
      },
    });
  }
}

// --- Tests -------------------------------------------------------------------------
describe('UsuariosComponent', () => {
  let fixture: ComponentFixture<UsuariosComponent>;
  let httpMock: HttpTestingController;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UsuariosComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(UsuariosComponent);
    httpMock = TestBed.inject(HttpTestingController);
    el = fixture.nativeElement;
  });

  afterEach(() => httpMock.verify()); // ninguna petición inesperada o pendiente

  it('muestra "cargando" y luego la lista', () => {
    fixture.detectChanges(); // dispara ngOnInit
    expect(el.querySelector('.cargando')).not.toBeNull();

    const req = httpMock.expectOne('/api/usuarios');
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: 1, nombre: 'Ana' },
      { id: 2, nombre: 'Luis' },
    ]);
    fixture.detectChanges();

    const items = Array.from(el.querySelectorAll('li')).map((li) => li.textContent?.trim());
    expect(items).toEqual(['Ana', 'Luis']);
    expect(el.querySelector('.cargando')).toBeNull();
  });

  it('muestra un mensaje si la API falla', () => {
    fixture.detectChanges();
    httpMock.expectOne('/api/usuarios').flush('error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('No se pudieron cargar');
    expect(el.querySelectorAll('li').length).toBe(0);
  });
});
