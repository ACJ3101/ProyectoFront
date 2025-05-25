import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/interfaces';
import { log } from 'console';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private baseUrl = 'http://localhost:8080/api'; // Cambia si usas otro puerto

  constructor(private http: HttpClient) { }

  // ----------------------------
  // 🔐 AUTENTICACIÓN
  // ----------------------------

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/refresh`, { refreshToken });
  }

  // ----------------------------
  // ✅ USUARIOS
  // ----------------------------

  getUsuarios(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios`, {
      headers: this.authHeaders(token)
    });
  }

  getUsuarioPorEmail(email: string): Observable<Usuario> {
    const token = localStorage.getItem('token') || '';
    const headers = this.authHeaders(token);

    // Codificar el email explícitamente
    const emailCodificado = encodeURIComponent(email);

    return this.http.get<Usuario>(
      `${this.baseUrl}/usuarios/buscarPorEmail?email=${emailCodificado}`,
      { headers }
    );
  }

  getUsuarioActual(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/me`, {
      headers: this.authHeaders(this.getToken())
    });
  }

  private getToken(): string {
    return localStorage.getItem('token') || '';
  }




  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>('http://localhost:8080/api/usuarios/crearUsuario', usuario)

  }


  // ----------------------------
  // 🛍️ PRODUCTOS
  // ----------------------------

  getProductos(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/productos`, {
      headers: this.authHeaders(token)
    });
  }

  crearProducto(data: any, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/productos`, data, {
      headers: this.authHeaders(token)
    });
  }

  // ----------------------------
  // ⚙️ UTILIDAD
  // ----------------------------

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
