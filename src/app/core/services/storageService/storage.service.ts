import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../../models/interfaces';
import { AuthResponse } from '../../models/access-token';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../cartService/cart.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly USER_KEY = 'usuario';
  private readonly EMAIL_KEY = 'lastEmail';
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cartService: CartService
  ) {
    if (this.isBrowser()) {
      this.cargarUsuario();
    }
  }

  private cargarUsuario(): void {
    if (this.isBrowser()) {
      const usuarioGuardado = localStorage.getItem(this.USER_KEY);
      if (usuarioGuardado) {
        this.usuarioSubject.next(JSON.parse(usuarioGuardado));
      }
    }
  }

  guardarUsuario(usuario: Usuario): void {
    if (this.isBrowser()) {
      const usuarioFiltrado: Usuario = {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        nick: usuario.nick,
        email: usuario.email,
        direccion: usuario.direccion,
        rol: usuario.rol
      };
      try {
        localStorage.setItem(this.EMAIL_KEY, usuario.email);
        localStorage.setItem(this.USER_KEY, JSON.stringify(usuarioFiltrado));
        this.usuarioSubject.next(usuarioFiltrado);
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
    }
  }

  obtenerUsuario(): Usuario | null {
    if (this.isBrowser()) {
      try {
        const data = localStorage.getItem(this.USER_KEY);
        if (data) {
          const usuario = JSON.parse(data);
          if (!usuario.id) {
            console.error('Usuario sin ID detectado');
            return null;
          }
          return usuario;
        }
      } catch (error) {
        console.error('Error al obtener usuario del localStorage:', error);
      }
    }
    return null;
  }

  obtenerToken(): string | null {
    if (this.isBrowser()) {
      try {
        return localStorage.getItem(this.TOKEN_KEY);
      } catch (error) {
        console.error('Error al obtener token del localStorage:', error);
        return null;
      }
    }
    return null;
  }

  obtenerRefreshToken(): string | null {
    if (this.isBrowser()) {
      try {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
      } catch (error) {
        console.error('Error al obtener refresh token del localStorage:', error);
        return null;
      }
    }
    return null;
  }

  guardarToken(token: string): void {
    if (this.isBrowser()) {
      try {
        localStorage.setItem(this.TOKEN_KEY, token);
      } catch (error) {
        console.error('Error al guardar token en localStorage:', error);
      }
    }
  }

  guardarRefreshToken(token: string): void {
    if (this.isBrowser()) {
      try {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      } catch (error) {
        console.error('Error al guardar refresh token en localStorage:', error);
      }
    }
  }

  obtenerUltimoEmail(): string | null {
    if (this.isBrowser()) {
      try {
        return localStorage.getItem(this.EMAIL_KEY);
      } catch (error) {
        console.error('Error al obtener email del localStorage:', error);
        return null;
      }
    }
    return null;
  }

  eliminarUsuario(): void {
    if (this.isBrowser()) {
      try {
        const email = this.obtenerUsuario()?.email || localStorage.getItem(this.EMAIL_KEY);
        localStorage.clear();
        if (email) {
          localStorage.setItem(this.EMAIL_KEY, email);
        }
        this.usuarioSubject.next(null);
        this.cartService.limpiarCarrito();
      } catch (error) {
        console.error('Error al eliminar usuario del localStorage:', error);
      }
    }
  }

  limpiarStorage(): void {
    if (this.isBrowser()) {
      try {
        localStorage.clear();
        this.usuarioSubject.next(null);
      } catch (error) {
        console.error('Error al limpiar localStorage:', error);
      }
    }
  }

  borrarLocalStorage(): void {
    this.limpiarStorage();
  }

  existeUsuario(): boolean {
    return this.isBrowser() && !!localStorage.getItem(this.USER_KEY);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
