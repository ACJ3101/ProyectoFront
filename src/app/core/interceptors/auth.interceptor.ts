import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of, lastValueFrom } from 'rxjs';
import { catchError, filter, take, switchMap, finalize, delay } from 'rxjs/operators';
import { StorageService } from '../services/storageService/storage.service';
import { HttpService } from '../services/http/http.service';
import { AuthResponse } from '../models/access-token';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private refreshTokenPromise: Promise<string | null> | null = null;

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

  private async handle401Error(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    if (!this.refreshTokenPromise) {
      this.refreshTokenPromise = this.refreshToken();
    }

    try {
      const newToken = await this.refreshTokenPromise;
      this.refreshTokenPromise = null;

      if (!newToken) {
        this.handleLogout();
        throw new Error('No se pudo refrescar el token');
      }

      return await lastValueFrom(next.handle(this.addToken(request, newToken)));
    } catch (error) {
      this.refreshTokenPromise = null;
      this.handleLogout();
      throw error;
    }
  }

  private refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      return Promise.resolve(null);
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    const refreshToken = this.storageService.obtenerRefreshToken();
    if (!refreshToken) {
      this.isRefreshing = false;
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      this.httpService.refreshToken(refreshToken).pipe(
        delay(1000), // Añadimos un pequeño delay para evitar llamadas muy rápidas
        finalize(() => {
          this.isRefreshing = false;
        })
      ).subscribe({
        next: (response: AuthResponse) => {
          this.storageService.guardarToken(response.accessToken);
          this.storageService.guardarRefreshToken(response.refreshToken);
          this.refreshTokenSubject.next(response.accessToken);
          resolve(response.accessToken);
        },
        error: (error) => {
          this.refreshTokenSubject.next(null);
          reject(error);
        }
      });
    });
  }

  private handleLogout(): void {
    this.isRefreshing = false;
    this.refreshTokenSubject.next(null);
    this.refreshTokenPromise = null;
    this.storageService.limpiarStorage();
    this.router.navigate(['/auth/login']);
  }
}
