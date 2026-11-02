/**
 * Refresh de token con un HTTP interceptor (pregunta de la guía EPAM: "¿cómo implementarías
 * el refresh de token de forma segura con interceptores?").
 *
 * Requisitos que hay que mencionar:
 * 1. Si llegan 5 peticiones con 401 a la vez, se hace UN solo refresh y las 5 esperan
 *    el mismo resultado (single-flight con shareReplay).
 * 2. La petición de refresh NO debe pasar por el interceptor (si no, bucle infinito):
 *    se marca con un HttpContextToken.
 * 3. Reintentar la petición original UNA sola vez; si el refresh falla -> logout.
 * 4. Seguridad: access token en memoria (no en localStorage, por XSS); refresh token en
 *    cookie HttpOnly + Secure + SameSite, enviado con withCredentials.
 * 5. Orden de interceptores: se ejecutan en el orden de withInterceptors([...]) para la
 *    petición y en orden inverso para la respuesta.
 *
 * Registro: provideHttpClient(withInterceptors([authInterceptor]))
 */
import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';

/** Marca peticiones que no deben llevar token ni intentar refresh (login, refresh). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private accessToken: string | null = null;
  private refreshEnCurso$: Observable<string> | null = null;

  get token(): string | null {
    return this.accessToken;
  }

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<{ accessToken: string }>('/api/auth/login', { email, password }, {
        withCredentials: true,
        context: new HttpContext().set(SKIP_AUTH, true),
      })
      .pipe(map((r) => void (this.accessToken = r.accessToken)));
  }

  /** Single-flight: todas las llamadas concurrentes comparten el mismo refresh. */
  refresh(): Observable<string> {
    this.refreshEnCurso$ ??= this.http
      .post<{ accessToken: string }>('/api/auth/refresh', null, {
        withCredentials: true, // envía la cookie HttpOnly con el refresh token
        context: new HttpContext().set(SKIP_AUTH, true),
      })
      .pipe(
        map((r) => r.accessToken),
        tap((t) => (this.accessToken = t)),
        finalize(() => (this.refreshEnCurso$ = null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.refreshEnCurso$;
  }

  logout(): void {
    this.accessToken = null;
    void this.router.navigate(['/login']);
  }
}

const conToken = (req: HttpRequest<unknown>, token: string | null) =>
  token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) return next(req);

  const auth = inject(AuthService); // contexto de inyección: solo al inicio de la función

  return next(conToken(req, auth.token)).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }
      return auth.refresh().pipe(
        catchError((refreshErr: unknown) => {
          auth.logout(); // el refresh token también expiró
          return throwError(() => refreshErr);
        }),
        // El reintento queda FUERA del catchError de arriba: si vuelve a dar 401,
        // el error se propaga y no hay bucle.
        switchMap((nuevo) => next(conToken(req, nuevo))),
      );
    }),
  );
};
