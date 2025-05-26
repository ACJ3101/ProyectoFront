import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { StorageService } from '../services/storageService/storage.service';
import { HttpService } from '../services/http/http.service';
import { AuthResponse } from '../models/access-token';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private storageService: StorageService,
    private httpService: HttpService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Si estamos en el servidor, pasamos la petición sin modificar
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(request);
    }

    // No intentamos añadir el token para las rutas de autenticación
    if (this.isAuthUrl(request.url)) {
      return next.handle(request);
    }

    const token = this.storageService.obtenerToken();

    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401 || error.status === 403) {
            // Solo intentamos refrescar si no es una ruta de autenticación
            if (!this.isAuthUrl(request.url)) {
              return this.handleAuthError(request, next);
            }
          }
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthUrl(url: string): boolean {
    return url.includes('/auth/login') || url.includes('/auth/refresh');
  }

  private handleAuthError(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('No se puede refrescar el token en el servidor'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.storageService.obtenerRefreshToken();

      if (refreshToken) {
        return this.httpService.refreshToken(refreshToken).pipe(
          switchMap((response: AuthResponse) => {
            this.isRefreshing = false;
            this.storageService.guardarToken(response.accessToken);
            this.storageService.guardarRefreshToken(response.refreshToken);
            this.refreshTokenSubject.next(response.accessToken);
            return next.handle(this.addToken(request, response.accessToken));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.storageService.limpiarStorage();
            this.router.navigate(['/auth/login']);
            return throwError(() => err);
          })
        );
      } else {
        // Si no hay refresh token, limpiamos el storage y redirigimos al login
        this.isRefreshing = false;
        this.storageService.limpiarStorage();
        this.router.navigate(['/auth/login']);
        return throwError(() => new Error('No hay refresh token disponible'));
      }
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next.handle(this.addToken(request, token));
      })
    );
  }
}
