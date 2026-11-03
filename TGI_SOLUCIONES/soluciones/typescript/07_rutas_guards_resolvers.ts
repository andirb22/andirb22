/**
 * Routing (tema de la guía EPAM: "guards funcionales vs de clase, preloading, resolvers,
 * lazy loading y code splitting").
 *
 * - Lazy loading: loadComponent / loadChildren con import() dinámico -> el bundler crea un
 *   chunk aparte que solo se descarga al entrar a la ruta (menos JS inicial, mejor LCP).
 * - Preloading: PreloadAllModules descarga los chunks en segundo plano tras la carga
 *   inicial; una estrategia propia permite precargar solo rutas marcadas.
 * - Guards funcionales (Angular 15+): simples funciones con inject(); las clases con
 *   CanActivate están deprecadas. Devolver un UrlTree para redirigir (no router.navigate).
 * - Resolvers: cargan datos antes de activar la ruta. Ojo: bloquean la navegación; para
 *   datos lentos suele ser mejor mostrar un skeleton y cargar en el componente.
 * - withComponentInputBinding(): los params y datos resueltos llegan como inputs.
 * - Recordar: los guards del frontend son UX, la seguridad real está en la API.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CanActivateFn,
  CanDeactivateFn,
  CanMatchFn,
  PreloadingStrategy,
  ResolveFn,
  Route,
  Router,
  Routes,
} from '@angular/router';
import { catchError, EMPTY, Observable, of } from 'rxjs';

// Servicio mínimo para el ejemplo
@Injectable({ providedIn: 'root' })
export class SesionService {
  usuario: { id: number; roles: string[] } | null = null;
  get autenticado(): boolean {
    return this.usuario !== null;
  }
  tieneRol(rol: string): boolean {
    return this.usuario?.roles.includes(rol) ?? false;
  }
}

export const autenticadoGuard: CanActivateFn = (_route, state) => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  return sesion.autenticado
    ? true
    : router.createUrlTree(['/login'], { queryParams: { volverA: state.url } });
};

/** Fábrica de guards parametrizados (RBAC en el cliente). */
export const rolGuard =
  (rol: string): CanActivateFn =>
  () =>
    inject(SesionService).tieneRol(rol) || inject(Router).createUrlTree(['/sin-permiso']);

/** canMatch: si falla, ni siquiera se descarga el chunk lazy de la ruta. */
export const soloAdminMatch: CanMatchFn = () => inject(SesionService).tieneRol('admin');

export interface ConCambiosSinGuardar {
  tieneCambios(): boolean;
}
export const cambiosSinGuardarGuard: CanDeactivateFn<ConCambiosSinGuardar> = (componente) =>
  !componente.tieneCambios() || confirm('Hay cambios sin guardar. ¿Salir?');

export interface Pedido {
  id: string;
  total: number;
}
export const pedidoResolver: ResolveFn<Pedido> = (route) => {
  const router = inject(Router);
  return inject(HttpClient)
    .get<Pedido>(`/api/pedidos/${route.paramMap.get('id')}`)
    .pipe(
      catchError(() => {
        void router.navigate(['/no-encontrado']);
        return EMPTY; // EMPTY cancela la navegación
      }),
    );
};

/** Precarga solo las rutas con data: { precargar: true }. */
@Injectable({ providedIn: 'root' })
export class PrecargaSelectiva implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['precargar'] ? load() : of(null);
  }
}

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./paginas/login.component').then((m) => m.LoginComponent) },
  {
    path: 'pedidos',
    canActivate: [autenticadoGuard],
    data: { precargar: true },
    loadChildren: () => import('./pedidos/pedidos.routes').then((m) => m.PEDIDOS_ROUTES),
  },
  {
    path: 'pedidos/:id',
    canActivate: [autenticadoGuard],
    resolve: { pedido: pedidoResolver }, // llega como input "pedido" con withComponentInputBinding
    loadComponent: () => import('./pedidos/detalle.component').then((m) => m.DetalleComponent),
  },
  {
    path: 'admin',
    canMatch: [soloAdminMatch],
    canActivate: [rolGuard('admin')],
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'pedidos' },
  { path: '**', loadComponent: () => import('./paginas/no-encontrado.component').then((m) => m.NoEncontradoComponent) },
];

/*
app.config.ts:
  provideRouter(routes, withComponentInputBinding(), withPreloading(PrecargaSelectiva))
*/
