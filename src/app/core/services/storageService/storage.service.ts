import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly USER_KEY = 'usuario';

  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.obtenerUsuario());
  usuario$ = this.usuarioSubject.asObservable();

  constructor() {}

  guardarUsuario(usuario: Usuario): void {
    if (this.isBrowser()) {
      const usuarioFiltrado:Usuario = {
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        nick: usuario.nick,
        email: usuario.email,
        direccion: usuario.direccion,
        rol: usuario.rol
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(usuarioFiltrado));
      this.usuarioSubject.next(usuarioFiltrado); // ✅ Emitimos cambio
    }
  }

  obtenerUsuario(): Usuario | null {
    if (this.isBrowser()) {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  eliminarUsuario(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.USER_KEY);
      this.usuarioSubject.next(null); // ✅ Emitimos logout
    }
  }

  borrarLocalStorage(): void {
    if (this.isBrowser()) {
      localStorage.clear();
      this.usuarioSubject.next(null); // ✅ Emitimos logout
    }
  }

  existeUsuario(): boolean {
    return this.isBrowser() && !!localStorage.getItem(this.USER_KEY);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
