import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { StorageService } from '../services/storageService/storage.service';
import { HttpService } from '../services/http/http.service';
import { AuthResponse } from '../models/access-token';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

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
      catchError(error => {
        if (error instanceof HttpErrorResponse &&
            (error.status === 401 || error.status === 403) &&
            !this.isAuthUrl(request.url)) {
          return this.handle401Error(request, next);
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

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.storageService.obtenerRefreshToken();
      if (!refreshToken) {
        this.handleLogout();
        return throwError(() => new Error('No refresh token available'));
      }

      return this.httpService.refreshToken(refreshToken).pipe(
        switchMap((response: AuthResponse) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);

          // Guardar los nuevos tokens
          this.storageService.guardarToken(response.accessToken);
          this.storageService.guardarRefreshToken(response.refreshToken);

          // Reintentamos la petición original con el nuevo token
          return next.handle(this.addToken(request, response.accessToken));
        }),
        catchError(error => {
          this.isRefreshing = false;
          if (error.status === 401 || error.status === 403) {
            this.handleLogout();
          }
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }

    // Si ya hay un refresh en curso, esperamos a que termine y reintentamos con el nuevo token
    return this.refreshTokenSubject.pipe(
      switchMap(token => {
        if (token) {
          return next.handle(this.addToken(request, token));
        }
        return throwError(() => new Error('No token available'));
      })
    );
  }

  private handleLogout(): void {
    this.storageService.limpiarStorage();
    this.router.navigate(['/auth/login']);
  }
}
